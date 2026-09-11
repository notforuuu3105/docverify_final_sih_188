"""
DocVerify Pipeline - Document Comparator
Performs dual document comparison across visual matrices (SSIM),
OCR text diffs (Levenshtein), and structured entity fields.
"""

import difflib
import uuid
from typing import Dict, Any, List, Tuple
import numpy as np
import cv2
from skimage.metrics import structural_similarity as ssim
from PIL import Image

from .extractor import extract_fields
from .ocr_engine import run_ocr
from .classifier import classify_document


def compute_image_difference(img_bgr1: np.ndarray, img_bgr2: np.ndarray) -> Tuple[float, List[Dict[str, Any]]]:
    """
    Computes visual structural similarity (SSIM) difference and locates modified regions.
    Returns:
    - similarity_percent: float (0 - 100)
    - diff_boxes: list of normalized bounding boxes {x, y, width, height, change_ratio}
    """
    h1, w1 = img_bgr1.shape[:2]
    h2, w2 = img_bgr2.shape[:2]

    # Target common dimensions
    target_w = max(w1, w2)
    target_h = max(h1, h2)

    resized1 = cv2.resize(img_bgr1, (target_w, target_h), interpolation=cv2.INTER_AREA)
    resized2 = cv2.resize(img_bgr2, (target_w, target_h), interpolation=cv2.INTER_AREA)

    gray1 = cv2.cvtColor(resized1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(resized2, cv2.COLOR_BGR2GRAY)

    # Compute SSIM
    score, diff = ssim(gray1, gray2, full=True)
    diff = (diff * 255).astype("uint8")
    similarity_percent = round(float(score) * 100.0, 1)

    # Threshold difference to locate contours of modified zones
    thresh = cv2.threshold(diff, 200, 255, cv2.THRESH_BINARY_INV)[1]
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    diff_boxes = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        area = w * h
        # Filter noise/micro variations
        if area > (target_w * target_h * 0.001):
            diff_boxes.append({
                "x": round(x / target_w, 4),
                "y": round(y / target_h, 4),
                "width": round(w / target_w, 4),
                "height": round(h / target_h, 4),
                "area_px": area,
            })

    return similarity_percent, diff_boxes


def compare_documents(
    orig_pil: Image.Image,
    orig_bgr: np.ndarray,
    orig_ocr: Dict[str, Any],
    orig_meta: Dict[str, Any],
    susp_pil: Image.Image,
    susp_bgr: np.ndarray,
    susp_ocr: Dict[str, Any],
    susp_meta: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Executes full comparative analysis:
    - SSIM visual diff
    - OCR token diff
    - Entity field discrepancy matrix
    """
    comp_id = "comp-" + uuid.uuid4().hex[:10]

    # 1. Image similarity
    img_similarity, diff_boxes = compute_image_difference(orig_bgr, susp_bgr)
    image_diff_score = round(100.0 - img_similarity, 1)

    # 2. OCR text diff
    text1 = orig_ocr.get("text", "")
    text2 = susp_ocr.get("text", "")
    matcher = difflib.SequenceMatcher(None, text1.split(), text2.split())
    text_similarity = round(matcher.ratio() * 100.0, 1)
    text_diff_score = round(100.0 - text_similarity, 1)

    # 3. Classify and Extract structured fields for both
    orig_class = classify_document(text1)
    susp_class = classify_document(text2)

    doc_type = orig_class["document_type"] if orig_class["document_type"] != "unknown" else susp_class["document_type"]

    orig_fields = extract_fields(doc_type, text1, orig_ocr.get("words", []), orig_ocr.get("lines", []))
    susp_fields = extract_fields(doc_type, text2, susp_ocr.get("words", []), susp_ocr.get("lines", []))

    orig_field_map = {f["key"]: f for f in orig_fields}
    susp_field_map = {f["key"]: f for f in susp_fields}

    all_keys = set(orig_field_map.keys()).union(set(susp_field_map.keys()))
    differences = []

    for k in all_keys:
        f_orig = orig_field_map.get(k)
        f_susp = susp_field_map.get(k)

        val_orig = f_orig["value"] if f_orig else "None (Empty)"
        val_susp = f_susp["value"] if f_susp else "None (Empty)"
        label = (f_orig or f_susp)["label"]

        orig_coords = f_orig.get("bbox", {"x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05}) if f_orig else {"x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05}
        susp_coords = f_susp.get("bbox", {"x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05}) if f_susp else {"x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05}

        if val_orig != val_susp:
            # Determine visual tag and risk severity
            if f_orig and f_susp:
                tag = "red"
                severity = "critical"
                diff_type = "modified_name" if "name" in k.lower() else "modified_field"
                desc = f"Field '{label}' altered from authentic reference."
            elif not f_orig and f_susp:
                tag = "blue"
                severity = "medium"
                diff_type = "added_element"
                desc = f"Newly inserted field '{label}' not present in master document."
            else:
                tag = "yellow"
                severity = "high"
                diff_type = "missing_element"
                desc = f"Master field '{label}' was removed or occluded in suspect submission."

            differences.append({
                "id": "diff-" + uuid.uuid4().hex[:6],
                "comparison_id": comp_id,
                "page_number": 1,
                "difference_type": diff_type,
                "visual_tag": tag,
                "risk_level": severity,
                "region_title": label,
                "original_value": str(val_orig),
                "suspected_value": str(val_susp),
                "original_coordinates": orig_coords,
                "suspected_coordinates": susp_coords,
                "description": desc,
                "created_at": "",
            })

    # If visual differences exist but field values were identical or unextracted, add visual diff entries
    if not differences and diff_boxes:
        for idx, box in enumerate(diff_boxes[:3]):
            differences.append({
                "id": "diff-vis-" + uuid.uuid4().hex[:6],
                "comparison_id": comp_id,
                "page_number": 1,
                "difference_type": "layout_shift",
                "visual_tag": "yellow",
                "risk_level": "medium",
                "region_title": f"Visual Substrate Variation Zone {idx + 1}",
                "original_value": "Baseline raster pattern",
                "suspected_value": "Pixel density variation",
                "original_coordinates": {"x": box["x"], "y": box["y"], "width": box["width"], "height": box["height"]},
                "suspected_coordinates": {"x": box["x"], "y": box["y"], "width": box["width"], "height": box["height"]},
                "description": "Localized raster pixel deviation detected by differential matrix.",
                "created_at": "",
            })

    # Overall similarity score
    composite_similarity = round((img_similarity * 0.4) + (text_similarity * 0.6), 1)

    overall_risk = "low"
    if any(d["risk_level"] == "critical" for d in differences):
        overall_risk = "critical"
    elif any(d["risk_level"] == "high" for d in differences):
        overall_risk = "high"
    elif len(differences) > 0:
        overall_risk = "medium"

    return {
        "id": comp_id,
        "status": "completed",
        "similarity_score": composite_similarity,
        "overall_risk": overall_risk,
        "text_diff_score": text_diff_score,
        "image_diff_score": image_diff_score,
        "layout_diff_score": round(100.0 - img_similarity, 1),
        "metadata_diff_score": 10.0 if (orig_meta == susp_meta) else 65.0,
        "total_differences": len(differences),
        "differences": differences,
    }
