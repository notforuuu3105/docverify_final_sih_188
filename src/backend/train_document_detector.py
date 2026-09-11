"""
DocVerify - Lightweight YOLOv8n Multi-Document Detector Training Script
Assembles a compact, balanced 6-class dataset (~170 images) from existing local downloads
and trains a lightweight YOLOv8n model optimized for CPU inference and SIH 2026 PS 188 demonstration.

Target Classes:
0: aadhaar
1: pan
2: passport
3: driving_licence
4: voter_id
5: marksheet
"""

import os
import sys
import glob
import shutil
import random
from pathlib import Path
import cv2
import numpy as np
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "data" / "document_dataset"
SRC_DOWNLOADS = Path("C:/Users/Hp/Downloads/identity-card-classifier.v1-multiclass-640x640-data-aug-3-.yolov8")
DEGREE_SAMPLE = BASE_DIR.parent.parent / "data" / "demo_samples" / "05_academic_degree.png"
MODELS_DIR = BASE_DIR / "models" / "document_detector"

# Remap from source dataset classes ['aadhar', 'driver-license', 'pan', 'passport', 'voter']
CLASS_MAP = {
    0: 0,  # aadhar -> aadhaar
    1: 3,  # driver-license -> driving_licence
    2: 1,  # pan -> pan
    3: 2,  # passport -> passport
    4: 4,  # voter -> voter_id
}

CLASS_NAMES = ['aadhaar', 'pan', 'passport', 'driving_licence', 'voter_id', 'marksheet']


