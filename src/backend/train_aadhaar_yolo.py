"""
DocVerify - YOLOv8 Aadhaar Component Detection Training Script
Trains a custom object detection model to localize 12 key Aadhaar fields:
['aadhaar_address', 'aadhaar_dob', 'aadhaar_gender', 'aadhaar_holder_name',
 'aadhaar_logo', 'aadhaar_no', 'aadhaar_no_already_masked', 'aadhaar_photo',
 'aadhaar_qr', 'aadhar_no_mask', 'emblem', 'gov_logo']
"""

import os
import sys
import shutil
import argparse
from pathlib import Path

def train_yolo(
    data_yaml: str,
    epochs: int = 10,
    batch_size: int = 16,
    img_size: int = 640,
    model_name: str = "yolov8n.pt",
    workers: int = 4,
    device: str = "cpu",
    project: str = None,
    name: str = "aadhaar_yolov8n",
):
    from ultralytics import YOLO

    print("=" * 70)
    print("DocVerify - YOLOv8 Aadhaar Component Detection Model Training")
    print(f"Dataset YAML : {data_yaml}")
    print(f"Model        : {model_name}")
    print(f"Epochs       : {epochs}")
    print(f"Batch Size   : {batch_size}")
    print(f"Image Size   : {img_size}")
    print(f"Device       : {device}")
    print(f"Workers      : {workers}")
    print("=" * 70)

    # 1. Initialize YOLO model (pretrained on COCO)
    model = YOLO(model_name)

    # 2. Run training
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        device=device,
        workers=workers,
        project=project,
        name=name,
        save=True,
        val=True,
        plots=True,
        exist_ok=True,
    )

    print("\n" + "=" * 70)
    print("TRAINING FINISHED! Evaluating on Validation Split...")
    print("=" * 70)

    # 3. Validation metrics
    val_results = model.val()
    print(f"mAP50    : {val_results.box.map50:.4f}")
    print(f"mAP50-95 : {val_results.box.map:.4f}")

    # 4. Copy best.pt to backend models directory
    weights_path = Path(project) / name / "weights" / "best.pt"
    if weights_path.exists():
        target_dir = Path(__file__).resolve().parent / "models"
        target_dir.mkdir(exist_ok=True)
        dest_model = target_dir / "aadhaar_yolov8n.pt"
        shutil.copy(weights_path, dest_model)
        print(f"Exported best model weights to: {dest_model}")

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv8 on Aadhaar Dataset")
    parser.add_argument(
        "--data",
        type=str,
        default=r"C:\Users\Hp\Downloads\aadhar_detection_2.v1i.yolov8\data.yaml",
        help="Path to data.yaml",
    )
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (8 or 16 for CPU)")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image size")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Pretrained model")
    parser.add_argument("--workers", type=int, default=4, help="Data loader workers")
    parser.add_argument("--device", type=str, default="cpu", help="Device (cpu or 0)")
    parser.add_argument(
        "--project",
        type=str,
        default=str(Path(__file__).resolve().parent / "runs" / "aadhaar_detect"),
        help="Output project directory",
    )
    parser.add_argument("--name", type=str, default="train_v1", help="Experiment name")

    args = parser.parse_args()
    train_yolo(
        data_yaml=args.data,
        epochs=args.epochs,
        batch_size=args.batch,
        img_size=args.imgsz,
        model_name=args.model,
        workers=args.workers,
        device=args.device,
        project=args.project,
        name=args.name,
    )
