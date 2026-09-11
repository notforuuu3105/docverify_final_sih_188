"""
DocVerify Pipeline - Document Classifier
Multi-signal classification combining OCR text keyword vectors,
structural layout ratios, and pattern matching.
Classes: pan, aadhaar, driving_licence, passport, academic, invoice, unknown.
"""

import re
from typing import Dict, Any, List


# Weighted keyword lexicons for Indian document types
KEYWORD_RULES = {
    "pan": {
        "strong": [
            "income tax department",
            "permanent account number",
            "govt. of india",
            "govt of india",
            "father's name",
            "fathers name",
            "date of birth",
            "hologram",
            "incometax",
        ],
        "patterns": [
            r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",  # PAN regex
        ],
        "weight": 1.25,
    },
    "aadhaar": {
        "strong": [
            "unique identification authority of india",
            "government of india",
            "govt of india",
            "mera aadhaar",
            "meri pehchaan",
            "uidai",
            "enrollment no",
            "proof of identity",
            "aadhaar",
            "aadhar",
            "vid :",
            "help@uidai.gov.in",
            "1947",
            "resident",
            "आधार",
            "भारत सरकार",
            "जन्म तिथि",
            "पुरुष",
            "महिला",
        ],
        "patterns": [
            r"\b\d{4}\s*\d{4}\s*\d{4}\b",  # 12-digit Aadhaar UID
            r"\b[X*x]{4}\s*[X*x]{4}\s*\d{4}\b",  # Masked Aadhaar
            r"\b\d{12}\b",
        ],
        "weight": 1.3,
    },
    "voter_id": {
        "strong": [
            "election commission of india",
            "elector's photo identity card",
            "electors photo identity card",
            "bharat nirvachan aayog",
            "identity card",
            "elector name",
            "epic no",
            "voter id",
            "निर्वाचन आयोग",
        ],
        "patterns": [
            r"\b[A-Z]{3}[0-9]{7}\b",  # Standard EPIC number
            r"\b[A-Z]{2}/[0-9]{2,3}/[0-9]{3}/[0-9]{6}\b",
        ],
        "weight": 1.2,
    },
    "driving_licence": {
        "strong": [
            "driving licence",
            "driving license",
            "transport department",
            "union of india",
            "motor vehicles",
            "valid till",
            "non-transport",
            "dl no",
            "sarathi",
            "licence to drive",
        ],
        "patterns": [
            r"\b[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{7}\b",
            r"\b[A-Z]{2}[0-9]{2}[0-9A-Z]{11}\b",  # Standard Indian DL format
        ],
        "weight": 1.15,
    },
    "passport": {
        "strong": [
            "republic of india",
            "passport",
            "ministry of external affairs",
            "nationality indian",
            "given name",
            "surname",
            "passport no",
            "place of issue",
            "place of birth",
        ],
        "patterns": [
            r"P<IND[A-Z<]+",  # Machine readable zone (MRZ)
            r"\b[A-Z][0-9]{7}\b",  # Passport number
        ],
        "weight": 1.2,
    },
    "academic": {
        "strong": [
            "institute of technology",
            "university",
            "bachelor of",
            "master of",
            "roll number",
            "registration number",
            "degree of",
            "cgpa",
            "marksheet",
            "board of secondary education",
            "semester",
            "grade card",
        ],
        "patterns": [
            r"cgpa\s*:\s*\d+\.\d+",
            r"roll\s*(?:no|number)",
        ],
        "weight": 1.0,
    },
    "invoice": {
        "strong": [
            "tax invoice",
            "commercial invoice",
            "billed to",
            "invoice details",
            "subtotal",
            "total due",
            "wire instructions",
            "po number",
            "gstin",
        ],
        "patterns": [
            r"inv-[0-9a-z\-]+",
            r"\$\d+[\d,]*\.\d{2}",
            r"₹\s*\d+[\d,]*",
        ],
        "weight": 1.0,
    },
}


def classify_document(ocr_text: str, aspect_ratio: float = 1.0) -> Dict[str, Any]:
    """
    Classifies the document into a recognized category.
    Returns:
    - document_type: str
    - confidence: float (0 - 100)
    - matched_features: List[str]
    - rationale: str
    - scores: Dict[str, float]
    """
    text_lower = ocr_text.lower()
    scores = {}
    matched_features_map = {}

    for doc_type, rules in KEYWORD_RULES.items():
        score = 0.0
        matches = []

        # Strong keyword matches
        for kw in rules["strong"]:
            if kw in text_lower:
                score += 25.0
                matches.append(f"Keyword: '{kw}'")

        # Pattern matches
        for pat in rules.get("patterns", []):
            if re.search(pat, ocr_text, re.IGNORECASE):
                score += 35.0
                matches.append(f"Pattern matched: {pat}")

        # Aspect ratio heuristics (Cards vs Full-page sheets)
        if doc_type in ["pan", "aadhaar", "driving_licence", "voter_id"] and 1.2 <= aspect_ratio <= 1.9:
            score += 10.0

        # Degree / Invoices are typically portrait ~ 0.7
        if doc_type in ["academic", "invoice"] and 0.6 <= aspect_ratio <= 0.85:
            score += 10.0

        score *= rules.get("weight", 1.0)
        scores[doc_type] = round(score, 1)
        matched_features_map[doc_type] = matches

    # Select best candidate
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_type, top_score = sorted_scores[0]

    # Minimum threshold for confidence
    if top_score < 25.0:
        return {
            "document_type": "unknown",
            "confidence": 15.0,
            "matched_features": [],
            "rationale": "Insufficient identifying typographic keywords or structural anchors located.",
            "scores": scores,
        }

    # Normalize top score to max 99.0
    normalized_conf = min(99.0, max(50.0, round(top_score, 1)))

    rationale_text = (
        f"Identified as {top_type.replace('_', ' ').title()} based on {len(matched_features_map[top_type])} "
        f"characteristic typographic features and layout geometry."
    )

    return {
        "document_type": top_type,
        "confidence": normalized_conf,
        "matched_features": matched_features_map[top_type],
        "rationale": rationale_text,
        "scores": scores,
    }
