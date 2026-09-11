"""
DocVerify - Real Lightweight YOLOv8n Multi-Document Detector & Perspective Corrector
Identifies document boundaries, classifies card types (Aadhaar, PAN, Passport, DL, Voter ID, Marksheet),
performs OpenCV 4-corner perspective warping / deskewing, and crops clean document substrates for OCR.
"""

import os
import base64
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import cv2
import numpy as np
import yaml

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = BASE_DIR / "config" / "document_classes.yaml"
TRAINED_WEIGHTS = BASE_DIR / "models" / "document_detector" / "best.pt"
RUN_WEIGHTS = BASE_DIR / "runs" / "document_detect" / "train_v1" / "weights" / "best.pt"
FALLBACK_PRETRAINED = BASE_DIR / "yolov8n.pt"

# Default classes
DEFAULT_CLASSES = ['aadhaar', 'pan', 'passport', 'driving_licence', 'voter_id', 'marksheet']


def order_points(pts: np.ndarray) -> np.ndarray:
    """
    Orders 4 polygon points in standard order:
    [top-left, top-right, bottom-right, bottom-left]
    """
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # Top-left has smallest sum
    rect[2] = pts[np.argmax(s)]  # Bottom-right has largest sum

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # Top-right has smallest difference
    rect[3] = pts[np.argmax(diff)]  # Bottom-left has largest difference

    return rect


