import {
  DocumentRecord,
  VerificationRecord,
  VerificationPipelineStage,
  VerificationCheck,
  ComparisonRecord,
  ComparisonDifference,
} from '../types';
import {
  INITIAL_MOCK_DOCUMENTS,
  INITIAL_MOCK_VERIFICATIONS,
  INITIAL_MOCK_COMPARISONS,
} from './mockData';

// Local storage keys for persisting mock sessions
const DOCS_KEY = 'docverify_mock_documents';
const VERIFS_KEY = 'docverify_mock_verifications';
const COMPS_KEY = 'docverify_mock_comparisons';

class MockStorageStore {
  getDocuments(): DocumentRecord[] {
    const raw = localStorage.getItem(DOCS_KEY);
    if (!raw) {
      this.saveDocuments(INITIAL_MOCK_DOCUMENTS);
      return INITIAL_MOCK_DOCUMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_DOCUMENTS;
    }
  }

  saveDocuments(docs: DocumentRecord[]) {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  }

  addDocument(doc: DocumentRecord) {
    const docs = this.getDocuments();
    const updated = [doc, ...docs.filter((d) => d.id !== doc.id)];
    this.saveDocuments(updated);
  }

  getVerifications(): VerificationRecord[] {
    const raw = localStorage.getItem(VERIFS_KEY);
    if (!raw) {
      this.saveVerifications(INITIAL_MOCK_VERIFICATIONS);
      return INITIAL_MOCK_VERIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_VERIFICATIONS;
    }
  }

  saveVerifications(verifs: VerificationRecord[]) {
    localStorage.setItem(VERIFS_KEY, JSON.stringify(verifs));
  }

  addVerification(verif: VerificationRecord) {
    const verifs = this.getVerifications();
    const updated = [verif, ...verifs.filter((v) => v.id !== verif.id)];
    this.saveVerifications(updated);
  }

  getComparisons(): ComparisonRecord[] {
    const raw = localStorage.getItem(COMPS_KEY);
    if (!raw) {
      this.saveComparisons(INITIAL_MOCK_COMPARISONS);
      return INITIAL_MOCK_COMPARISONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_COMPARISONS;
    }
  }

  saveComparisons(comps: ComparisonRecord[]) {
    localStorage.setItem(COMPS_KEY, JSON.stringify(comps));
  }

  addComparison(comp: ComparisonRecord) {
    const comps = this.getComparisons();
    const updated = [comp, ...comps.filter((c) => c.id !== comp.id)];
    this.saveComparisons(updated);
  }
}

export const mockStore = new MockStorageStore();

export interface VerificationProgressCallback {
  (stage: VerificationPipelineStage, label: string, progress: number): void;
}

