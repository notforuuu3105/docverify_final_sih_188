import os
from pipeline.verification_engine import verification_engine

data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "demo_samples"))

samples = [
    "01_valid_pan.png",
    "02_valid_aadhaar.png",
    "03_tampered_pan.png",
    "04_blurry_lowqual.png",
    "05_academic_degree.png",
    "06_valid_passport.png",
    "07_valid_driving_licence.png",
    "08_valid_voter_id.png",
]

print("==================================================")
print("DOCVERIFY SIH 2026 - FULL BENCHMARK VERIFICATION")
print("==================================================")

for s in samples:
    path = os.path.join(data_dir, s)
    with open(path, "rb") as f:
        file_bytes = f.read()

    res = verification_engine.process_document(file_bytes, s)
    doc_type = res["document"]["document_type"]
    verdict = res["verdict"].upper()
    score = res["confidence_score"]
    tamper_risk = res["tampering_risk_score"]
    fields = res["extracted_fields"]

    print(f"\nDocument: {s}")
    print(f" -> Type Detected: {doc_type.upper()} ({res['classification']['confidence']}%)")
    print(f" -> Final Verdict: {verdict}")
    print(f" -> Composite Score: {score}% | Tampering Risk: {tamper_risk}%")
    print(" -> Extracted Fields:")
    for fld in fields:
        print(f"     * {fld['label']}: {fld['value']} (Conf: {fld['confidence']}%)")
    print(f" -> Checks Summary: {sum(1 for c in res['checks'] if c['status'] == 'passed')} Passed / {sum(1 for c in res['checks'] if c['status'] == 'failed')} Failed")
    if res['checks'] and any(c.get('suspicious_regions') for c in res['checks']):
        regions = [r for c in res['checks'] for r in c.get('suspicious_regions', [])]
        print(f" -> Flagged Suspicious Regions: {len(regions)}")
        for r in regions:
            print(f"     ! [{r['severity'].upper()}] {r['label']} at x={r['coordinates']['x']}, y={r['coordinates']['y']}")

print("\n==================================================")
print("BENCHMARK COMPLETED SUCCESSFULLY")
print("==================================================")
