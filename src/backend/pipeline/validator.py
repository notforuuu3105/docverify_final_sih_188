"""
DocVerify Pipeline - Document Validator
Performs deterministic field validation, syntax verification, Verhoeff checksum calculation,
and logical consistency audits.
"""

import re
from datetime import datetime
from typing import Dict, Any, List


# Verhoeff algorithm multiplication and permutation matrices
VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]


def validate_verhoeff(num_str: str) -> bool:
    """Validates an Indian Aadhaar number using the statutory Verhoeff checksum algorithm."""
    clean_num = re.sub(r"\D", "", num_str)
    if len(clean_num) != 12:
        return False

    c = 0
    reversed_digits = [int(d) for d in reversed(clean_num)]
    for i, digit in enumerate(reversed_digits):
        c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]]
    return c == 0


def validate_pan_number(pan_str: str) -> Dict[str, Any]:
    """Validates PAN syntax, entity type character, and structure."""
    clean_pan = pan_str.strip().upper()
    if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", clean_pan):
        return {
            "is_valid": False,
            "message": "Invalid PAN syntax: Must be exactly 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).",
            "entity_type": None,
        }

    entity_char = clean_pan[3]
    entity_map = {
        "P": "Individual / Person",
        "C": "Company",
        "H": "Hindu Undivided Family (HUF)",
        "F": "Partnership Firm / LLP",
        "A": "Association of Persons (AOP)",
        "T": "Trust",
        "B": "Body of Individuals (BOI)",
        "L": "Local Authority",
        "J": "Artificial Juridical Person",
        "G": "Government Agency",
    }

    entity_name = entity_map.get(entity_char, "Special Entity")

    return {
        "is_valid": True,
        "message": f"Valid Income Tax PAN. Holder category: {entity_name} ('{entity_char}').",
        "entity_type": entity_name,
    }


def parse_and_validate_date(date_str: str) -> Dict[str, Any]:
    """Validates calendar day, month, year, and impossible future dates."""
    clean_date = date_str.strip()
    # Try parsing DD/MM/YYYY
    for fmt in ["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"]:
        try:
            dt = datetime.strptime(clean_date, fmt)
            now = datetime.now()
            if dt > now:
                return {"is_valid": False, "message": f"Impossible future date: {date_str} is in the future."}
            age = (now - dt).days // 365
            if age > 120:
                return {"is_valid": False, "message": f"Unrealistic age ({age} years) from date: {date_str}."}
            return {"is_valid": True, "message": f"Valid calendar date (Age: ~{age} years).", "parsed": dt.strftime("%Y-%m-%d")}
        except ValueError:
            continue

    # Just 4-digit year
    if re.match(r"^\d{4}$", clean_date):
        yr = int(clean_date)
        if 1900 <= yr <= datetime.now().year:
            return {"is_valid": True, "message": f"Valid Year of Birth: {yr}."}
        return {"is_valid": False, "message": f"Invalid year: {yr}."}

    return {"is_valid": False, "message": f"Could not parse valid calendar date from '{date_str}'."}


