"""
SIH 2026 Problem Statement: SIH26188 (AI Document Verification & Anti-Fraud Platform)
Comprehensive Automated Test Suite: Two-Source Face Verification Pipeline

Tests all 7 scenarios specified in SIH requirements:
TEST 1: Same person's document + same person's live face -> MATCH
TEST 2: Person A document + Person B live face -> NO_MATCH
TEST 3: Document without detectable portrait -> DOCUMENT_FACE_NOT_DETECTED
TEST 4: Camera without face -> LIVE_FACE_NOT_DETECTED
TEST 5: Multiple people in camera frame -> MULTIPLE_FACES_DETECTED
TEST 6: Degraded / blurred camera capture -> QUALITY_CHECK_FAILED
TEST 7: Static photo replay attack -> LIVENESS_FAILED
"""

import sys
import os
import cv2
import numpy as np

# Ensure backend root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pipeline.face_verifier import face_verifier


def run_all_tests():
    print("=" * 70)
    print("SIH 2026 BIOMETRIC FACE VERIFICATION TEST SUITE (7 SCENARIOS)")
    print("Protocol: SIH26188 - Two-Source 1:1 Biometric Comparison")
    print("=" * 70)

    # Load test images
    sample_a_path = os.path.join(BASE_DIR, "uploads", "IMG-20250311-WA0004[1].jpg")
    sample_b_path = os.path.join(BASE_DIR, "uploads", "Screenshot 2026-03-02 223759.png")
    
    img_person_a = cv2.imread(sample_a_path)
    img_person_b = cv2.imread(sample_b_path)
    
    assert img_person_a is not None, f"Missing test sample: {sample_a_path}"
    assert img_person_b is not None, f"Missing test sample: {sample_b_path}"

    results = []

    # -------------------------------------------------------------
    # TEST 1: Same person's document + same person's live face
    # -------------------------------------------------------------
    print("\n>>> TEST 1: Same Person Verification (Document vs Live Match)")
    res1 = face_verifier.verify(img_person_a, img_person_a)
    print(f"    Verdict: {res1['verdict']} | Score: {res1['similarity_score']}% | Cosine: {res1['cosine_metric']}")
    passed1 = res1["verdict"] == "MATCH" and res1["similarity_score"] >= 70.0
    print(f"    Status: {'[PASS]' if passed1 else '[FAIL]'}")
    results.append(("TEST 1: Same Person Match", passed1))

    # -------------------------------------------------------------
    # TEST 2: Person A document + Person B live face
    # -------------------------------------------------------------
    print("\n>>> TEST 2: Impersonation / Fraud Screening (Person A vs Person B)")
    res2 = face_verifier.verify(img_person_a, img_person_b)
    print(f"    Verdict: {res2['verdict']} | Score: {res2['similarity_score']}% | Cosine: {res2['cosine_metric']}")
    passed2 = res2["verdict"] == "NO_MATCH" and res2["similarity_score"] < 55.0
    print(f"    Status: {'[PASS]' if passed2 else '[FAIL]'}")
    results.append(("TEST 2: Identity Mismatch", passed2))

    # -------------------------------------------------------------
    # TEST 3: Document without detectable portrait
    # -------------------------------------------------------------
    print("\n>>> TEST 3: Document Without Cardholder Portrait")
    # Synthetic white document with black text lines, no face
    no_face_doc = np.full((600, 800, 3), 245, dtype=np.uint8)
    cv2.putText(no_face_doc, "GOVERNMENT OF INDIA - CERTIFICATE", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.putText(no_face_doc, "Ref No: 9988123490 - Valid Document Without Photo", (50, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (50, 50, 50), 1)
    
    res3 = face_verifier.verify(no_face_doc, img_person_a)
    print(f"    Verdict: {res3['verdict']} | Message: {res3['message']}")
    passed3 = res3["verdict"] == "DOCUMENT_FACE_NOT_DETECTED"
    print(f"    Status: {'[PASS]' if passed3 else '[FAIL]'}")
    results.append(("TEST 3: Document Portrait Missing", passed3))

    # -------------------------------------------------------------
    # TEST 4: Camera without face
    # -------------------------------------------------------------
    print("\n>>> TEST 4: Camera Stream Without Presenter Face")
    empty_cam = np.full((480, 640, 3), 120, dtype=np.uint8) # Blank background wall
    res4 = face_verifier.verify(img_person_a, empty_cam)
    print(f"    Verdict: {res4['verdict']} | Message: {res4['message']}")
    passed4 = res4["verdict"] == "LIVE_FACE_NOT_DETECTED"
    print(f"    Status: {'[PASS]' if passed4 else '[FAIL]'}")
    results.append(("TEST 4: Live Face Not Present", passed4))

    # -------------------------------------------------------------
    # TEST 5: Multiple people in camera frame
    # -------------------------------------------------------------
    print("\n>>> TEST 5: Multiple Individuals in Live Camera Stream")
    # Create composite frame with two side-by-side faces
    face1_resized = cv2.resize(img_person_a, (480, 480))
    face2_resized = cv2.resize(img_person_b, (480, 480))
    multi_cam = np.hstack([face1_resized, face2_resized])
    
    res5 = face_verifier.verify(img_person_a, multi_cam)
    print(f"    Verdict: {res5['verdict']} | Faces Count: {res5['live_faces_count']}")
    passed5 = res5["verdict"] == "MULTIPLE_FACES_DETECTED" and res5["live_faces_count"] >= 2
    print(f"    Status: {'[PASS]' if passed5 else '[FAIL]'}")
    results.append(("TEST 5: Multiple Face Rejection", passed5))

    # -------------------------------------------------------------
    # TEST 6: Degraded / blurred camera capture
    # -------------------------------------------------------------
    print("\n>>> TEST 6: Degraded / Severe Motion Blur Camera Capture")
    blurred_cam = cv2.GaussianBlur(img_person_a, (45, 45), 0)
    res6 = face_verifier.verify(img_person_a, blurred_cam)
    print(f"    Verdict: {res6['verdict']} | Blur Score: {res6.get('quality', {}).get('live_face', {}).get('blur_score')}")
    passed6 = res6["verdict"] == "QUALITY_CHECK_FAILED"
    print(f"    Status: {'[PASS]' if passed6 else '[FAIL]'}")
    results.append(("TEST 6: Quality Gate Enforcement", passed6))

    # -------------------------------------------------------------
    # TEST 7: Static photo presentation / Liveness check
    # -------------------------------------------------------------
    print("\n>>> TEST 7: Presentation Attack Protection (Static Photo Liveness Check)")
    # Identical static frames simulation (holding printed paper to camera)
    static_frames = [img_person_a.copy(), img_person_a.copy(), img_person_a.copy()]
    res7 = face_verifier.verify(img_person_a, img_person_a, live_frames=static_frames)
    print(f"    Verdict: {res7['verdict']} | Liveness: {res7['liveness']['status']} | Details: {res7['liveness']['details']}")
    passed7 = res7["verdict"] == "LIVENESS_FAILED" and res7["liveness"]["status"] == "FAILED"
    print(f"    Status: {'[PASS]' if passed7 else '[FAIL]'}")
    results.append(("TEST 7: Anti-Spoofing Liveness Failure", passed7))

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    print("FINAL TEST SUMMARY")
    print("=" * 70)
    all_passed = True
    for name, passed in results:
        status_str = "PASSED" if passed else "FAILED"
        print(f"  {name.ljust(45)}: {status_str}")
        if not passed:
            all_passed = False

    print("-" * 70)
    if all_passed:
        print("ALL 7 SIH BIOMETRIC VERIFICATION SCENARIOS PASSED 100%!")
    else:
        print("WARNING: Some test scenarios failed. Review output above.")
    print("=" * 70)
    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
