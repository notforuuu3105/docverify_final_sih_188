"""
DocVerify Pipeline - Preprocessor
Ingests JPG, PNG, PDF files, validates format and integrity, assesses document quality,
computes Laplacian sharpness, and corrects skew/rotation.
"""

import os
import io
import hashlib
from typing import Tuple, Dict, Any
import numpy as np
import cv2
from PIL import Image
from pypdf import PdfReader


def compute_sha256(file_bytes: bytes) -> str:
    """Computes SHA-256 cryptographic digest of raw file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()


def load_document_image(file_bytes: bytes, filename: str) -> Tuple[np.ndarray, Image.Image, Dict[str, Any]]:
    """
    Ingests file bytes (JPG, PNG, PDF), returns numpy array (BGR), PIL Image (RGB),
    and metadata dictionary.
    """
    ext = os.path.splitext(filename)[1].lower()
    page_count = 1
    pdf_metadata = {}

    if ext == ".pdf":
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)
            if reader.metadata:
                pdf_metadata = {
                    "author": reader.metadata.author,
                    "creator": reader.metadata.creator,
                    "producer": reader.metadata.producer,
                    "creation_date": str(reader.metadata.creation_date) if reader.metadata.creation_date else None,
                    "mod_date": str(reader.metadata.modification_date) if reader.metadata.modification_date else None,
                }

            # Extract first image from PDF page or render fallback
            page = reader.pages[0]
            extracted_images = list(page.images)
            if extracted_images:
                pil_img = Image.open(io.BytesIO(extracted_images[0].data)).convert("RGB")
            else:
                # PDF has vector/text without embedded raster: synthesize page canvas
                pil_img = Image.new("RGB", (900, 1200), color=(255, 255, 255))
        except Exception as e:
            # Fallback if PDF parsing fails
            pil_img = Image.new("RGB", (900, 1200), color=(255, 255, 255))
    else:
        pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")

    # Convert to OpenCV BGR
    img_np_rgb = np.array(pil_img)
    img_bgr = cv2.cvtColor(img_np_rgb, cv2.COLOR_RGB2BGR)

    return img_bgr, pil_img, {"page_count": page_count, "pdf_metadata": pdf_metadata}


def assess_quality(img_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Assesses image quality indicators:
    - Laplacian variance (sharpness/blurriness)
    - Brightness (mean pixel intensity)
    - Contrast (standard deviation)
    - Resolution check
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    height, width = gray.shape

    # 1. Laplacian sharpness
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = laplacian_var < 80.0
    sharpness_score = min(100.0, round((laplacian_var / 300.0) * 100.0, 1))

    # 2. Brightness & Contrast
    mean_brightness = float(np.mean(gray))
    std_contrast = float(np.std(gray))
    is_dark = mean_brightness < 45.0
    is_overexposed = mean_brightness > 235.0
    is_low_contrast = std_contrast < 22.0

    # 3. Resolution
    is_low_res = width < 400 or height < 300
    dpi_estimate = round(max(width, height) / 11.0, 0)  # estimate based on ~11 inch doc

    # Overall image quality score (0 to 100)
    quality_score = 100.0
    if is_blurry:
        quality_score -= 35.0
    if is_dark or is_overexposed:
        quality_score -= 20.0
    if is_low_contrast:
        quality_score -= 15.0
    if is_low_res:
        quality_score -= 25.0

    quality_score = max(10.0, round(quality_score, 1))

    return {
        "width": width,
        "height": height,
        "sharpness_variance": round(laplacian_var, 1),
        "sharpness_score": sharpness_score,
        "is_blurry": is_blurry,
        "mean_brightness": round(mean_brightness, 1),
        "std_contrast": round(std_contrast, 1),
        "is_dark": is_dark,
        "is_overexposed": is_overexposed,
        "is_low_contrast": is_low_contrast,
        "is_low_res": is_low_res,
        "dpi_estimate": dpi_estimate,
        "overall_quality_score": quality_score,
    }


def deskew_image(img_bgr: np.ndarray) -> Tuple[np.ndarray, float]:
    """
    Estimates document rotation angle and deskews if necessary.
    Returns deskewed image and detected angle in degrees.
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    # Threshold to find edges/text lines
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    # Find coordinates of all white pixels
    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) < 100:
        return img_bgr, 0.0

    rect = cv2.minAreaRect(coords)
    angle = rect[-1]

    # Adjust minAreaRect convention
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    # Filter out extreme rotations
    if abs(angle) > 40.0:
        angle = 0.0

    # If angle is minimal, skip rotation
    if abs(angle) < 0.4:
        return img_bgr, 0.0

    (h, w) = img_bgr.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(img_bgr, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    return rotated, round(float(angle), 2)


def detect_and_crop_card(img_bgr: np.ndarray) -> Tuple[np.ndarray, bool]:
    """
    Detects if the image is a mobile phone photo or screenshot containing an ID card
    surrounded by extraneous borders, chat UI, or background, and crops to the card.
    """
    h, w = img_bgr.shape[:2]
    aspect = w / float(max(1, h))

    # If image is a tall mobile screenshot or portrait photo (aspect < 0.95 or aspect > 2.2):
    if aspect < 0.95 or aspect > 2.2:
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.threshold(blur, 100, 255, cv2.THRESH_BINARY)[1]
        cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        best_box = None
        max_area = 0
        total_area = w * h

        for c in cnts:
            area = cv2.contourArea(c)
            # Card should occupy between 10% and 88% of full image
            if 0.10 * total_area <= area <= 0.88 * total_area:
                bx, by, bw, bh = cv2.boundingRect(c)
                card_aspect = bw / float(max(1, bh))
                if 1.0 <= card_aspect <= 2.0:
                    if area > max_area:
                        max_area = area
                        best_box = (bx, by, bw, bh)

        if best_box:
            bx, by, bw, bh = best_box
            pad = int(bw * 0.03)
            y0 = max(0, by - pad)
            y1 = min(h, by + bh + pad)
            x0 = max(0, bx - pad)
            x1 = min(w, bx + bw + pad)
            crop = img_bgr[y0:y1, x0:x1]

            # Upscale if cropped card resolution is small for sharper OCR
            if crop.shape[1] < 1200:
                scale = min(2.5, 1400.0 / max(1, crop.shape[1]))
                crop = cv2.resize(crop, (0, 0), fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            return crop, True

    return img_bgr, False


def enhance_contrast(img_bgr: np.ndarray) -> np.ndarray:
    """Applies CLAHE on luminance channel if contrast is degraded."""
    try:
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    except Exception:
        return img_bgr


def preprocess_document(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Master preprocessing routine:
    1. SHA-256 checksum calculation
    2. Document ingestion
    3. Auto-crop card if inside screenshot/photo
    4. Image quality inspection
    5. Deskewing
    6. Adaptive contrast enhancement (CLAHE)
    """
    sha256_hash = compute_sha256(file_bytes)
    img_bgr, pil_img, meta = load_document_image(file_bytes, filename)

    # Note: Credential detection & cropping is handled by YOLOv8n DocumentDetector in verification_engine
    card_bgr, was_cropped = img_bgr, False

    quality = assess_quality(card_bgr)
    deskewed_bgr, skew_angle = deskew_image(card_bgr)

    # Enhance contrast if low contrast or dark
    if quality.get("is_low_contrast") or quality.get("is_dark"):
        deskewed_bgr = enhance_contrast(deskewed_bgr)

    # Convert deskewed back to PIL for OCR
    deskewed_rgb = cv2.cvtColor(deskewed_bgr, cv2.COLOR_BGR2RGB)
    processed_pil = Image.fromarray(deskewed_rgb)

    return {
        "sha256_hash": sha256_hash,
        "filename": filename,
        "file_size": len(file_bytes),
        "image_bgr": deskewed_bgr,
        "image_pil": processed_pil,
        "original_width": quality["width"],
        "original_height": quality["height"],
        "quality": quality,
        "skew_angle": skew_angle,
        "pdf_metadata": meta.get("pdf_metadata", {}),
        "page_count": meta.get("page_count", 1),
        "was_auto_cropped": was_cropped,
    }
