"""
DocVerify - Two-Source Biometric Face Verification Pipeline
SIH 2026 Problem Statement: SIH26188 (AI-Based Fake Identity & Document Screening System)

Architecture:
1. Source A: Document Face Extraction (Localization, Crop, Normalization)
2. Source B: Live Presented Person Capture (Webcam, Framing, Quality Gate)
3. Facial Landmark Alignment (5 key points: eyes, nose, mouth corners)
4. Deep Feature Extraction (128-dimensional ArcFace SFace embedding)
5. Metric Similarity Evaluation (Cosine similarity + Euclidean L2 norm)
6. Guardrails: Multiple face detection, Blur/Lighting quality gates, Micro-motion Liveness
"""

import os
import sys
import base64
import numpy as np
import cv2
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

# Resolve model paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models"))
YUNET_PATH = os.path.join(MODELS_DIR, "face_detection_yunet.onnx")
SFACE_PATH = os.path.join(MODELS_DIR, "face_recognition_sface_2021dec.onnx")

# Standard calibration thresholds
COSINE_MATCH_THRESHOLD = 0.363  # OpenCV SFace reference threshold on LFW
COSINE_UNCERTAIN_LOW = 0.250     # Below this is clear mismatch
MIN_FACE_SIZE_PX = 36            # Minimum width/height in pixels
BLUR_LAPLACIAN_THRESHOLD = 30.0  # Variance below this indicates severe blur
MIN_BRIGHTNESS = 30.0            # Below this indicates underexposure
MAX_BRIGHTNESS = 235.0           # Above this indicates washed-out/overexposure


