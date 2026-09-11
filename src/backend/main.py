"""
DocVerify - FastAPI Backend Application
SIH 2026 Prototype AI Document Verification Server
"""

import os
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from pipeline.verification_engine import verification_engine
from pipeline.comparator import compare_documents
from pipeline.ocr_engine import run_ocr
from pipeline.preprocessor import preprocess_document

app = FastAPI(
    title="DocVerify AI Verification Engine",
    description="SIH 2026 Document Verification Assistance Platform Backend",
    version="2.0.0",
)

# Enable CORS for frontend Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "data"))
SAMPLES_DIR = os.path.join(DATA_DIR, "demo_samples")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(SAMPLES_DIR, exist_ok=True)

# Mount sample documents as static route for instant preview display
app.mount("/static/samples", StaticFiles(directory=SAMPLES_DIR), name="samples")
app.mount("/static/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "DocVerify AI Verification Platform",
        "version": "2.0.0",
        "protocol": "SIH26188-MHA",
    }


@app.get("/api/health")
def health_check():
    sample_files = [f for f in os.listdir(SAMPLES_DIR) if f.endswith((".png", ".jpg", ".jpeg"))]
    return {
        "status": "healthy",
        "ocr_engine": "Tesseract OCR (v7 Engine Active)",
        "pipeline_stages": [
            "Ingestion & Validation",
            "Resolution & Quality Preprocessing",
            "Optical Character Recognition (OCR)",
            "Automated Document Classification",
            "Structured Entity Field Extraction",
            "Verhoeff Checksum & Syntactic Validation",
            "Error Level Analysis (ELA) & Substrate Noise Forensics",
            "Central Multi-Factor Composite Scoring",
        ],
        "available_samples_count": len(sample_files),
        "disclaimer": "SIH 2026 Prototype system for document verification assistance. Does not constitute official legal authentication.",
    }


@app.get("/api/samples")
def get_demo_samples():
    """Returns catalog of calibrated synthetic benchmark documents."""
    samples = [
        {
            "id": "sample_valid_pan",
            "filename": "01_valid_pan.png",
            "title": "Authentic Specimen PAN Card",
            "category": "identity",
            "subtype": "pan",
            "expected_verdict": "authentic",
            "description": "Standard Income Tax Department credential with valid alphanumeric syntax and uniform typography.",
            "preview_url": "http://localhost:8000/static/samples/01_valid_pan.png",
        },
        {
            "id": "sample_valid_aadhaar",
            "filename": "02_valid_aadhaar.png",
            "title": "Authentic Specimen Aadhaar Card",
            "category": "identity",
            "subtype": "aadhaar",
            "expected_verdict": "authentic",
            "description": "UIDAI credential with valid Dihedral D5 Verhoeff checksum and clean typography.",
            "preview_url": "http://localhost:8000/static/samples/02_valid_aadhaar.png",
        },
        {
            "id": "sample_tampered_pan",
            "filename": "03_tampered_pan.png",
            "title": "Tampered / Spliced PAN Card",
            "category": "identity",
            "subtype": "pan",
            "expected_verdict": "tampered",
            "description": "Spliced numeric PAN field and overwritten cardholder name with localized compression discontinuities.",
            "preview_url": "http://localhost:8000/static/samples/03_tampered_pan.png",
        },
        {
            "id": "sample_blurry_doc",
            "filename": "04_blurry_lowqual.png",
            "title": "Low-Quality / Degraded Document",
            "category": "identity",
            "subtype": "general",
            "expected_verdict": "suspicious",
            "description": "Artificially blurred and rotated scan designed to trigger quality rejection and confidence degradation.",
            "preview_url": "http://localhost:8000/static/samples/04_blurry_lowqual.png",
        },
        {
            "id": "sample_degree",
            "filename": "05_academic_degree.png",
            "title": "Specimen Degree Certificate",
            "category": "academic",
            "subtype": "degree",
            "expected_verdict": "authentic",
            "description": "University Bachelor of Technology degree with structured candidate roll number and institutional seal.",
            "preview_url": "http://localhost:8000/static/samples/05_academic_degree.png",
        },
        {
            "id": "sample_valid_passport",
            "filename": "06_valid_passport.png",
            "title": "Authentic Republic of India Passport",
            "category": "identity",
            "subtype": "passport",
            "expected_verdict": "authentic",
            "description": "MEA credential with ICAO Doc 9303 compliant Machine Readable Zone (MRZ) and standard 8-char identifier.",
            "preview_url": "http://localhost:8000/static/samples/06_valid_passport.png",
        },
        {
            "id": "sample_valid_dl",
            "filename": "07_valid_driving_licence.png",
            "title": "Authentic Indian Driving Licence",
            "category": "identity",
            "subtype": "driving_licence",
            "expected_verdict": "authentic",
            "description": "MoRTH Sarathi credential with verified jurisdiction state code, LMV/MCWG authorization, and valid validity period.",
            "preview_url": "http://localhost:8000/static/samples/07_valid_driving_licence.png",
        },
        {
            "id": "sample_valid_voter_id",
            "filename": "08_valid_voter_id.png",
            "title": "Authentic Election Commission Voter ID",
            "category": "identity",
            "subtype": "voter_id",
            "expected_verdict": "authentic",
            "description": "Election Commission of India (ECI) Elector Photo Identity Card with verified alphanumeric EPIC format.",
            "preview_url": "http://localhost:8000/static/samples/08_valid_voter_id.png",
        },
    ]
    return {"samples": samples}


