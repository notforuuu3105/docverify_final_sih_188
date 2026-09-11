"""
DocVerify Pipeline - OCR Engine
Extracts full text, lines, words, confidences, and normalized bounding box coordinates.
Connects through high-fidelity Tesseract engine (via node bridge or pytesseract fallback).
"""

import os
import sys
import json
import subprocess
import tempfile
from typing import Dict, Any, List
from PIL import Image

BRIDGE_SCRIPT = os.path.abspath(os.path.join(os.path.dirname(__file__), "ocr_bridge.cjs"))


def normalize_box(box_dict: Dict[str, int], img_width: int, img_height: int) -> Dict[str, float]:
    """Converts absolute pixel box {x0, y0, x1, y1} to normalized ratios {x, y, width, height}."""
    if not box_dict or img_width <= 0 or img_height <= 0:
        return {"x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0}

    x0 = max(0, box_dict.get("x0", 0))
    y0 = max(0, box_dict.get("y0", 0))
    x1 = min(img_width, box_dict.get("x1", 0))
    y1 = min(img_height, box_dict.get("y1", 0))

    norm_x = round(x0 / img_width, 4)
    norm_y = round(y0 / img_height, 4)
    norm_w = round(max(0, x1 - x0) / img_width, 4)
    norm_h = round(max(0, y1 - y0) / img_height, 4)

    return {
        "x": norm_x,
        "y": norm_y,
        "width": norm_w,
        "height": norm_h,
    }


def run_ocr(image_pil: Image.Image) -> Dict[str, Any]:
    """
    Executes OCR on a PIL Image.
    Returns normalized text structure and word boxes.
    """
    width, height = image_pil.size

    # Save to temporary file for bridge execution
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
        image_pil.save(tmp_path, format="PNG")

    try:
        # Check Node.js path
        node_cmd = "node"
        node_candidates = [
            r"C:\Users\Hp\nodejs\node.exe",
            "node"
        ]
        for c in node_candidates:
            if os.path.exists(c):
                node_cmd = c
                break

        # Run bridge process
        env = os.environ.copy()
        if os.path.exists(r"C:\Users\Hp\nodejs"):
            env["PATH"] = r"C:\Users\Hp\nodejs;" + env.get("PATH", "")

        proc = subprocess.run(
            [node_cmd, BRIDGE_SCRIPT, tmp_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=40,
            env=env
        )

        if proc.returncode != 0 or not proc.stdout.strip():
            # Fallback text if OCR process encountered an unexpected issue
            return {
                "text": "",
                "confidence": 0,
                "words": [],
                "lines": [],
                "ocr_status": "error",
                "raw_output": proc.stderr
            }

        data = json.loads(proc.stdout.strip())

        # Normalize bounding boxes
        normalized_words = []
        for w in data.get("words", []):
            bbox = w.get("bbox")
            norm = normalize_box(bbox, width, height) if bbox else {"x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0}
            normalized_words.append({
                "text": w.get("text", ""),
                "confidence": w.get("confidence", 0),
                "bbox": norm,
                "raw_bbox": bbox
            })

        normalized_lines = []
        for l in data.get("lines", []):
            bbox = l.get("bbox")
            norm = normalize_box(bbox, width, height) if bbox else {"x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0}
            normalized_lines.append({
                "text": l.get("text", ""),
                "confidence": l.get("confidence", 0),
                "bbox": norm,
                "raw_bbox": bbox
            })

        return {
            "text": data.get("text", ""),
            "confidence": data.get("confidence", 0),
            "words": normalized_words,
            "lines": normalized_lines,
            "ocr_status": "success",
            "word_count": len(normalized_words),
            "line_count": len(normalized_lines),
        }

    except Exception as e:
        return {
            "text": "",
            "confidence": 0,
            "words": [],
            "lines": [],
            "ocr_status": "exception",
            "error": str(e)
        }
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