def four_point_transform(image: np.ndarray, pts: np.ndarray) -> np.ndarray:
    """Applies OpenCV 4-point perspective transform to rectify tilted documents."""
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

    width_a = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    width_b = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    max_w = max(int(width_a), int(width_b))

    height_a = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    height_b = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    max_h = max(int(height_a), int(height_b))

    if max_w < 50 or max_h < 50:
        return image

    dst = np.array([
        [0, 0],
        [max_w - 1, 0],
        [max_w - 1, max_h - 1],
        [0, max_h - 1],
    ], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (max_w, max_h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return warped


class DocumentDetector:
    """Lightweight YOLOv8n Multi-Document Detector & Cropper."""

    def __init__(self):
        self.classes = DEFAULT_CLASSES
        self.conf_threshold = 0.40
        self.padding_ratio = 0.035
        self.model = None

        self._load_config()
        self._load_model()

    def _load_config(self):
        if CONFIG_PATH.exists():
            try:
                with open(CONFIG_PATH, "r") as f:
                    cfg = yaml.safe_load(f)
                    if cfg and "names" in cfg:
                        if isinstance(cfg["names"], dict):
                            self.classes = [cfg["names"][k] for k in sorted(cfg["names"].keys())]
                        elif isinstance(cfg["names"], list):
                            self.classes = cfg["names"]
                    if cfg and "confidence_threshold" in cfg:
                        self.conf_threshold = float(cfg["confidence_threshold"])
                    if cfg and "padding_ratio" in cfg:
                        self.padding_ratio = float(cfg["padding_ratio"])
            except Exception as e:
                print(f"[DocumentDetector] Config read notice: {e}")

    def _load_model(self):
        from ultralytics import YOLO

        model_path = None
        if TRAINED_WEIGHTS.exists():
            model_path = str(TRAINED_WEIGHTS)
        elif RUN_WEIGHTS.exists():
            model_path = str(RUN_WEIGHTS)
        elif FALLBACK_PRETRAINED.exists():
            model_path = str(FALLBACK_PRETRAINED)

        if model_path:
            try:
                self.model = YOLO(model_path)
                print(f"[DocumentDetector] Loaded YOLOv8n model from: {model_path}")
            except Exception as e:
                print(f"[DocumentDetector] Model load warning: {e}")
                self.model = None
        else:
            print("[DocumentDetector] Pretrained weights not yet found. Heuristic fallback active.")

    def reload_model_if_available(self):
        """Reloads model if training newly completed."""
        if TRAINED_WEIGHTS.exists() and (self.model is None or getattr(self.model, "ckpt_path", "") != str(TRAINED_WEIGHTS)):
            self._load_model()

    def detect_documents(self, image_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs YOLOv8n inference on image to locate all document bounding boxes.
        Returns list of detected document dictionaries.
        """
        self.reload_model_if_available()

        if image_bgr is None or image_bgr.size == 0:
            return []

        h, w = image_bgr.shape[:2]
        detections = []

        if self.model is not None:
            try:
                results = self.model.predict(
                    source=image_bgr,
                    conf=self.conf_threshold,
                    iou=0.45,
                    imgsz=512,
                    device="cpu",
                    verbose=False,
                )

                for r in results:
                    for box in r.boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        xyxy = [int(v) for v in box.xyxy[0].tolist()]

                        class_name = self.classes[cls_id] if cls_id < len(self.classes) else f"class_{cls_id}"

                        x1 = max(0, xyxy[0])
                        y1 = max(0, xyxy[1])
                        x2 = min(w, xyxy[2])
                        y2 = min(h, xyxy[3])
                        bw = x2 - x1
                        bh = y2 - y1

                        if bw > 30 and bh > 30:
                            box_aspect = float(bw) / float(max(1, bh))
                            cov_area = float(bw * bh) / float(w * h)

                            # Reject near-square full-frame boxes: Standard Indian credentials (ID-1 or A4/sheet)
                            # are strictly rectangular (ratio 1.20-2.15 landscape or 0.55-0.88 portrait).
                            # Near-square boxes (0.88 <= ratio <= 1.18) covering > 55% of the frame are arbitrary photos.
                            if cov_area > 0.55 and (0.88 <= box_aspect <= 1.18):
                                continue

                            # Substrate texture / edge density check: rejects textureless gradients, solid blocks, or blank noise
                            sub_crop = image_bgr[y1:y2, x1:x2]
                            if sub_crop.size > 0:
                                sub_gray = cv2.cvtColor(sub_crop, cv2.COLOR_BGR2GRAY)
                                sub_edges = cv2.Canny(sub_gray, 40, 120)
                                edge_ratio = float(np.count_nonzero(sub_edges)) / float(bw * bh)
                                if edge_ratio < 0.006:  # Genuine credentials have text/photo edges
                                    continue

                            detections.append({
                                "class_id": cls_id,
                                "class_name": class_name,
                                "document_type": class_name.upper(),
                                "confidence": round(conf, 4),
                                "bbox": {
                                    "x1": x1,
                                    "y1": y1,
                                    "x2": x2,
                                    "y2": y2,
                                    "width": bw,
                                    "height": bh,
                                    "area": bw * bh,
                                    "normalized": {
                                        "x": round(x1 / float(w), 4),
                                        "y": round(y1 / float(h), 4),
                                        "width": round(bw / float(w), 4),
                                        "height": round(bh / float(h), 4),
                                    },
                                },
                            })
            except Exception as e:
                print(f"[DocumentDetector] Inference exception: {e}")

        # Fallback: If no sub-region bounding box was detected by YOLO (e.g. clean full-bleed card scan),
        # evaluate contour boundary or full-canvas credential geometry & typography density
        if not detections:
            contour_doc = self._detect_document_contour(image_bgr)
            if contour_doc:
                detections.append(contour_doc)
            else:
                aspect = float(w) / float(max(1, h))
                if (1.18 <= aspect <= 2.15) or (0.55 <= aspect <= 0.88):
                    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
                    edges = cv2.Canny(gray, 40, 120)
                    edge_density = float(np.count_nonzero(edges)) / float(w * h)
                    # Real credentials have at least 1% edge content from text, seals, or photos
                    if edge_density >= 0.010:
                        detections.append({
                            "class_id": 99,
                            "class_name": "document",
                            "document_type": "DOCUMENT",
                            "confidence": 0.85,
                            "is_full_canvas": True,
                            "bbox": {
                                "x1": 0,
                                "y1": 0,
                                "x2": w,
                                "y2": h,
                                "width": w,
                                "height": h,
                                "area": w * h,
                                "normalized": {
                                    "x": 0.0,
                                    "y": 0.0,
                                    "width": 1.0,
                                    "height": 1.0,
                                },
                            },
                        })

        # Sort detections by confidence descending
        detections.sort(key=lambda d: d.get("confidence", 0.0), reverse=True)
        return detections

    def _detect_document_contour(self, image_bgr: np.ndarray) -> Optional[Dict[str, Any]]:
        """OpenCV contour-based document boundary detector fallback."""
        h, w = image_bgr.shape[:2]
        total_area = float(w * h)

        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edged = cv2.Canny(blurred, 50, 150)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        dilated = cv2.dilate(edged, kernel, iterations=2)

        cnts, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not cnts:
            return None

        # Sort contours by area
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:5]
        best_cnt = None

        for c in cnts:
            area = cv2.contourArea(c)
            if 0.12 * total_area <= area <= 0.98 * total_area:
                bx, by, bw, bh = cv2.boundingRect(c)
                aspect = bw / float(max(1, bh))
                # Document aspect ratio typically 1.18 to 2.15 (horizontal card) or 0.55 to 0.88 (vertical/passport)
                if (1.18 <= aspect <= 2.15) or (0.55 <= aspect <= 0.88):
                    best_cnt = (bx, by, bw, bh)
                    break

        if best_cnt:
            bx, by, bw, bh = best_cnt
            return {
                "class_id": 99,
                "class_name": "unknown",
                "document_type": "UNKNOWN",
                "confidence": 0.65,
                "is_heuristic": True,
                "bbox": {
                    "x1": bx,
                    "y1": by,
                    "x2": bx + bw,
                    "y2": by + bh,
                    "width": bw,
                    "height": bh,
                    "area": bw * bh,
                    "normalized": {
                        "x": round(bx / float(w), 4),
                        "y": round(by / float(h), 4),
                        "width": round(bw / float(w), 4),
                        "height": round(bh / float(h), 4),
                    },
                },
            }
        return None

    def crop_and_correct(
        self,
        image_bgr: np.ndarray,
        bbox: Dict[str, Any],
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Crops document region, applies OpenCV 4-corner perspective warping or deskewing,
        and resizes cleanly for downstream OCR.
        """
        h, w = image_bgr.shape[:2]
        x1, y1 = bbox["x1"], bbox["y1"]
        x2, y2 = bbox["x2"], bbox["y2"]

        # Add configurable padding
        pad_x = int((x2 - x1) * self.padding_ratio)
        pad_y = int((y2 - y1) * self.padding_ratio)

        crop_x1 = max(0, x1 - pad_x)
        crop_y1 = max(0, y1 - pad_y)
        crop_x2 = min(w, x2 + pad_x)
        crop_y2 = min(h, y2 + pad_y)

        cropped = image_bgr[crop_y1:crop_y2, crop_x1:crop_x2]
        if cropped.size == 0:
            return image_bgr, {"applied": False, "method": "fallback_full_canvas"}

        # Attempt 4-Corner Perspective Transformation within crop
        ch, cw = cropped.shape[:2]
        c_gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
        c_blur = cv2.GaussianBlur(c_gray, (5, 5), 0)
        c_edge = cv2.Canny(c_blur, 50, 150)
        c_dil = cv2.dilate(c_edge, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)), iterations=2)

        cnts, _ = cv2.findContours(c_dil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        warped = None
        correction_meta = {"applied": False, "method": "bbox_crop", "skew_angle": 0.0}

        if cnts:
            c = max(cnts, key=cv2.contourArea)
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)

            # If 4 convex corners detected, check that it covers full card bounds and has true perspective distortion
            if len(approx) == 4 and cv2.isContourConvex(approx) and cv2.contourArea(approx) > 0.50 * (cw * ch):
                pts = approx.reshape(4, 2)
                min_x, max_x = np.min(pts[:, 0]), np.max(pts[:, 0])
                min_y, max_y = np.min(pts[:, 1]), np.max(pts[:, 1])
                span_w = (max_x - min_x) / float(cw)
                span_h = (max_y - min_y) / float(ch)

                # Check if quadrilateral is non-rectangular / tilted (to avoid destructive crops on already rectangular cards)
                side_lens = [
                    float(np.linalg.norm(pts[0] - pts[1])),
                    float(np.linalg.norm(pts[1] - pts[2])),
                    float(np.linalg.norm(pts[2] - pts[3])),
                    float(np.linalg.norm(pts[3] - pts[0])),
                ]
                opp_diff_1 = abs(side_lens[0] - side_lens[2]) / max(1.0, max(side_lens[0], side_lens[2]))
                opp_diff_2 = abs(side_lens[1] - side_lens[3]) / max(1.0, max(side_lens[1], side_lens[3]))
                has_perspective_distortion = (opp_diff_1 > 0.05 or opp_diff_2 > 0.05)

                if span_w >= 0.88 and span_h >= 0.88 and has_perspective_distortion:
                    try:
                        warped = four_point_transform(cropped, pts)
                        correction_meta = {
                            "applied": True,
                            "method": "perspective_warp",
                            "corners_detected": True,
                            "skew_angle": 0.0,
                        }
                    except Exception:
                        warped = None

            # Fallback: minAreaRect deskew
            if warped is None and len(c) >= 5:
                rect = cv2.minAreaRect(c)
                angle = rect[-1]
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle

                if 0.5 < abs(angle) < 40.0:
                    M = cv2.getRotationMatrix2D((cw // 2, ch // 2), angle, 1.0)
                    warped = cv2.warpAffine(cropped, M, (cw, ch), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                    correction_meta = {
                        "applied": True,
                        "method": "min_area_rect_deskew",
                        "corners_detected": False,
                        "skew_angle": round(float(angle), 1),
                    }

        result_img = warped if warped is not None else cropped

        # Normalize crop resolution for optimal Tesseract OCR accuracy (optimal target width ~1000px)
        rh, rw = result_img.shape[:2]
        if rw > 0:
            if rw < 950:
                scale = min(2.5, 1000.0 / float(rw))
                result_img = cv2.resize(result_img, (0, 0), fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            elif rw > 1150:
                scale = 1000.0 / float(rw)
                result_img = cv2.resize(result_img, (0, 0), fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

        return result_img, correction_meta

    def process_image(
        self,
        image_bgr: np.ndarray,
        quality_score: float = 85.0,
    ) -> Dict[str, Any]:
        """
        Master detection and cropping entrypoint.
        Returns structured detection output matching PS 188 specification.
        """
        if image_bgr is None or image_bgr.size == 0:
            return {
                "document_detected": False,
                "document_type": "UNKNOWN",
                "confidence": 0.0,
                "bounding_box": None,
                "all_detected_documents": [],
                "multiple_documents_detected": False,
                "cropped_document": None,
                "cropped_image_bgr": None,
                "quality_score": 0.0,
                "perspective_correction": {"applied": False, "method": "none"},
                "message": "Invalid or unreadable image uploaded",
            }

        # Encode original image canvas as base64 JPEG (scaled to max 1200px for web payload efficiency)
        h_orig, w_orig = image_bgr.shape[:2]
        if max(h_orig, w_orig) > 1200:
            scale = 1200.0 / float(max(h_orig, w_orig))
            orig_disp = cv2.resize(image_bgr, (int(w_orig * scale), int(h_orig * scale)), interpolation=cv2.INTER_AREA)
        else:
            orig_disp = image_bgr
        _, orig_buf = cv2.imencode(".jpg", orig_disp, [cv2.IMWRITE_JPEG_QUALITY, 85])
        original_b64 = "data:image/jpeg;base64," + base64.b64encode(orig_buf).decode("utf-8")

        detections = self.detect_documents(image_bgr)

        if not detections:
            return {
                "document_detected": False,
                "document_type": "UNKNOWN",
                "confidence": 0.0,
                "bounding_box": None,
                "all_detected_documents": [],
                "multiple_documents_detected": False,
                "original_document": original_b64,
                "cropped_document": None,
                "cropped_image_bgr": None,
                "quality_score": quality_score,
                "perspective_correction": {"applied": False, "method": "none"},
                "message": "No supported document detected. Please upload a clear image of an official credential.",
            }

        # Select primary document (highest confidence * area)
        primary = max(detections, key=lambda d: d.get("confidence", 0.0) * d["bbox"].get("area", 1))

        # Crop and apply perspective correction
        cropped_bgr, corr_meta = self.crop_and_correct(image_bgr, primary["bbox"])

        # Encode cropped document as base64 JPEG
        _, buf = cv2.imencode(".jpg", cropped_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
        cropped_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")

        doc_type = primary["document_type"]
        conf_pct = round(primary["confidence"] * 100.0, 1)

        multi_detected = len(detections) > 1
        multi_msg = f" ({len(detections)} credentials detected in frame)" if multi_detected else ""

        return {
            "document_detected": True,
            "document_type": doc_type,
            "confidence": primary["confidence"],
            "bounding_box": primary["bbox"],
            "all_detected_documents": [
                {
                    "type": d["document_type"],
                    "confidence": d["confidence"],
                    "bbox": d["bbox"],
                }
                for d in detections
            ],
            "multiple_documents_detected": multi_detected,
            "original_document": original_b64,
            "cropped_document": cropped_b64,
            "cropped_image_bgr": cropped_bgr,
            "quality_score": quality_score,
            "perspective_correction": corr_meta,
            "message": f"{doc_type} detected successfully ({conf_pct}% confidence){multi_msg}",
        }


# Global singleton instance
_document_detector_instance: Optional[DocumentDetector] = None


def get_document_detector() -> DocumentDetector:
    global _document_detector_instance
    if _document_detector_instance is None:
        _document_detector_instance = DocumentDetector()
    return _document_detector_instance