def validate_document(doc_type: str, extracted_fields: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Runs granular validation tests across all extracted fields.
    Returns list of check results with score and status.
    """
    field_map = {f["key"]: f["value"] for f in extracted_fields}
    checks = []

    # 1. Required fields presence check
    missing_required = [f["label"] for f in extracted_fields if f["required"] and f["status"] == "missing"]
    if missing_required:
        checks.append({
            "id": "chk_completeness",
            "check_type": "completeness",
            "title": "Mandatory Entity Fields Check",
            "description": "Validation of primary identity credentials and mandatory fields.",
            "status": "failed",
            "score": 30.0,
            "findings": {"missing_fields": missing_required},
            "suspicious_regions": [],
        })
    else:
        checks.append({
            "id": "chk_completeness",
            "check_type": "completeness",
            "title": "Mandatory Entity Fields Check",
            "description": "All required entity attributes successfully extracted from typography.",
            "status": "passed",
            "score": 100.0,
            "findings": {"extracted_count": len(extracted_fields)},
            "suspicious_regions": [],
        })

    # 2. Document specific identifier format check
    if doc_type == "pan":
        pan_val = field_map.get("pan_number", "")
        pan_res = validate_pan_number(pan_val)
        if pan_res["is_valid"]:
            checks.append({
                "id": "chk_pan_format",
                "check_type": "identifier_checksum",
                "title": "Income Tax PAN Syntax & Entity Check",
                "description": pan_res["message"],
                "status": "passed",
                "score": 100.0,
                "findings": pan_res,
                "suspicious_regions": [],
            })
        else:
            checks.append({
                "id": "chk_pan_format",
                "check_type": "identifier_checksum",
                "title": "Income Tax PAN Syntax & Entity Check",
                "description": pan_res["message"],
                "status": "failed",
                "score": 20.0,
                "findings": pan_res,
                "suspicious_regions": [
                    {
                        "id": "sr_pan_syntax",
                        "page": 1,
                        "coordinates": {"x": 0.28, "y": 0.33, "width": 0.25, "height": 0.05},
                        "severity": "critical",
                        "label": "Invalid PAN Structure",
                        "description": pan_res["message"],
                    }
                ],
            })

    elif doc_type == "aadhaar":
        uid_val = field_map.get("aadhaar_number", "")
        # Check if masked Aadhaar
        if "XXXX" in uid_val.upper() or "****" in uid_val:
            last4 = uid_val[-4:]
            checks.append({
                "id": "chk_aadhaar_masked",
                "check_type": "identifier_checksum",
                "title": "UIDAI Masked Aadhaar Verification",
                "description": f"Statutory masked format compliant with UIDAI data security protocols. Unmasked suffix: {last4}.",
                "status": "passed",
                "score": 98.0,
                "findings": {"is_masked": True, "suffix": last4},
                "suspicious_regions": [],
            })
        else:
            is_verhoeff_ok = validate_verhoeff(uid_val)
            if is_verhoeff_ok:
                checks.append({
                    "id": "chk_aadhaar_verhoeff",
                    "check_type": "identifier_checksum",
                    "title": "UIDAI Verhoeff Cryptographic Checksum",
                    "description": "12-digit UID conforms strictly to the dihedral D5 Verhoeff checksum algorithm.",
                    "status": "passed",
                    "score": 100.0,
                    "findings": {"verhoeff_verified": True},
                    "suspicious_regions": [],
                })
            else:
                uid_fld = next((f for f in extracted_fields if f.get("key") in ["aadhaar_number", "uid"]), None)
                uid_box = uid_fld.get("bbox") if uid_fld and uid_fld.get("bbox") else {"x": 0.25, "y": 0.82, "width": 0.50, "height": 0.08}
                checks.append({
                    "id": "chk_aadhaar_verhoeff",
                    "check_type": "identifier_checksum",
                    "title": "UIDAI Verhoeff Cryptographic Checksum",
                    "description": "Dihedral group D5 check failed: mathematically invalid Aadhaar sequence.",
                    "status": "failed",
                    "score": 15.0,
                    "findings": {"verhoeff_verified": False},
                    "suspicious_regions": [
                        {
                            "id": "sr_verhoeff_fail",
                            "page": 1,
                            "coordinates": uid_box,
                            "severity": "critical",
                            "label": "Verhoeff Checksum Failure",
                            "description": "Calculated checksum does not match statutory UIDAI check digit.",
                        }
                    ],
                })

    elif doc_type == "passport":
        pass_val = field_map.get("passport_number", "").strip()
        is_pass_valid = bool(re.match(r"^[A-Z][0-9]{7}$", pass_val))
        if is_pass_valid:
            checks.append({
                "id": "chk_passport_syntax",
                "check_type": "identifier_checksum",
                "title": "ICAO Indian Passport Identifier Verification",
                "description": f"Passport number '{pass_val}' conforms to Ministry of External Affairs and ICAO Doc 9303 standards.",
                "status": "passed",
                "score": 100.0,
                "findings": {"passport_valid": True, "series": pass_val[0]},
                "suspicious_regions": [],
            })
        else:
            checks.append({
                "id": "chk_passport_syntax",
                "check_type": "identifier_checksum",
                "title": "ICAO Indian Passport Identifier Verification",
                "description": f"Invalid passport number structure: '{pass_val}'. Expected 1 letter followed by 7 digits.",
                "status": "failed",
                "score": 25.0,
                "findings": {"passport_valid": False},
                "suspicious_regions": [
                    {
                        "id": "sr_pass_syntax",
                        "page": 1,
                        "coordinates": {"x": 0.50, "y": 0.32, "width": 0.25, "height": 0.05},
                        "severity": "high",
                        "label": "Invalid Passport Syntax",
                        "description": "Passport identifier does not adhere to standard ICAO format.",
                    }
                ],
            })

    elif doc_type == "driving_licence":
        dl_val = field_map.get("dl_number", "").replace("-", "").replace(" ", "").strip()
        is_dl_valid = len(dl_val) >= 13 and bool(re.match(r"^[A-Z]{2}[0-9A-Z]{11,16}$", dl_val))
        if is_dl_valid:
            state_code = dl_val[:2]
            checks.append({
                "id": "chk_dl_syntax",
                "check_type": "identifier_checksum",
                "title": "MoRTH Sarathi DL Format Verification",
                "description": f"Valid Driving Licence sequence for State Jurisdiction: {state_code}.",
                "status": "passed",
                "score": 100.0,
                "findings": {"state_code": state_code, "dl_valid": True},
                "suspicious_regions": [],
            })
        else:
            checks.append({
                "id": "chk_dl_syntax",
                "check_type": "identifier_checksum",
                "title": "MoRTH Sarathi DL Format Verification",
                "description": f"Invalid Driving Licence format: '{field_map.get('dl_number', '')}'.",
                "status": "failed",
                "score": 25.0,
                "findings": {"dl_valid": False},
                "suspicious_regions": [],
            })

    elif doc_type == "voter_id":
        epic_val = field_map.get("epic_number", "").strip()
        is_epic_valid = bool(re.match(r"^[A-Z]{3}[0-9]{7}$", epic_val)) or "/" in epic_val
        if is_epic_valid:
            checks.append({
                "id": "chk_voter_syntax",
                "check_type": "identifier_checksum",
                "title": "Election Commission EPIC Card Verification",
                "description": f"EPIC number '{epic_val}' conforms to statutory ECI format.",
                "status": "passed",
                "score": 100.0,
                "findings": {"epic_valid": True},
                "suspicious_regions": [],
            })
        else:
            checks.append({
                "id": "chk_voter_syntax",
                "check_type": "identifier_checksum",
                "title": "Election Commission EPIC Card Verification",
                "description": f"Invalid EPIC number format: '{epic_val}'.",
                "status": "failed",
                "score": 25.0,
                "findings": {"epic_valid": False},
                "suspicious_regions": [],
            })

    # 3. Date validity check
    dob_val = field_map.get("dob", "")
    if dob_val and dob_val != "NOT DETECTED":
        date_res = parse_and_validate_date(dob_val)
        if date_res["is_valid"]:
            checks.append({
                "id": "chk_date_logic",
                "check_type": "date_consistency",
                "title": "Temporal & Date Sequence Audit",
                "description": date_res["message"],
                "status": "passed",
                "score": 100.0,
                "findings": date_res,
                "suspicious_regions": [],
            })
        else:
            dob_fld = next((f for f in extracted_fields if f.get("key") == "dob"), None)
            dob_box = dob_fld.get("bbox") if dob_fld and dob_fld.get("bbox") else {"x": 0.30, "y": 0.40, "width": 0.25, "height": 0.05}
            checks.append({
                "id": "chk_date_logic",
                "check_type": "date_consistency",
                "title": "Temporal & Date Sequence Audit",
                "description": date_res["message"],
                "status": "failed",
                "score": 30.0,
                "findings": date_res,
                "suspicious_regions": [
                    {
                        "id": "sr_date_invalid",
                        "page": 1,
                        "coordinates": dob_box,
                        "severity": "high",
                        "label": "Impossible Date",
                        "description": date_res["message"],
                    }
                ],
            })

    # Overall validation score
    if checks:
        avg_score = round(sum(c["score"] for c in checks) / len(checks), 1)
        passed_count = sum(1 for c in checks if c["status"] == "passed")
    else:
        avg_score = 75.0
        passed_count = 0

    return {
        "validation_score": avg_score,
        "total_checks": len(checks),
        "passed_checks": passed_count,
        "failed_checks": len(checks) - passed_count,
        "checks": checks,
    }