class FaceVerifier:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FaceVerifier, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.yunet_available = os.path.exists(YUNET_PATH)
        self.sface_available = os.path.exists(SFACE_PATH)
        self.recognizer = None

        if self.sface_available:
            try:
                self.recognizer = cv2.FaceRecognizerSF.create(SFACE_PATH, "")
                print("[FaceVerifier] OpenCV SFace ArcFace model initialized successfully.")
            except Exception as e:
                print(f"[FaceVerifier] Warning: Could not initialize SFace: {e}")

        if not self.yunet_available:
            print(f"[FaceVerifier] Warning: YuNet model not found at {YUNET_PATH}")

        self._initialized = True

    def _get_detector(self, width: int, height: int, score_threshold: float = 0.5):
        """Create a YuNet detector instance configured for the given image dimensions."""
        if not self.yunet_available:
            return None
        return cv2.FaceDetectorYN.create(YUNET_PATH, "", (width, height), score_threshold=score_threshold)

    def detect_faces(self, img_bgr: np.ndarray, score_threshold: float = 0.5) -> List[np.ndarray]:
        """
        Detect all faces in an image using YuNet.
        Returns a list of 15-element numpy arrays representing faces.
        Each face array format: [x, y, w, h, x_re, y_re, x_le, y_le, x_nt, y_nt, x_rc, y_rc, x_lc, y_lc, score]
        """
        if img_bgr is None or img_bgr.size == 0:
            return []

        h, w = img_bgr.shape[:2]
        detector = self._get_detector(w, h, score_threshold=score_threshold)
        if detector is None:
            return []

        try:
            _, faces = detector.detect(img_bgr)
            if faces is not None and len(faces) > 0:
                return [f for f in faces]
            return []
        except Exception as e:
            print(f"[FaceVerifier] Detection error: {e}")
            return []

    def check_face_quality(self, img_bgr: np.ndarray, face: np.ndarray, is_document: bool = False) -> Dict[str, Any]:
        """
        Evaluate facial image quality:
        - Resolution / size
        - Blur (Laplacian variance)
        - Illumination / brightness
        """
        h, w = img_bgr.shape[:2]
        fx, fy, fw, fh = float(face[0]), float(face[1]), float(face[2]), float(face[3])
        x1 = max(0, int(fx))
        y1 = max(0, int(fy))
        x2 = min(w, int(fx + fw))
        y2 = min(h, int(fy + fh))

        crop = img_bgr[y1:y2, x1:x2]
        if crop.size == 0:
            return {
                "passed": False,
                "blur_score": 0.0,
                "is_blurry": True,
                "brightness": 0.0,
                "lighting_status": "POOR",
                "resolution": [0, 0],
                "issues": ["Face crop boundary empty"]
            }

        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        blur_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        brightness = float(np.mean(gray))

        # Document prints/halftones have naturally lower Laplacian variance than live camera frames
        blur_threshold = 12.0 if is_document else 18.0

        issues = []
        is_blurry = blur_var < blur_threshold
        if is_blurry:
            issues.append(f"Image blurred (Laplacian variance: {round(blur_var, 1)} < {blur_threshold})")

        lighting_status = "OPTIMAL"
        if brightness < MIN_BRIGHTNESS:
            lighting_status = "TOO_DARK"
            issues.append(f"Insufficient illumination (mean intensity: {round(brightness, 1)} < {MIN_BRIGHTNESS})")
        elif brightness > MAX_BRIGHTNESS:
            lighting_status = "OVEREXPOSED"
            issues.append(f"Overexposed or washed out (mean intensity: {round(brightness, 1)} > {MAX_BRIGHTNESS})")

        if fw < MIN_FACE_SIZE_PX or fh < MIN_FACE_SIZE_PX:
            issues.append(f"Face resolution too small ({int(fw)}x{int(fh)} < {MIN_FACE_SIZE_PX}px)")

        passed = len(issues) == 0

        return {
            "passed": passed,
            "blur_score": round(blur_var, 1),
            "is_blurry": is_blurry,
            "brightness": round(brightness, 1),
            "lighting_status": lighting_status,
            "resolution": [int(fw), int(fh)],
            "issues": issues
        }

        passed = len(issues) == 0

        return {
            "passed": passed,
            "blur_score": round(blur_var, 1),
            "is_blurry": is_blurry,
            "brightness": round(brightness, 1),
            "lighting_status": lighting_status,
            "resolution": [int(fw), int(fh)],
            "issues": issues
        }

    def extract_aligned_face_and_feature(
        self, img_bgr: np.ndarray, face: np.ndarray
    ) -> Tuple[Optional[np.ndarray], Optional[np.ndarray], Optional[str]]:
        """
        Align the face using 5 facial landmarks and extract 128-d deep embedding.
        Returns: (aligned_bgr, embedding_vector, base64_jpeg_data_url)
        """
        if self.recognizer is None:
            return None, None, None

        try:
            # SFace alignCrop rotates, scales, and aligns eyes horizontally to 112x112
            aligned_face = self.recognizer.alignCrop(img_bgr, face)
            feature = self.recognizer.feature(aligned_face)

            # Generate base64 crop for frontend inspection
            _, buf = cv2.imencode(".jpg", aligned_face, [cv2.IMWRITE_JPEG_QUALITY, 92])
            b64_str = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")

            return aligned_face, feature, b64_str
        except Exception as e:
            print(f"[FaceVerifier] Feature extraction error: {e}")
            return None, None, None

    def check_liveness_burst(self, frames_bgr: List[np.ndarray]) -> Dict[str, Any]:
        """
        Analyze multi-frame burst for natural micro-movement & texture variance.
        Detects static printed photos or screen replays presented to the webcam.
        """
        if not frames_bgr or len(frames_bgr) < 2:
            return {
                "tested": False,
                "status": "UNVERIFIED",
                "details": "Single frame capture provided; multi-frame burst recommended for anti-spoofing."
            }

        diffs = []
        for i in range(len(frames_bgr) - 1):
            f1 = cv2.cvtColor(frames_bgr[i], cv2.COLOR_BGR2GRAY)
            f2 = cv2.cvtColor(frames_bgr[i + 1], cv2.COLOR_BGR2GRAY)

            # Resize to uniform 240x240 for fast difference calculation
            f1 = cv2.resize(f1, (240, 240))
            f2 = cv2.resize(f2, (240, 240))

            diff = cv2.absdiff(f1, f2)
            mean_diff = float(np.mean(diff))
            diffs.append(mean_diff)

        avg_diff = float(np.mean(diffs))

        # Static printout held in front of webcam has practically zero variance (< 0.6)
        if avg_diff < 0.5:
            return {
                "tested": True,
                "status": "FAILED",
                "details": f"Static image presentation suspected (zero micro-movement detected: {round(avg_diff, 2)}).",
                "variance": round(avg_diff, 3)
            }
        elif avg_diff > 90.0:
            return {
                "tested": True,
                "status": "FAILED",
                "details": "Excessive camera shake or rapid transition detected.",
                "variance": round(avg_diff, 3)
            }
        else:
            return {
                "tested": True,
                "status": "PASSED",
                "details": f"Natural physiological micro-movement verified (variance: {round(avg_diff, 2)}).",
                "variance": round(avg_diff, 3)
            }

    def verify(
        self,
        document_bgr: np.ndarray,
        live_bgr: np.ndarray,
        live_frames: Optional[List[np.ndarray]] = None
    ) -> Dict[str, Any]:
        """
        Master Two-Source Verification Pipeline:
        1. Document Face Detection & Quality
        2. Live Person Face Detection & Quality
        3. Multiple-face rejection
        4. Alignment & Deep ArcFace Embedding
        5. Cosine Metric & Percentage Calibration
        6. Liveness Evaluation
        7. Audit Record Creation
        """
        reasons = []

        # Validate input buffers
        if document_bgr is None or document_bgr.size == 0:
            return {
                "success": False,
                "error": "DOCUMENT_IMAGE_INVALID",
                "message": "Document image buffer is empty or unreadable.",
                "verdict": "REJECTED"
            }

        if live_bgr is None or live_bgr.size == 0:
            return {
                "success": False,
                "error": "LIVE_IMAGE_INVALID",
                "message": "Live camera capture buffer is empty or unreadable.",
                "verdict": "REJECTED"
            }

        # Step 1: Detect Document Faces
        doc_faces = self.detect_faces(document_bgr, score_threshold=0.50)
        doc_face_count = len(doc_faces)

        if doc_face_count == 0:
            return {
                "success": True,
                "document_face_detected": False,
                "live_face_detected": False,
                "document_faces_count": 0,
                "live_faces_count": 0,
                "similarity_score": 0.0,
                "cosine_metric": 0.0,
                "l2_metric": 0.0,
                "threshold": COSINE_MATCH_THRESHOLD,
                "threshold_percentage": 68.0,
                "verdict": "DOCUMENT_FACE_NOT_DETECTED",
                "confidence": "HIGH",
                "message": "No cardholder portrait was detected on the document substrate.",
                "reasons": ["Document does not contain a discernible cardholder photograph."]
            }

        # Step 2: Detect Live Camera Faces
        live_faces = self.detect_faces(live_bgr, score_threshold=0.50)
        live_face_count = len(live_faces)

        if live_face_count == 0:
            return {
                "success": True,
                "document_face_detected": True,
                "live_face_detected": False,
                "document_faces_count": doc_face_count,
                "live_faces_count": 0,
                "similarity_score": 0.0,
                "cosine_metric": 0.0,
                "l2_metric": 0.0,
                "threshold": COSINE_MATCH_THRESHOLD,
                "threshold_percentage": 68.0,
                "verdict": "LIVE_FACE_NOT_DETECTED",
                "confidence": "HIGH",
                "message": "No face was detected in the live camera stream.",
                "reasons": ["Applicant face not visible in camera viewport."]
            }

        # Step 3: Multiple Face Protection
        if live_face_count > 1:
            return {
                "success": True,
                "document_face_detected": True,
                "live_face_detected": True,
                "document_faces_count": doc_face_count,
                "live_faces_count": live_face_count,
                "similarity_score": 0.0,
                "cosine_metric": 0.0,
                "l2_metric": 0.0,
                "threshold": COSINE_MATCH_THRESHOLD,
                "threshold_percentage": 68.0,
                "verdict": "MULTIPLE_FACES_DETECTED",
                "confidence": "HIGH",
                "message": f"Security restriction: {live_face_count} faces detected in camera. Exactly 1 person must be presented.",
                "reasons": [f"Multiple individuals ({live_face_count}) in camera frame violates 1:1 biometric protocol."]
            }

        primary_doc_face = doc_faces[0]
        primary_live_face = live_faces[0]

        # Step 4: Quality Checks
        doc_quality = self.check_face_quality(document_bgr, primary_doc_face, is_document=True)
        live_quality = self.check_face_quality(live_bgr, primary_live_face, is_document=False)

        if not live_quality["passed"]:
            reasons.extend([f"Live capture: {iss}" for iss in live_quality["issues"]])

        # If live image is severely degraded, reject or flag
        if live_quality["is_blurry"] or live_quality["lighting_status"] == "TOO_DARK":
            return {
                "success": True,
                "document_face_detected": True,
                "live_face_detected": True,
                "document_faces_count": doc_face_count,
                "live_faces_count": live_face_count,
                "similarity_score": 0.0,
                "cosine_metric": 0.0,
                "l2_metric": 0.0,
                "threshold": COSINE_MATCH_THRESHOLD,
                "threshold_percentage": 68.0,
                "verdict": "QUALITY_CHECK_FAILED",
                "confidence": "HIGH",
                "quality": {
                    "document_face": doc_quality,
                    "live_face": live_quality
                },
                "message": "Live face quality is insufficient for verification. Please adjust lighting and face position.",
                "reasons": reasons
            }

        # Step 5: Extract Alignments & Deep Embeddings
        doc_aligned, doc_feat, doc_b64 = self.extract_aligned_face_and_feature(document_bgr, primary_doc_face)
        live_aligned, live_feat, live_b64 = self.extract_aligned_face_and_feature(live_bgr, primary_live_face)

        if doc_feat is None or live_feat is None:
            return {
                "success": False,
                "error": "EMBEDDING_FAILED",
                "message": "Failed to compute deep feature embeddings for one or both faces.",
                "verdict": "ERROR"
            }

        # Step 6: Similarity Computation
        cosine_metric = float(self.recognizer.match(doc_feat, live_feat, cv2.FaceRecognizerSF_FR_COSINE))
        l2_metric = float(self.recognizer.match(doc_feat, live_feat, cv2.FaceRecognizerSF_FR_NORM_L2))

        # Calibrate raw cosine score to intuitive 0-100 percentage
        # In SFace, cosine >= 0.363 is official threshold (approx 70-98%)
        if cosine_metric <= 0:
            similarity = max(5.0, round(float(10.0 + cosine_metric * 10.0), 1))
        elif cosine_metric < COSINE_MATCH_THRESHOLD:
            # Map [0, 0.363) to [10%, 68%)
            similarity = round(10.0 + (cosine_metric / COSINE_MATCH_THRESHOLD) * 58.0, 1)
        else:
            # Map [0.363, 0.70] to [68%, 98.5%]
            scaled = 68.0 + ((cosine_metric - COSINE_MATCH_THRESHOLD) / (0.65 - COSINE_MATCH_THRESHOLD)) * 30.5
            similarity = round(min(99.2, scaled), 1)

        # Step 7: Liveness Validation
        liveness_result = {"tested": False, "status": "NOT_TESTED", "details": "Single frame capture evaluated."}
        if live_frames and len(live_frames) >= 2:
            liveness_result = self.check_liveness_burst(live_frames)

        # Step 8: Final Decision
        if cosine_metric >= COSINE_MATCH_THRESHOLD:
            verdict = "MATCH"
            confidence = "HIGH" if cosine_metric >= 0.45 else "MEDIUM"
            reasons.append(f"Deep embedding cosine similarity ({round(cosine_metric, 3)}) exceeds verification threshold ({COSINE_MATCH_THRESHOLD}).")
        elif cosine_metric >= COSINE_UNCERTAIN_LOW:
            verdict = "REVIEW_REQUIRED"
            confidence = "LOW"
            reasons.append(f"Biometric similarity ({similarity}%) falls in ambiguous margin. Officer inspection required.")
        else:
            verdict = "NO_MATCH"
            confidence = "HIGH"
            reasons.append(f"Biometric similarity ({similarity}%) indicates significant facial feature divergence. High risk of impersonation.")

        if liveness_result.get("status") == "FAILED":
            verdict = "LIVENESS_FAILED"
            confidence = "HIGH"
            reasons.append(f"Anti-spoofing check failed: {liveness_result.get('details')}")

        return {
            "success": True,
            "document_face_detected": True,
            "live_face_detected": True,
            "document_faces_count": doc_face_count,
            "live_faces_count": live_face_count,
            "similarity_score": similarity,
            "cosine_metric": round(cosine_metric, 4),
            "l2_metric": round(l2_metric, 4),
            "threshold": COSINE_MATCH_THRESHOLD,
            "threshold_percentage": 68.0,
            "verdict": verdict,
            "confidence": confidence,
            "liveness": liveness_result,
            "quality": {
                "document_face": doc_quality,
                "live_face": live_quality
            },
            "document_face_crop": doc_b64,
            "live_face_crop": live_b64,
            "reasons": reasons,
            "audit": {
                "protocol": "SIH26188-1:1-BIOMETRIC-MATCH",
                "detector": "OpenCV YuNet (ResNet-50 5-Point)",
                "recognizer": "OpenCV SFace (ArcFace 128-d CNN)",
                "cosine_metric": round(cosine_metric, 4),
                "timestamp": datetime.now().isoformat()
            }
        }


# Singleton instance
face_verifier = FaceVerifier()
