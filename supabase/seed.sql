-- ==============================================================================
-- DocVerify AI - Seed Data (Realistic forensic demonstration records)
-- ==============================================================================

-- Note: Replace '00000000-0000-0000-0000-000000000000' with your authenticated user ID if running directly in Supabase SQL editor.
DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000000';
    doc_auth_id UUID := '11111111-1111-1111-1111-111111111111';
    doc_tamp_id UUID := '22222222-2222-2222-2222-222222222222';
    verif_auth_id UUID := '33333333-3333-3333-3333-333333333333';
    verif_tamp_id UUID := '44444444-4444-4444-4444-444444444444';
    comp_id UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
    -- Profile
    INSERT INTO public.profiles (id, email, full_name, organization)
    VALUES (demo_user_id, 'analyst@docverify.ai', 'Chief Forensic Auditor', 'Global Trust Labs')
    ON CONFLICT (id) DO NOTHING;

    -- Document 1: Official Corporate Invoice (Original Authentic)
    INSERT INTO public.documents (id, user_id, file_name, file_size, mime_type, storage_path, sha256_hash, page_count, document_type)
    VALUES (
        doc_auth_id,
        demo_user_id,
        'Acme_Supply_Invoice_2026_Orig.pdf',
        482910,
        'application/pdf',
        demo_user_id || '/' || doc_auth_id || '/Acme_Supply_Invoice_2026_Orig.pdf',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        1,
        'invoice'
    ) ON CONFLICT (id) DO NOTHING;

    -- Document 2: Suspected Altered Invoice
    INSERT INTO public.documents (id, user_id, file_name, file_size, mime_type, storage_path, sha256_hash, page_count, document_type)
    VALUES (
        doc_tamp_id,
        demo_user_id,
        'Acme_Supply_Invoice_2026_Altered.pdf',
        491204,
        'application/pdf',
        demo_user_id || '/' || doc_tamp_id || '/Acme_Supply_Invoice_2026_Altered.pdf',
        '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        1,
        'invoice'
    ) ON CONFLICT (id) DO NOTHING;

    -- Verification 1: Authentic Document
    INSERT INTO public.verifications (id, document_id, user_id, status, verdict, confidence_score, tampering_risk_score, summary, metadata_analysis, completed_at)
    VALUES (
        verif_auth_id,
        doc_auth_id,
        demo_user_id,
        'completed',
        'authentic',
        98.50,
        2.10,
        'Document exhibits high structural integrity, consistent font kerning, unbroken digital signatures, and genuine camera EXIF metadata without post-processing recompression artifacts.',
        '{"pdf_version": "1.7", "creator": "Adobe Acrobat Pro 2026", "compression": "FlateDecode", "signature_valid": true}'::jsonb,
        now() - INTERVAL '2 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Checks for Verification 1
    INSERT INTO public.verification_checks (verification_id, check_type, title, description, status, score, findings, suspicious_regions)
    VALUES
    (
        verif_auth_id,
        'metadata_integrity',
        'PDF Metadata & Stream Integrity',
        'Validates header markers, xref table consistency, and creation timestamp sequencing.',
        'passed',
        99.2,
        '{"linearized": true, "xref_repaired": false, "embedded_fonts_valid": true}'::jsonb,
        '[]'::jsonb
    ),
    (
        verif_auth_id,
        'compression_artifacts',
        'Error Level Analysis (ELA)',
        'Quantization table consistency across high-frequency and low-frequency image regions.',
        'passed',
        98.0,
        '{"uniformity": 0.98, "resave_count": 1}'::jsonb,
        '[]'::jsonb
    );

    -- Verification 2: Tampered Document
    INSERT INTO public.verifications (id, document_id, user_id, status, verdict, confidence_score, tampering_risk_score, summary, metadata_analysis, completed_at)
    VALUES (
        verif_tamp_id,
        doc_tamp_id,
        demo_user_id,
        'completed',
        'tampered',
        96.20,
        91.40,
        'High probability of digital tampering detected. Anomaly analysis reveals spliced font baseline on payable amount and anomalous JPEG quantization around the recipient banking details.',
        '{"pdf_version": "1.7", "producer": "Photoshop CC 2025", "tamper_detected": true}'::jsonb,
        now() - INTERVAL '30 minutes'
    ) ON CONFLICT (id) DO NOTHING;

    -- Checks for Verification 2
    INSERT INTO public.verification_checks (verification_id, check_type, title, description, status, score, findings, suspicious_regions)
    VALUES
    (
        verif_tamp_id,
        'font_consistency',
        'Font Kerning & Glyph Alignment',
        'Detects mismatched vector outlines, non-standard character spacing, and anti-aliasing disparities.',
        'failed',
        32.5,
        '{"detected_fonts": ["Helvetica-Bold", "Arial-Custom"], "baseline_shift_pt": 2.4}'::jsonb,
        '[{"id": "sr-1", "page": 1, "coordinates": {"x": 0.65, "y": 0.68, "width": 0.28, "height": 0.06}, "severity": "high", "label": "Altered Invoice Total", "description": "Character kerning on $142,500.00 does not match parent font glyph metrics."}]'::jsonb
    ),
    (
        verif_tamp_id,
        'digital_tampering',
        'Error Level Analysis (ELA) & Resampling',
        'Identifies cloned pixels, copy-move forgery, and localized recompression artifacts.',
        'failed',
        28.0,
        '{"cloned_patches_found": 2, "variance_score": 88.4}'::jsonb,
        '[{"id": "sr-2", "page": 1, "coordinates": {"x": 0.18, "y": 0.78, "width": 0.40, "height": 0.08}, "severity": "critical", "label": "Modified IBAN / Bank Details", "description": "High JPEG compression noise boundary detected around account number field."}]'::jsonb
    );

    -- Comparison Record: Authentic vs Tampered
    INSERT INTO public.comparisons (id, user_id, original_document_id, suspected_document_id, status, similarity_score, overall_risk, text_diff_score, image_diff_score, layout_diff_score, metadata_diff_score, total_differences, completed_at)
    VALUES (
        comp_id,
        demo_user_id,
        doc_auth_id,
        doc_tamp_id,
        'completed',
        74.30,
        'critical',
        42.00,
        65.00,
        91.00,
        38.00,
        3,
        now() - INTERVAL '15 minutes'
    ) ON CONFLICT (id) DO NOTHING;

    -- Comparison Differences
    INSERT INTO public.comparison_differences (comparison_id, page_number, difference_type, visual_tag, risk_level, region_title, original_value, suspected_value, original_coordinates, suspected_coordinates, description)
    VALUES
    (
        comp_id,
        1,
        'modified_name',
        'red',
        'critical',
        'Total Payable Amount',
        '$14,250.00 USD',
        '$142,500.00 USD',
        '{"x": 0.65, "y": 0.68, "width": 0.28, "height": 0.06}'::jsonb,
        '{"x": 0.65, "y": 0.68, "width": 0.28, "height": 0.06}'::jsonb,
        'Value altered by a factor of 10. Additional zero appended with mismatched font kerning.'
    ),
    (
        comp_id,
        1,
        'altered_signature',
        'yellow',
        'high',
        'Routing & Account Number',
        'JP Morgan Chase #984210',
        'Offshore Trust Bank #110294',
        '{"x": 0.18, "y": 0.78, "width": 0.40, "height": 0.08}'::jsonb,
        '{"x": 0.18, "y": 0.78, "width": 0.40, "height": 0.08}'::jsonb,
        'Recipient beneficiary wire instructions modified. Different routing transit code.'
    ),
    (
        comp_id,
        1,
        'added_element',
        'blue',
        'medium',
        'Urgent Transfer Watermark',
        'None (Clean Field)',
        'PRIORITY WIRE TRANSFER REQUIRED',
        '{"x": 0.30, "y": 0.15, "width": 0.40, "height": 0.05}'::jsonb,
        '{"x": 0.30, "y": 0.15, "width": 0.40, "height": 0.05}'::jsonb,
        'Newly added stamp element not present in original baseline document.'
    );
END $$;