@app.post("/api/verify")
async def verify_document_endpoint(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form("officer-mha-1"),
    category_hint: Optional[str] = Form(None),
):
    """
    Primary verification endpoint:
    Processes actual uploaded file bytes through the full 8-stage verification pipeline.
    """
    try:
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Save uploaded file locally for static preview access
        safe_filename = file.filename or "uploaded_document.png"
        save_path = os.path.join(UPLOADS_DIR, safe_filename)
        with open(save_path, "wb") as f:
            f.write(file_bytes)

        # Process through verification engine
        result = verification_engine.process_document(
            file_bytes=file_bytes,
            filename=safe_filename,
            user_id=user_id,
            category_hint=category_hint,
        )

        # Set accessible preview URL (always guaranteed to be a renderable image)
        if safe_filename.lower().endswith(".pdf"):
            raster_name = f"{os.path.splitext(safe_filename)[0]}_preview.jpg"
            raster_path = os.path.join(UPLOADS_DIR, raster_name)
            orig_b64 = result.get("detection", {}).get("original_document")
            if orig_b64 and orig_b64.startswith("data:image/jpeg;base64,"):
                try:
                    img_data = base64.b64decode(orig_b64.split(",", 1)[1])
                    with open(raster_path, "wb") as rf:
                        rf.write(img_data)
                    result["document"]["preview_url"] = f"http://localhost:8000/static/uploads/{raster_name}"
                except Exception:
                    result["document"]["preview_url"] = orig_b64
            elif orig_b64:
                result["document"]["preview_url"] = orig_b64
            else:
                result["document"]["preview_url"] = result.get("detection", {}).get("cropped_document") or f"http://localhost:8000/static/uploads/{safe_filename}"
        else:
            result["document"]["preview_url"] = f"http://localhost:8000/static/uploads/{safe_filename}"

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification pipeline failed: {str(e)}")


@app.post("/api/compare")
async def compare_documents_endpoint(
    original_file: UploadFile = File(...),
    suspected_file: UploadFile = File(...),
):
    """
    Dual document comparison endpoint:
    Executes visual difference heatmap (SSIM), OCR token diff, and structured entity field comparison.
    """
    try:
        orig_bytes = await original_file.read()
        susp_bytes = await suspected_file.read()

        if not orig_bytes or not susp_bytes:
            raise HTTPException(status_code=400, detail="Both document files must be non-empty.")

        # Preprocess both documents
        orig_prep = preprocess_document(orig_bytes, original_file.filename)
        susp_prep = preprocess_document(susp_bytes, suspected_file.filename)

        # OCR both documents
        orig_ocr = run_ocr(orig_prep["image_pil"])
        susp_ocr = run_ocr(susp_prep["image_pil"])

        # Compare
        comparison_res = compare_documents(
            orig_pil=orig_prep["image_pil"],
            orig_bgr=orig_prep["image_bgr"],
            orig_ocr=orig_ocr,
            orig_meta=orig_prep["pdf_metadata"],
            susp_pil=susp_prep["image_pil"],
            susp_bgr=susp_prep["image_bgr"],
            susp_ocr=susp_ocr,
            susp_meta=susp_prep["pdf_metadata"],
        )

        # Save files for preview
        orig_path = os.path.join(UPLOADS_DIR, "orig_" + original_file.filename)
        susp_path = os.path.join(UPLOADS_DIR, "susp_" + suspected_file.filename)

        with open(orig_path, "wb") as f:
            f.write(orig_bytes)
        with open(susp_path, "wb") as f:
            f.write(susp_bytes)

        comparison_res["original_document"] = {
            "id": "doc-orig",
            "file_name": original_file.filename,
            "preview_url": f"http://localhost:8000/static/uploads/orig_{original_file.filename}",
        }
        comparison_res["suspected_document"] = {
            "id": "doc-susp",
            "file_name": suspected_file.filename,
            "preview_url": f"http://localhost:8000/static/uploads/susp_{suspected_file.filename}",
        }

        return comparison_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


# Serve built React frontend if dist directory exists (for unified all-in-one deployment)
DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "dist"))
if os.path.exists(DIST_DIR):
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
