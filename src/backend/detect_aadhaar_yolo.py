'''
DocVerify - Aadhaar YOLOv8 Component Detection & Crop Inference Module
Loads trained YOLOv8 weights to localize and crop key Aadhaar fields:
- aadhaar_photo
- aadhaar_qr
- aadhaar_no / aadhar_no_mask / aadhaar_no_already_masked
- aadhaar_holder_name
- aadhaar_dob
- aadhaar_gender
- aadhaar_address
- aadhaar_logo / emblem / gov_logo
'''

import os
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import cv2
import numpy as np

# Default weights location
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent / "models" / "aadhaar_yolov8n.pt"
TRAIN_RUN_WEIGHTS = Path(__file__).resolve().parent / "runs" / "aadhaar_detect" / "train_v1" / "weights" / "best.pt"

class AadhaarDetector:
    def __init__(self, model_path: Optional[str] = None):
        from ultralytics import YOLO
        
        path_to_use = None
        if model_path and Path(model_path).exists():
            path_to_use = model_path
        elif DEFAULT_MODEL_PATH.exists():
            path_to_use = str(DEFAULT_MODEL_PATH)
        elif TRAIN_RUN_WEIGHTS.exists():
            path_to_use = str(TRAIN_RUN_WEIGHTS)
        else:
            raise FileNotFoundError(
                f"Trained model not found at {DEFAULT_MODEL_PATH} or {TRAIN_RUN_WEIGHTS}. "
                "Please ensure training completes first."
            )
        
        self.model = YOLO(path_to_use)
        self.classes = self.model.names
        print(f"[AadhaarDetector] Loaded YOLOv8 model from: {path_to_use}")

    def detect(
        self,
        image: Union[str, np.ndarray],
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45,
    ) -> List[Dict]:
        results = self.model.predict(
            source=image,
            conf=conf_threshold,
            iou=iou_threshold,
            verbose=False,
        )
        
        detections = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                cls_name = self.classes.get(cls_id, f"class_{cls_id}")
                conf = float(box.conf[0].item())
                xyxy = [int(v) for v in box.xyxy[0].tolist()]
                
                detections.append({
                    "class_id": cls_id,
                    "class_name": cls_name,
                    "confidence": round(conf, 4),
                    "box": {
                        "x1": xyxy[0],
                        "y1": xyxy[1],
                        "x2": xyxy[2],
                        "y2": xyxy[3],
                        "width": xyxy[2] - xyxy[0],
                        "height": xyxy[3] - xyxy[1],
                    },
                })
        
        return detections

    def crop_components(
        self,
        image_path: str,
        detections: List[Dict],
        output_dir: Optional[str] = None,
    ) -> Dict[str, np.ndarray]:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Unable to read image at {image_path}")

        h, w = img.shape[:2]
        crops = {}

        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        for det in detections:
            cname = det["class_name"]
            b = det["box"]
            x1 = max(0, b["x1"])
            y1 = max(0, b["y1"])
            x2 = min(w, b["x2"])
            y2 = min(h, b["y2"])

            if x2 > x1 and y2 > y1:
                crop = img[y1:y2, x1:x2]
                crops[cname] = crop

                if output_dir:
                    save_path = os.path.join(output_dir, f"{cname}.png")
                    cv2.imwrite(save_path, crop)

        return crops

    def draw_detections(
        self,
        image_path: str,
        detections: List[Dict],
        output_path: Optional[str] = None,
    ) -> np.ndarray:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Unable to read image at {image_path}")

        colors = [
            (255, 99, 71),   (50, 205, 50),   (30, 144, 255),  (255, 215, 0),
            (147, 112, 219), (255, 105, 180), (0, 255, 255),   (255, 140, 0),
            (0, 206, 209),   (138, 43, 226),  (75, 0, 130),    (34, 139, 34)
        ]

        for det in detections:
            cls_id = det["class_id"]
            cname = det["class_name"]
            conf = det["confidence"]
            b = det["box"]
            x1, y1, x2, y2 = b["x1"], b["y1"], b["x2"], b["y2"]

            color = colors[cls_id % len(colors)]
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

            label = f"{cname} {conf:.2f}"
            t_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(
                img,
                (x1, max(0, y1 - 20)),
                (x1 + t_size[0] + 6, max(20, y1)),
                color,
                -1,
            )
            cv2.putText(
                img,
                label,
                (x1 + 3, max(15, y1 - 4)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                1,
                cv2.LINE_AA,
            )

        if output_path:
            os.makedirs(Path(output_path).parent, exist_ok=True)
            cv2.imwrite(output_path, img)
            print(f"[AadhaarDetector] Saved visual detection result to: {output_path}")

        return img


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Aadhaar YOLOv8 Detection Inference")
    parser.add_argument("--image", type=str, required=True, help="Path to input image")
    parser.add_argument("--model", type=str, default=None, help="Path to custom model weights")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold")
    parser.add_argument("--output", type=str, default="detected_output.png", help="Output annotated image path")
    parser.add_argument("--crop_dir", type=str, default="crops", help="Output directory for cropped components")

    args = parser.parse_args()

    detector = AadhaarDetector(args.model)
    detections = detector.detect(args.image, conf_threshold=args.conf)
    
    print(f"\n--- Detected {len(detections)} Aadhaar Components ---")
    for d in detections:
        print(f"[{d['class_name'].upper()}] Conf: {d['confidence']:.2f} | BBox: {d['box']}")

    detector.draw_detections(args.image, detections, output_path=args.output)
    detector.crop_components(args.image, detections, output_dir=args.crop_dir)
    print("Inference completed!")