def prepare_dataset():
    """Assembles a compact, balanced multi-document dataset."""
    print("=" * 70)
    print("STEP 1: Assembling Compact Multi-Document Dataset for YOLOv8n...")
    print("=" * 70)

    # Setup directories
    for split in ["train", "valid"]:
        (DATASET_DIR / split / "images").mkdir(parents=True, exist_ok=True)
        (DATASET_DIR / split / "labels").mkdir(parents=True, exist_ok=True)

    # 1. Process identity-card-classifier dataset with class balancing (~25-35 per class)
    if SRC_DOWNLOADS.exists():
        for split in ["train", "valid"]:
            src_lbls = glob.glob(str(SRC_DOWNLOADS / split / "labels" / "*.txt"))
            print(f"Filtering balanced dataset from {SRC_DOWNLOADS / split} ({len(src_lbls)} candidates)...")

            max_per_class = 35 if split == "train" else 8
            class_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

            # Shuffle candidates for diversity
            random.seed(42)
            random.shuffle(src_lbls)

            for lbl_path in src_lbls:
                img_name = Path(lbl_path).stem + ".jpg"
                img_path = SRC_DOWNLOADS / split / "images" / img_name
                if not img_path.exists():
                    continue

                # Read labels
                with open(lbl_path, "r") as f:
                    lines = [line.strip().split() for line in f if line.strip()]

                new_lines = []
                primary_target = None
                for parts in lines:
                    try:
                        orig_cls = int(parts[0])
                        if orig_cls in CLASS_MAP:
                            target_cls = CLASS_MAP[orig_cls]
                            new_lines.append(f"{target_cls} " + " ".join(parts[1:]))
                            if primary_target is None:
                                primary_target = target_cls
                    except Exception:
                        continue

                if new_lines and primary_target is not None:
                    if class_counts[primary_target] < max_per_class:
                        class_counts[primary_target] += 1
                        dest_img = DATASET_DIR / split / "images" / img_name
                        dest_lbl = DATASET_DIR / split / "labels" / (Path(lbl_path).stem + ".txt")

                        shutil.copy(img_path, dest_img)
                        with open(dest_lbl, "w") as f:
                            f.write("\n".join(new_lines) + "\n")

            print(f"Selected {split} class distribution: {class_counts}")
    else:
        print(f"Warning: Source dataset {SRC_DOWNLOADS} not found.")

    # 2. Add Marksheet / Degree Certificate images (Class 5)
    print("Adding augmented marksheet / degree specimens for Class 5 (marksheet)...")
    if DEGREE_SAMPLE.exists():
        base_degree = cv2.imread(str(DEGREE_SAMPLE))
        if base_degree is not None:
            # Generate 16 augmented marksheet samples (12 train, 4 valid)
            for idx in range(16):
                split = "valid" if idx >= 12 else "train"
                h, w = base_degree.shape[:2]

                # Augmentation: slight rotation (-10 to 10 deg), scaling, brightness
                angle = random.uniform(-8.0, 8.0)
                scale = random.uniform(0.80, 0.95)
                bright = random.uniform(0.85, 1.15)

                canvas = np.ones((640, 640, 3), dtype=np.uint8) * random.randint(180, 230)

                # Resize degree to fit canvas
                new_w = int(640 * scale)
                new_h = int((new_w / w) * h)
                if new_h > 600:
                    new_h = 600
                    new_w = int((new_h / h) * w)

                resized = cv2.resize(base_degree, (new_w, new_h))
                resized = np.clip(resized.astype(np.float32) * bright, 0, 255).astype(np.uint8)

                # Rotate
                M = cv2.getRotationMatrix2D((new_w // 2, new_h // 2), angle, 1.0)
                rotated = cv2.warpAffine(resized, M, (new_w, new_h), borderValue=(220, 220, 220))

                # Place onto canvas
                x_offset = max(0, (640 - new_w) // 2 + random.randint(-15, 15))
                y_offset = max(0, (640 - new_h) // 2 + random.randint(-15, 15))
                x_offset = min(640 - new_w, x_offset)
                y_offset = min(640 - new_h, y_offset)

                canvas[y_offset:y_offset + new_h, x_offset:x_offset + new_w] = rotated

                # Normalized bbox for marksheet
                bx = (x_offset + new_w / 2.0) / 640.0
                by = (y_offset + new_h / 2.0) / 640.0
                bw = new_w / 640.0
                bh = new_h / 640.0

                out_stem = f"marksheet_specimen_aug_{idx:02d}"
                cv2.imwrite(str(DATASET_DIR / split / "images" / f"{out_stem}.jpg"), canvas)
                with open(DATASET_DIR / split / "labels" / f"{out_stem}.txt", "w") as f:
                    f.write(f"5 {bx:.6f} {by:.6f} {bw:.6f} {bh:.6f}\n")

    # 3. Write data.yaml with absolute paths
    data_yaml_path = DATASET_DIR / "data.yaml"
    with open(data_yaml_path, "w") as f:
        f.write(f"path: {DATASET_DIR.as_posix()}\n")
        f.write("train: train/images\n")
        f.write("val: valid/images\n")
        f.write("nc: 6\n")
        f.write(f"names: {CLASS_NAMES}\n")

    train_count = len(glob.glob(str(DATASET_DIR / "train" / "images" / "*.*")))
    val_count = len(glob.glob(str(DATASET_DIR / "valid" / "images" / "*.*")))
    print(f"Dataset ready: {train_count} train images, {val_count} valid images.")
    print(f"YAML config written to: {data_yaml_path}")
    return str(data_yaml_path)


def train_detector(data_yaml_path: str, epochs: int = 25, batch_size: int = 4):
    """Trains lightweight YOLOv8n on the curated dataset using CPU."""
    print("\n" + "=" * 70)
    print("STEP 2: Training Lightweight YOLOv8n Multi-Document Detector...")
    print(f"Epochs     : {epochs}")
    print(f"Batch Size : {batch_size}")
    print(f"Resolution : 512")
    print(f"Device     : CPU (AMD Ryzen 5)")
    print("=" * 70)

    pretrained_model = BASE_DIR / "yolov8n.pt"
    model = YOLO(str(pretrained_model) if pretrained_model.exists() else "yolov8n.pt")

    results = model.train(
        data=data_yaml_path,
        epochs=epochs,
        batch=batch_size,
        imgsz=512,
        device="cpu",
        workers=2,
        cache=False,
        project=str(BASE_DIR / "runs" / "document_detect"),
        name="train_v1",
        patience=15,
        save=True,
        val=True,
        plots=True,
        exist_ok=True,
        verbose=True,
    )

    print("\n" + "=" * 70)
    print("STEP 3: Validating Trained Model...")
    print("=" * 70)
    metrics = model.val()
    print(f"Precision  : {metrics.box.mp:.4f}")
    print(f"Recall     : {metrics.box.mr:.4f}")
    print(f"mAP50      : {metrics.box.map50:.4f}")
    print(f"mAP50-95   : {metrics.box.map:.4f}")

    # Copy best weights to models/document_detector/best.pt
    best_weights = BASE_DIR / "runs" / "document_detect" / "train_v1" / "weights" / "best.pt"
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    target_weights = MODELS_DIR / "best.pt"

    if best_weights.exists():
        shutil.copy(best_weights, target_weights)
        print(f"\nSUCCESS: Exported trained weights to {target_weights} ({os.path.getsize(target_weights)} bytes)")
    else:
        print(f"Notice: best.pt not found at {best_weights}")

    return metrics


if __name__ == "__main__":
    yaml_path = prepare_dataset()
    train_detector(yaml_path, epochs=25, batch_size=4)
