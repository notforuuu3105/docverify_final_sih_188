import { VerificationRecord, ComparisonRecord, DocumentRecord } from '../types';

// Helper to generate SVG document previews as Data URLs for immediate visual testing
export function generateMockDocumentSvg(type: 'invoice_orig' | 'invoice_tampered' | 'id_authentic' | 'cert_forged'): string {
  let content = '';

  if (type === 'invoice_orig') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#ffffff; font-family: sans-serif;">
        <!-- Header -->
        <rect x="0" y="0" width="600" height="110" fill="#1e293b"/>
        <text x="40" y="55" font-size="24" font-weight="bold" fill="#ffffff">ACME SUPPLY CORP.</text>
        <text x="40" y="80" font-size="12" fill="#94a3b8">Official Commercial Billing Invoice #INV-2026-8891</text>
        <rect x="460" y="35" width="100" height="36" rx="4" fill="#10b981"/>
        <text x="510" y="58" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFIED ORIGINAL</text>

        <!-- Bill To / Ship To -->
        <text x="40" y="160" font-size="11" font-weight="bold" fill="#64748b">BILLED TO:</text>
        <text x="40" y="185" font-size="14" font-weight="bold" fill="#0f172a">Apex Logistics Global Inc.</text>
        <text x="40" y="205" font-size="12" fill="#334155">450 Enterprise Parkway, Suite 800</text>
        <text x="40" y="225" font-size="12" fill="#334155">Austin, TX 78701, United States</text>

        <text x="360" y="160" font-size="11" font-weight="bold" fill="#64748b">INVOICE DETAILS:</text>
        <text x="360" y="185" font-size="12" fill="#334155"><tspan font-weight="bold">Date:</tspan> August 14, 2026</text>
        <text x="360" y="205" font-size="12" fill="#334155"><tspan font-weight="bold">Due Date:</tspan> September 14, 2026</text>
        <text x="360" y="225" font-size="12" fill="#334155"><tspan font-weight="bold">PO Number:</tspan> PO-994218-A</text>

        <!-- Table Header -->
        <rect x="40" y="270" width="520" height="32" fill="#f1f5f9" rx="4"/>
        <text x="55" y="291" font-size="11" font-weight="bold" fill="#475569">DESCRIPTION</text>
        <text x="320" y="291" font-size="11" font-weight="bold" fill="#475569">QTY</text>
        <text x="410" y="291" font-size="11" font-weight="bold" fill="#475569">UNIT PRICE</text>
        <text x="510" y="291" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">TOTAL</text>

        <!-- Row 1 -->
        <text x="55" y="335" font-size="13" fill="#1e293b">Enterprise Cloud Security Appliance</text>
        <text x="325" y="335" font-size="13" fill="#1e293b">2</text>
        <text x="410" y="335" font-size="13" fill="#1e293b">$5,500.00</text>
        <text x="510" y="335" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$11,000.00</text>
        <line x1="40" y1="355" x2="560" y2="355" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Row 2 -->
        <text x="55" y="390" font-size="13" fill="#1e293b">Annual Maintenance & Support Tier 3</text>
        <text x="325" y="390" font-size="13" fill="#1e293b">1</text>
        <text x="410" y="390" font-size="13" fill="#1e293b">$3,250.00</text>
        <text x="510" y="390" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$3,250.00</text>
        <line x1="40" y1="410" x2="560" y2="410" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Summary -->
        <rect x="340" y="440" width="220" height="90" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="6"/>
        <text x="355" y="468" font-size="12" fill="#64748b">Subtotal:</text>
        <text x="545" y="468" font-size="12" fill="#334155" text-anchor="end">$14,250.00</text>
        <text x="355" y="493" font-size="12" fill="#64748b">Tax (0.00% Exempt):</text>
        <text x="545" y="493" font-size="12" fill="#334155" text-anchor="end">$0.00</text>
        <line x1="355" y1="504" x2="545" y2="504" stroke="#cbd5e1"/>
        <text x="355" y="522" font-size="13" font-weight="bold" fill="#0f172a">Total Due:</text>
        <text x="545" y="522" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="end">$14,250.00</text>

        <!-- Banking Information -->
        <rect x="40" y="560" width="520" height="95" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="6"/>
        <text x="55" y="585" font-size="12" font-weight="bold" fill="#334155">PAYMENT & WIRE INSTRUCTIONS</text>
        <text x="55" y="608" font-size="11" fill="#64748b">Bank Name: <tspan fill="#0f172a" font-weight="500">JPMorgan Chase Bank, N.A.</tspan></text>
        <text x="55" y="626" font-size="11" fill="#64748b">Routing Transit: <tspan fill="#0f172a" font-weight="500">021000021</tspan> | Account Number: <tspan fill="#0f172a" font-weight="500">9842104471</tspan></text>
        <text x="55" y="644" font-size="11" fill="#64748b">Beneficiary: <tspan fill="#0f172a" font-weight="500">ACME SUPPLY CORPORATE ESCROW</tspan></text>

        <!-- Signatures -->
        <text x="40" y="700" font-size="11" font-weight="bold" fill="#64748b">AUTHORIZED SIGNATURE</text>
        <path d="M40,740 Q60,710 90,735 T140,730 T190,740" fill="none" stroke="#2563eb" stroke-width="2.5"/>
        <line x1="40" y1="755" x2="220" y2="755" stroke="#94a3b8" stroke-width="1"/>
        <text x="40" y="775" font-size="11" fill="#64748b">Marcus Sterling, VP of Finance</text>
      </svg>
    `;
  } else if (type === 'invoice_tampered') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#ffffff; font-family: sans-serif;">
        <!-- Header -->
        <rect x="0" y="0" width="600" height="110" fill="#1e293b"/>
        <text x="40" y="55" font-size="24" font-weight="bold" fill="#ffffff">ACME SUPPLY CORP.</text>
        <text x="40" y="80" font-size="12" fill="#94a3b8">Official Commercial Billing Invoice #INV-2026-8891</text>
        
        <!-- Newly Added Urgent Watermark (BLUE DIFF) -->
        <rect x="310" y="32" width="250" height="42" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="435" y="58" font-size="11" font-weight="bold" fill="#1d4ed8" text-anchor="middle">⚡ PRIORITY WIRE TRANSFER REQUIRED</text>

        <!-- Bill To / Ship To -->
        <text x="40" y="160" font-size="11" font-weight="bold" fill="#64748b">BILLED TO:</text>
        <text x="40" y="185" font-size="14" font-weight="bold" fill="#0f172a">Apex Logistics Global Inc.</text>
        <text x="40" y="205" font-size="12" fill="#334155">450 Enterprise Parkway, Suite 800</text>
        <text x="40" y="225" font-size="12" fill="#334155">Austin, TX 78701, United States</text>

        <text x="360" y="160" font-size="11" font-weight="bold" fill="#64748b">INVOICE DETAILS:</text>
        <text x="360" y="185" font-size="12" fill="#334155"><tspan font-weight="bold">Date:</tspan> August 14, 2026</text>
        <text x="360" y="205" font-size="12" fill="#334155"><tspan font-weight="bold">Due Date:</tspan> September 14, 2026</text>
        <text x="360" y="225" font-size="12" fill="#334155"><tspan font-weight="bold">PO Number:</tspan> PO-994218-A</text>

        <!-- Table Header -->
        <rect x="40" y="270" width="520" height="32" fill="#f1f5f9" rx="4"/>
        <text x="55" y="291" font-size="11" font-weight="bold" fill="#475569">DESCRIPTION</text>
        <text x="320" y="291" font-size="11" font-weight="bold" fill="#475569">QTY</text>
        <text x="410" y="291" font-size="11" font-weight="bold" fill="#475569">UNIT PRICE</text>
        <text x="510" y="291" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">TOTAL</text>

        <!-- Row 1 -->
        <text x="55" y="335" font-size="13" fill="#1e293b">Enterprise Cloud Security Appliance</text>
        <text x="325" y="335" font-size="13" fill="#1e293b">2</text>
        <text x="410" y="335" font-size="13" fill="#1e293b">$5,500.00</text>
        <text x="510" y="335" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$11,000.00</text>
        <line x1="40" y1="355" x2="560" y2="355" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Row 2 -->
        <text x="55" y="390" font-size="13" fill="#1e293b">Annual Maintenance & Support Tier 3</text>
        <text x="325" y="390" font-size="13" fill="#1e293b">1</text>
        <text x="410" y="390" font-size="13" fill="#1e293b">$3,250.00</text>
        <text x="510" y="390" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$3,250.00</text>
        <line x1="40" y1="410" x2="560" y2="410" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Summary (TAMPERED RED VALUE) -->
        <rect x="340" y="440" width="220" height="90" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5" rx="6"/>
        <text x="355" y="468" font-size="12" fill="#64748b">Subtotal:</text>
        <text x="545" y="468" font-size="12" fill="#be123c" text-anchor="end" font-weight="bold">$142,500.00</text>
        <text x="355" y="493" font-size="12" fill="#64748b">Tax (0.00% Exempt):</text>
        <text x="545" y="493" font-size="12" fill="#334155" text-anchor="end">$0.00</text>
        <line x1="355" y1="504" x2="545" y2="504" stroke="#f43f5e"/>
        <text x="355" y="522" font-size="13" font-weight="bold" fill="#0f172a">Total Due:</text>
        <!-- Tampered 142,500 with font mismatch -->
        <text x="545" y="522" font-size="16" font-family="Courier New, monospace" font-weight="bold" fill="#e11d48" text-anchor="end">$142,500.00</text>

        <!-- Banking Information (TAMPERED YELLOW VALUE) -->
        <rect x="40" y="560" width="520" height="95" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" rx="6"/>
        <text x="55" y="585" font-size="12" font-weight="bold" fill="#b45309">PAYMENT & WIRE INSTRUCTIONS (ALTERED)</text>
        <text x="55" y="608" font-size="11" fill="#64748b">Bank Name: <tspan fill="#b45309" font-weight="bold">Offshore Cayman Trust Bank Ltd</tspan></text>
        <text x="55" y="626" font-size="11" fill="#64748b">Routing Transit: <tspan fill="#b45309" font-weight="bold">099881122</tspan> | Account: <tspan fill="#b45309" font-weight="bold">11029488319</tspan></text>
        <text x="55" y="644" font-size="11" fill="#64748b">Beneficiary: <tspan fill="#b45309" font-weight="bold">ACME INTERNATIONAL HOLDINGS LTD</tspan></text>

        <!-- Signatures -->
        <text x="40" y="700" font-size="11" font-weight="bold" fill="#64748b">AUTHORIZED SIGNATURE</text>
        <!-- Digital copy-paste signature artifact -->
        <path d="M40,740 Q60,710 90,735 T140,730 T190,740" fill="none" stroke="#2563eb" stroke-width="2.5" opacity="0.8"/>
        <rect x="35" y="715" width="165" height="35" fill="none" stroke="#e11d48" stroke-dasharray="3,3" stroke-width="1"/>
        <line x1="40" y1="755" x2="220" y2="755" stroke="#94a3b8" stroke-width="1"/>
        <text x="40" y="775" font-size="11" fill="#64748b">Marcus Sterling, VP of Finance</text>
      </svg>
    `;
  } else {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#ffffff; font-family: sans-serif;">
        <rect x="30" y="30" width="540" height="790" fill="none" stroke="#334155" stroke-width="3"/>
        <text x="300" y="100" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">CERTIFICATE OF RECOGNITION</text>
        <text x="300" y="200" font-size="16" fill="#475569" text-anchor="middle">This document is certified for forensic analysis.</text>
      </svg>
    `;
  }

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(content.trim());
}

// Initial mock database store for seamless offline/sandbox development
export const INITIAL_MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-orig-101',
    user_id: 'user-demo-1',
    file_name: 'Acme_Supply_Invoice_2026_Orig.pdf',
    file_size: 482910,
    mime_type: 'application/pdf',
    storage_path: 'user-demo-1/doc-orig-101/Acme_Supply_Invoice_2026_Orig.pdf',
    sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    page_count: 1,
    document_type: 'invoice',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    preview_url: generateMockDocumentSvg('invoice_orig'),
  },
  {
    id: 'doc-tamp-202',
    user_id: 'user-demo-1',
    file_name: 'Acme_Supply_Invoice_2026_Altered.pdf',
    file_size: 491204,
    mime_type: 'application/pdf',
    storage_path: 'user-demo-1/doc-tamp-202/Acme_Supply_Invoice_2026_Altered.pdf',
    sha256_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    page_count: 1,
    document_type: 'invoice',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    preview_url: generateMockDocumentSvg('invoice_tampered'),
  },
];

export const INITIAL_MOCK_VERIFICATIONS: VerificationRecord[] = [
  {
    id: 'verif-tamp-1',
    document_id: 'doc-tamp-202',
    user_id: 'user-demo-1',
    status: 'completed',
    verdict: 'tampered',
    confidence_score: 96.2,
    tampering_risk_score: 91.4,
    summary: 'High probability of digital tampering detected. Anomaly analysis reveals spliced font baseline on payable amount and anomalous JPEG quantization around the recipient banking details.',
    metadata_analysis: {
      pdf_version: '1.7',
      producer: 'Adobe Photoshop 2025 / Spliced Layer',
      tamper_detected: true,
      exif_anomalies: 3,
      stream_hashes_match: false,
    },
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    completed_at: new Date(Date.now() - 3600 * 1000 * 1.9).toISOString(),
    document: INITIAL_MOCK_DOCUMENTS[1],
    checks: [
      {
        id: 'chk-1',
        verification_id: 'verif-tamp-1',
        check_type: 'font_consistency',
        title: 'Font Kerning & Glyph Metrics',
        description: 'Analyzes character spacing, typography weight, and anti-aliasing variations.',
        status: 'failed',
        score: 32.5,
        findings: {
          detected_fonts: ['Helvetica-Bold', 'Arial-Modified'],
          baseline_shift_pt: 2.4,
          kerning_anomaly_score: 92.1,
        },
        suspicious_regions: [
          {
            id: 'sr-1',
            page: 1,
            coordinates: { x: 0.56, y: 0.58, width: 0.38, height: 0.05 },
            severity: 'critical',
            label: 'Altered Invoice Total',
            description: 'Glyph outline for "$142,500.00" shows mismatched kerning and duplicate anti-aliasing pixels.',
          },
        ],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'chk-2',
        verification_id: 'verif-tamp-1',
        check_type: 'digital_tampering',
        title: 'Error Level Analysis (ELA)',
        description: 'Examines high-frequency compression gradient inconsistencies across the document canvas.',
        status: 'failed',
        score: 28.0,
        findings: {
          quantization_variance: '84.2%',
          recompressed_regions: 2,
        },
        suspicious_regions: [
          {
            id: 'sr-2',
            page: 1,
            coordinates: { x: 0.06, y: 0.66, width: 0.88, height: 0.11 },
            severity: 'high',
            label: 'Modified Wire Instructions',
            description: 'Quantization table shows distinct secondary compression block boundary around bank routing coordinates.',
          },
        ],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'chk-3',
        verification_id: 'verif-tamp-1',
        check_type: 'metadata_integrity',
        title: 'Metadata & Stream Integrity',
        description: 'Examines PDF trailer markers, object xref tables, and modification history.',
        status: 'warning',
        score: 65.0,
        findings: {
          creation_date: '2026-08-14T10:20:00Z',
          modification_date: '2026-08-14T14:45:12Z',
          discrepancy: 'Document modified with raster graphics editor after generation.',
        },
        suspicious_regions: [],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'chk-4',
        verification_id: 'verif-tamp-1',
        check_type: 'signature_stamp',
        title: 'Digital Signature & Stamp Verification',
        description: 'Verifies visual pixel noise around authorized corporate stamps and handwritten signatures.',
        status: 'warning',
        score: 58.0,
        findings: {
          signature_cut_paste: true,
          halo_effect_detected: true,
        },
        suspicious_regions: [
          {
            id: 'sr-3',
            page: 1,
            coordinates: { x: 0.06, y: 0.84, width: 0.32, height: 0.06 },
            severity: 'medium',
            label: 'Copy-Paste Signature Halo',
            description: 'Halo boundary pixel artifacts indicate signature was extracted and overlaid from another document.',
          },
        ],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'verif-auth-2',
    document_id: 'doc-orig-101',
    user_id: 'user-demo-1',
    status: 'completed',
    verdict: 'authentic',
    confidence_score: 98.5,
    tampering_risk_score: 2.1,
    summary: 'Document exhibits high structural integrity, consistent font kerning, unbroken digital signatures, and genuine camera EXIF metadata without post-processing recompression artifacts.',
    metadata_analysis: {
      pdf_version: '1.7',
      creator: 'Adobe Acrobat Pro 2026',
      compression: 'FlateDecode',
      signature_valid: true,
    },
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 3600 * 1000 * 3.9).toISOString(),
    document: INITIAL_MOCK_DOCUMENTS[0],
    checks: [
      {
        id: 'chk-auth-1',
        verification_id: 'verif-auth-2',
        check_type: 'metadata_integrity',
        title: 'Metadata & Stream Integrity',
        description: 'Examines PDF trailer markers, object xref tables, and modification history.',
        status: 'passed',
        score: 99.4,
        findings: { linearized: true, xref_repaired: false },
        suspicious_regions: [],
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
      {
        id: 'chk-auth-2',
        verification_id: 'verif-auth-2',
        check_type: 'font_consistency',
        title: 'Font Kerning & Typography',
        description: 'Analyzes character spacing, typography weight, and anti-aliasing variations.',
        status: 'passed',
        score: 98.8,
        findings: { embedded_fonts_valid: true, spacing_deviations: 0 },
        suspicious_regions: [],
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
    ],
  },
];

export const INITIAL_MOCK_COMPARISONS: ComparisonRecord[] = [
  {
    id: 'comp-invoice-99',
    user_id: 'user-demo-1',
    original_document_id: 'doc-orig-101',
    suspected_document_id: 'doc-tamp-202',
    status: 'completed',
    similarity_score: 74.3,
    overall_risk: 'critical',
    text_diff_score: 42.0,
    image_diff_score: 65.0,
    layout_diff_score: 91.0,
    metadata_diff_score: 38.0,
    total_differences: 3,
    created_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    completed_at: new Date(Date.now() - 3600 * 1000 * 0.9).toISOString(),
    original_document: INITIAL_MOCK_DOCUMENTS[0],
    suspected_document: INITIAL_MOCK_DOCUMENTS[1],
    differences: [
      {
        id: 'diff-1',
        comparison_id: 'comp-invoice-99',
        page_number: 1,
        difference_type: 'modified_name',
        visual_tag: 'red',
        risk_level: 'critical',
        region_title: 'Invoice Total Payable Amount',
        original_value: '$14,250.00 USD',
        suspected_value: '$142,500.00 USD',
        original_coordinates: { x: 0.56, y: 0.58, width: 0.38, height: 0.05 },
        suspected_coordinates: { x: 0.56, y: 0.58, width: 0.38, height: 0.05 },
        description: 'Value altered by an exact factor of 10. Trailing zero appended using mismatched font metrics.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'diff-2',
        comparison_id: 'comp-invoice-99',
        page_number: 1,
        difference_type: 'altered_signature',
        visual_tag: 'yellow',
        risk_level: 'high',
        region_title: 'Wire Routing & Bank Beneficiary',
        original_value: 'JPMorgan Chase Bank, N.A. (Routing: 021000021)',
        suspected_value: 'Offshore Cayman Trust Bank Ltd (Routing: 099881122)',
        original_coordinates: { x: 0.06, y: 0.66, width: 0.88, height: 0.11 },
        suspected_coordinates: { x: 0.06, y: 0.66, width: 0.88, height: 0.11 },
        description: 'Recipient beneficiary wire instructions replaced with offshore entity.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'diff-3',
        comparison_id: 'comp-invoice-99',
        page_number: 1,
        difference_type: 'added_element',
        visual_tag: 'blue',
        risk_level: 'medium',
        region_title: 'Priority Transfer Banner',
        original_value: 'None (Clean space)',
        suspected_value: 'PRIORITY WIRE TRANSFER REQUIRED',
        original_coordinates: { x: 0.51, y: 0.04, width: 0.42, height: 0.05 },
        suspected_coordinates: { x: 0.51, y: 0.04, width: 0.42, height: 0.05 },
        description: 'Newly inserted urgent watermark banner not present in baseline authentic document.',
        created_at: new Date().toISOString(),
      },
    ],
  },
];