export class MockForensicEngine {
  /**
   * Simulates the 7-stage forensic pipeline with realistic delays and callbacks
   */
  async runForensicVerification(
    document: DocumentRecord,
    onProgress: VerificationProgressCallback
  ): Promise<VerificationRecord> {
    const stages: { stage: VerificationPipelineStage; label: string; progress: number; delay: number }[] = [
      { stage: 'uploading', label: 'Uploading & validating encrypted document buffer...', progress: 14, delay: 500 },
      { stage: 'extracting_info', label: 'Extracting OCR typography, vector streams & PDF xref tables...', progress: 28, delay: 700 },
      { stage: 'visual_analysis', label: 'Executing Error Level Analysis (ELA) & pixel variance checks...', progress: 45, delay: 800 },
      { stage: 'metadata_check', label: 'Validating EXIF metadata, camera serials & software tags...', progress: 62, delay: 600 },
      { stage: 'suspicious_region_detection', label: 'Detecting copy-move anomalies & localized recompression...', progress: 78, delay: 750 },
      { stage: 'pattern_analysis', label: 'Analyzing font kerning baselines, ink bleed & signature contours...', progress: 91, delay: 650 },
      { stage: 'result_generation', label: 'Synthesizing forensic indicators and risk scores...', progress: 100, delay: 400 },
    ];

    for (const step of stages) {
      onProgress(step.stage, step.label, step.progress);
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }

    // Determine verdict based on file heuristics or name clues
    const nameLower = document.file_name.toLowerCase();
    const isLikelyTampered =
      nameLower.includes('tamper') ||
      nameLower.includes('alter') ||
      nameLower.includes('fake') ||
      nameLower.includes('edit');
    const isLikelyForged = nameLower.includes('forge') || nameLower.includes('cert');
    const isLikelySuspicious = nameLower.includes('suspicious') || nameLower.includes('warn');

    let verdict: 'authentic' | 'tampered' | 'forged' | 'suspicious' = 'authentic';
    let confidence = 98.2;
    let riskScore = 3.5;
    let summary = 'Document exhibits consistent typography, uniform compression matrices, and authentic metadata integrity.';
    let checks: VerificationCheck[] = [];

    const verificationId = 'verif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    if (isLikelyTampered) {
      verdict = 'tampered';
      confidence = 94.8;
      riskScore = 89.2;
      summary = 'High probability of digital tampering detected. Anomaly analysis reveals spliced font baseline on payable amount and anomalous JPEG quantization around the recipient banking details.';

      checks = [
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'font_consistency',
          title: 'Font Kerning & Glyph Metrics',
          description: 'Mismatched character spacing and anomalous vector outlines detected.',
          status: 'failed',
          score: 34.0,
          findings: { baseline_shift_pt: 2.1, mismatched_glyphs: 4 },
          suspicious_regions: [
            {
              id: 'sr-' + Math.random().toString(36).substring(2, 6),
              page: 1,
              coordinates: { x: 0.55, y: 0.56, width: 0.38, height: 0.07 },
              severity: 'critical',
              label: 'Altered Numeric Field',
              description: 'Character kerning and anti-aliasing on numerical total deviate significantly from parent font.',
            },
          ],
          created_at: new Date().toISOString(),
        },
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'digital_tampering',
          title: 'Error Level Analysis (ELA)',
          description: 'Distinct compression artifact boundaries indicate secondary raster overlay.',
          status: 'failed',
          score: 29.5,
          findings: { recompressed_regions: 1, variance_level: 'High' },
          suspicious_regions: [
            {
              id: 'sr-' + Math.random().toString(36).substring(2, 6),
              page: 1,
              coordinates: { x: 0.06, y: 0.65, width: 0.88, height: 0.12 },
              severity: 'high',
              label: 'Recompressed Information Block',
              description: 'Quantization table step discontinuity around bank account details confirms digital replacement.',
            },
          ],
          created_at: new Date().toISOString(),
        },
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'metadata_integrity',
          title: 'PDF Metadata & Stream Trailing',
          description: 'Discrepancy between PDF creation tool and raster editing software signatures.',
          status: 'warning',
          score: 61.0,
          findings: { producer: 'Adobe Photoshop / Spliced', revision_count: 3 },
          suspicious_regions: [],
          created_at: new Date().toISOString(),
        },
      ];
    } else if (isLikelyForged) {
      verdict = 'forged';
      confidence = 92.5;
      riskScore = 95.0;
      summary = 'Document exhibits characteristics of complete document synthesis or simulated certificate seals with signature cloning.';

      checks = [
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'signature_stamp',
          title: 'Seal & Signature Authentication',
          description: 'Simulated corporate seal with edge haloing and non-continuous ink pen stroke.',
          status: 'failed',
          score: 21.0,
          findings: { seal_cloned: true, stroke_natural_pressure: false },
          suspicious_regions: [
            {
              id: 'sr-' + Math.random().toString(36).substring(2, 6),
              page: 1,
              coordinates: { x: 0.08, y: 0.78, width: 0.4, height: 0.15 },
              severity: 'critical',
              label: 'Synthetic Signature / Extracted Stamp',
              description: 'RGB edge haloing indicates stamp was extracted from another bitmap and pasted.',
            },
          ],
          created_at: new Date().toISOString(),
        },
      ];
    } else if (isLikelySuspicious) {
      verdict = 'suspicious';
      confidence = 74.0;
      riskScore = 58.0;
      summary = 'Potential anomalies detected in document margins and metadata timestamps. Manual review recommended.';
      checks = [
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'layout_alignment',
          title: 'Layout & Margin Alignment',
          description: 'Paragraph grid alignment has minor rotational skew of 0.8 degrees.',
          status: 'warning',
          score: 72.0,
          findings: { rotation_skew: '0.8 deg' },
          suspicious_regions: [],
          created_at: new Date().toISOString(),
        },
      ];
    } else {
      // Authentic document
      verdict = 'authentic';
      confidence = 98.8;
      riskScore = 2.4;
      summary = 'Document appears authentic. Full forensic scan confirms font consistency, valid linear metadata, and uniform error level analysis.';
      checks = [
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'font_consistency',
          title: 'Font Kerning & Glyph Metrics',
          description: 'Vector outlines and glyph kerning conform to standard typography profiles.',
          status: 'passed',
          score: 99.1,
          findings: { font_validity: '100%', baseline_shifts: 0 },
          suspicious_regions: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'compression_artifacts',
          title: 'Error Level Analysis (ELA)',
          description: 'Quantization levels across all frequency bands are completely uniform.',
          status: 'passed',
          score: 98.4,
          findings: { uniform_recompression: true, artifacts_found: 0 },
          suspicious_regions: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'chk-' + Math.random().toString(36).substring(2, 8),
          verification_id: verificationId,
          check_type: 'metadata_integrity',
          title: 'PDF Structural Metadata',
          description: 'Linearized PDF xref table intact with matching cryptographic trailer checksums.',
          status: 'passed',
          score: 100.0,
          findings: { xref_linearized: true, trailers_matched: true },
          suspicious_regions: [],
          created_at: new Date().toISOString(),
        },
      ];
    }

    const verificationRecord: VerificationRecord = {
      id: verificationId,
      document_id: document.id,
      user_id: document.user_id,
      status: 'completed',
      verdict,
      confidence_score: confidence,
      tampering_risk_score: riskScore,
      summary,
      metadata_analysis: {
        analyzed_at: new Date().toISOString(),
        file_size_bytes: document.file_size,
        mime_type: document.mime_type,
        sha256_hash: document.sha256_hash,
      },
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      document,
      checks,
    };

    mockStore.addVerification(verificationRecord);
    return verificationRecord;
  }

  /**
   * Generates comparison between original and suspected document
   */
  async runComparison(
    originalDoc: DocumentRecord,
    suspectedDoc: DocumentRecord,
    onProgress: (stage: string, progress: number) => void
  ): Promise<ComparisonRecord> {
    onProgress('Aligning document viewports & DPI rasterization...', 25);
    await new Promise((r) => setTimeout(r, 600));

    onProgress('Running structural difference matrix (SSIM & OCR diff)...', 60);
    await new Promise((r) => setTimeout(r, 800));

    onProgress('Categorizing visual changes (Red, Yellow, Green, Blue)...', 90);
    await new Promise((r) => setTimeout(r, 600));

    const compId = 'comp-' + Date.now().toString(36);

    const differences: ComparisonDifference[] = [
      {
        id: 'diff-' + Math.random().toString(36).substring(2, 6),
        comparison_id: compId,
        page_number: 1,
        difference_type: 'modified_name',
        visual_tag: 'red',
        risk_level: 'critical',
        region_title: 'Payable Amount / Currency Total',
        original_value: '$14,250.00 USD',
        suspected_value: '$142,500.00 USD',
        original_coordinates: { x: 0.56, y: 0.58, width: 0.38, height: 0.05 },
        suspected_coordinates: { x: 0.56, y: 0.58, width: 0.38, height: 0.05 },
        description: 'Value altered with additional zero and mismatched font kerning metrics.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'diff-' + Math.random().toString(36).substring(2, 6),
        comparison_id: compId,
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
        id: 'diff-' + Math.random().toString(36).substring(2, 6),
        comparison_id: compId,
        page_number: 1,
        difference_type: 'added_element',
        visual_tag: 'blue',
        risk_level: 'medium',
        region_title: 'Urgent Wire Transfer Watermark',
        original_value: 'None (Clean field)',
        suspected_value: 'PRIORITY WIRE TRANSFER REQUIRED',
        original_coordinates: { x: 0.51, y: 0.04, width: 0.42, height: 0.05 },
        suspected_coordinates: { x: 0.51, y: 0.04, width: 0.42, height: 0.05 },
        description: 'Newly inserted urgent watermark banner not present in original document.',
        created_at: new Date().toISOString(),
      },
    ];

    const comparison: ComparisonRecord = {
      id: compId,
      user_id: originalDoc.user_id,
      original_document_id: originalDoc.id,
      suspected_document_id: suspectedDoc.id,
      status: 'completed',
      similarity_score: 72.8,
      overall_risk: 'critical',
      text_diff_score: 41.5,
      image_diff_score: 64.0,
      layout_diff_score: 92.0,
      metadata_diff_score: 35.0,
      total_differences: differences.length,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      original_document: originalDoc,
      suspected_document: suspectedDoc,
      differences,
    };

    mockStore.addComparison(comparison);
    return comparison;
  }
}

export const mockForensicEngine = new MockForensicEngine();
