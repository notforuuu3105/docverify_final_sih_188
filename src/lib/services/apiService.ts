/**
 * DocVerify AI - Live Backend API Client Service
 * Connects the React Frontend to the FastAPI AI Verification & Comparison Pipeline.
 */

import {
  VerificationRecord,
  ComparisonRecord,
  VerificationPipelineStage,
} from '../types';
import { mockForensicEngine } from '../mockAI/mockEngine';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DemoSampleItem {
  id: string;
  filename: string;
  title: string;
  category: string;
  subtype: string;
  expected_verdict: 'authentic' | 'tampered' | 'suspicious';
  description: string;
  preview_url: string;
}

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  protocol: string;
  features?: string[];
  disclaimer?: string;
  available_samples_count?: number;
}

export class ApiService {
  private isOnlineCache: boolean | null = null;
  private lastHealthCheck: number = 0;

  async checkHealth(): Promise<BackendHealthResponse | null> {
    const now = Date.now();
    if (this.isOnlineCache !== null && now - this.lastHealthCheck < 5000) {
      if (!this.isOnlineCache) return null;
    }

    try {
      const res = await fetch(API_BASE_URL + '/api/health', {
        method: 'GET',
      });

      if (res.ok) {
        const data: BackendHealthResponse = await res.json();
        this.isOnlineCache = true;
        this.lastHealthCheck = now;
        return data;
      }
      this.isOnlineCache = false;
      return null;
    } catch {
      this.isOnlineCache = false;
      this.lastHealthCheck = now;
      return null;
    }
  }

  async getDemoSamples(): Promise<DemoSampleItem[]> {
    try {
      const res = await fetch(API_BASE_URL + '/api/samples');
      if (res.ok) {
        const data = await res.json();
        if (data.samples && data.samples.length > 0) {
          return data.samples;
        }
      }
    } catch (err) {
      console.warn('Failed to load demo samples from backend:', err);
    }

    return [
      {
        id: 'sample_valid_pan',
        filename: '01_valid_pan.png',
        title: 'Authentic Specimen PAN Card',
        category: 'identity',
        subtype: 'pan',
        expected_verdict: 'authentic',
        description: 'Standard Income Tax Department credential with valid alphanumeric syntax and uniform typography.',
        preview_url: '/samples/01_valid_pan.png',
      },
      {
        id: 'sample_valid_aadhaar',
        filename: '02_valid_aadhaar.png',
        title: 'Authentic Specimen Aadhaar Card',
        category: 'identity',
        subtype: 'aadhaar',
        expected_verdict: 'authentic',
        description: 'UIDAI credential with valid Dihedral D5 Verhoeff checksum and clean typography.',
        preview_url: '/samples/02_valid_aadhaar.png',
      },
      {
        id: 'sample_tampered_pan',
        filename: '03_tampered_pan.png',
        title: 'Tampered / Spliced PAN Card',
        category: 'identity',
        subtype: 'pan',
        expected_verdict: 'tampered',
        description: 'Spliced numeric PAN field and overwritten cardholder name with localized compression discontinuities.',
        preview_url: '/samples/03_tampered_pan.png',
      },
      {
        id: 'sample_blurry_doc',
        filename: '04_blurry_lowqual.png',
        title: 'Low-Quality / Degraded Document',
        category: 'identity',
        subtype: 'general',
        expected_verdict: 'suspicious',
        description: 'Artificially blurred and rotated scan designed to trigger quality rejection and confidence degradation.',
        preview_url: '/samples/04_blurry_lowqual.png',
      },
      {
        id: 'sample_degree',
        filename: '05_academic_degree.png',
        title: 'Specimen Degree Certificate',
        category: 'academic',
        subtype: 'degree',
        expected_verdict: 'authentic',
        description: 'University Bachelor of Technology degree with structured candidate roll number and institutional seal.',
        preview_url: '/samples/05_academic_degree.png',
      },
      {
        id: 'sample_valid_passport',
        filename: '06_valid_passport.png',
        title: 'Republic of India Passport (MRZ)',
        category: 'identity',
        subtype: 'passport',
        expected_verdict: 'authentic',
        description: 'Official Indian passport with ICAO Doc 9303 compliant Type-3 Machine Readable Zone lines and cryptographic checksum.',
        preview_url: '/samples/06_valid_passport.png',
      },
      {
        id: 'sample_valid_dl',
        filename: '07_valid_driving_licence.png',
        title: 'Indian Driving Licence (Sarathi)',
        category: 'identity',
        subtype: 'driving_licence',
        expected_verdict: 'authentic',
        description: 'Ministry of Road Transport & Highways standard DL with state code format and vehicle class endorsements.',
        preview_url: '/samples/07_valid_driving_licence.png',
      },
      {
        id: 'sample_valid_voter_id',
        filename: '08_valid_voter_id.png',
        title: 'Election Commission Voter ID (EPIC)',
        category: 'identity',
        subtype: 'voter_id',
        expected_verdict: 'authentic',
        description: 'ECI Electoral Photo Identity Card with standardized alphanumeric EPIC format and elector record.',
        preview_url: '/samples/08_valid_voter_id.png',
      },
    ];
  }

  async fetchSampleAsFile(filename: string): Promise<File> {
    try {
      const sampleUrl = API_BASE_URL + '/static/samples/' + filename;
      const response = await fetch(sampleUrl);
      if (response.ok) {
        const blob = await response.blob();
        return new File([blob], filename, {
          type: blob.type || 'image/png',
          lastModified: Date.now(),
        });
      }
    } catch {
      // Fallback to static public directory
    }

    const localRes = await fetch('/samples/' + filename);
    if (!localRes.ok) {
      throw new Error('Failed to fetch sample ' + filename);
    }
    const blob = await localRes.blob();
    return new File([blob], filename, {
      type: blob.type || 'image/png',
      lastModified: Date.now(),
    });
  }

  async verifyDocument(
    file: File,
    userId: string = 'officer-mha-1',
    categoryHint?: string,
    onProgress?: (stage: VerificationPipelineStage, label: string, progress: number) => void,
    livePhoto?: File | string,
    liveFrames?: string[]
  ): Promise<VerificationRecord> {
    const health = await this.checkHealth();

    if (!health) {
      console.warn('Backend currently offline. Falling back to client-side engine.');
      return mockForensicEngine.runForensicVerification(
        {
          id: 'doc-' + Date.now().toString(36),
          user_id: userId,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: 'temp/' + file.name,
          sha256_hash: 'sha256-fallback',
          page_count: 1,
          document_type: (categoryHint as any) || 'identity',
          uploaded_at: new Date().toISOString(),
          preview_url: URL.createObjectURL(file),
        },
        onProgress || (() => {})
      );
    }

    onProgress?.('uploading', 'Ingesting Document & Generating SHA-256 Digest...', 15);
    await new Promise((r) => setTimeout(r, 200));

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('user_id', userId);
    if (categoryHint) {
      formData.append('category_hint', categoryHint);
    }
    if (livePhoto) {
      if (typeof livePhoto === 'string') {
        formData.append('live_photo_b64', livePhoto);
      } else {
        formData.append('live_photo', livePhoto, livePhoto.name);
      }
    }
    if (liveFrames && liveFrames.length > 0) {
      formData.append('live_frames', JSON.stringify(liveFrames));
    }

    const timer1 = setTimeout(() => {
      onProgress?.('extracting_info', 'Executing Portable OCR & Bounding Box Spatial Mapping...', 35);
    }, 500);

    const timer2 = setTimeout(() => {
      onProgress?.('visual_analysis', 'Multi-Class Document Classifier & Heuristic Analysis...', 55);
    }, 1200);

    const timer3 = setTimeout(() => {
      onProgress?.('pattern_analysis', 'Statutory Checksum Validation & Regex Entity Verification...', 72);
    }, 2000);

    const timer4 = setTimeout(() => {
      onProgress?.('suspicious_region_detection', 'Error Level Analysis (ELA) & Laplacian Noise Discontinuity...', 88);
    }, 2800);

    try {
      const response = await fetch(API_BASE_URL + '/api/verify', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Verification failed: ' + response.statusText);
      }

      onProgress?.('result_generation', 'Calculating Central Multi-Factor Composite Score & Verdict...', 96);
      await new Promise((r) => setTimeout(r, 200));

      const record: VerificationRecord = await response.json();
      onProgress?.('completed', 'Forensic Verification Dossier Complete', 100);

      return record;
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      throw err;
    }
  }

  /**
   * Dedicated 1:1 Biometric Face Verification (SIH26188):
   * Compares document portrait against live camera frame.
   */
  async verifyFaceBiometrics(params: {
    documentFile?: File | Blob;
    documentFaceBase64?: string;
    liveFile?: File | Blob;
    liveFaceBase64?: string;
    liveFrames?: string[];
  }): Promise<any> {
    const formData = new FormData();
    if (params.documentFile) {
      formData.append('document_file', params.documentFile);
    }
    if (params.documentFaceBase64) {
      formData.append('document_face', params.documentFaceBase64);
    }
    if (params.liveFile) {
      formData.append('live_file', params.liveFile);
    }
    if (params.liveFaceBase64) {
      formData.append('live_face', params.liveFaceBase64);
    }
    if (params.liveFrames && params.liveFrames.length > 0) {
      formData.append('live_frames', JSON.stringify(params.liveFrames));
    }

    const response = await fetch(API_BASE_URL + '/api/face/verify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.detail || 'Biometric verification failed: ' + response.statusText);
    }

    return await response.json();
  }

  async compareDocuments(
    origFile: File,
    suspFile: File,
    onProgress?: (label: string) => void
  ): Promise<ComparisonRecord> {
    const health = await this.checkHealth();

    if (!health) {
      console.warn('Backend unreachable for comparison. Falling back to local simulation.');
      return mockForensicEngine.runComparison(
        {
          id: 'doc-orig',
          user_id: 'officer-1',
          file_name: origFile.name,
          file_size: origFile.size,
          mime_type: origFile.type,
          storage_path: 'temp/' + origFile.name,
          sha256_hash: 'orig-hash',
          page_count: 1,
          document_type: 'identity',
          uploaded_at: new Date().toISOString(),
          preview_url: URL.createObjectURL(origFile),
        },
        {
          id: 'doc-susp',
          user_id: 'officer-1',
          file_name: suspFile.name,
          file_size: suspFile.size,
          mime_type: suspFile.type,
          storage_path: 'temp/' + suspFile.name,
          sha256_hash: 'susp-hash',
          page_count: 1,
          document_type: 'identity',
          uploaded_at: new Date().toISOString(),
          preview_url: URL.createObjectURL(suspFile),
        },
        (stage) => onProgress?.(stage)
      );
    }

    onProgress?.('Uploading master and suspected documents to comparison engine...');

    const formData = new FormData();
    formData.append('original_file', origFile, origFile.name);
    formData.append('suspected_file', suspFile, suspFile.name);

    onProgress?.('Generating SSIM visual variance heatmap & extracting OCR token alignments...');

    try {
      const response = await fetch(API_BASE_URL + '/api/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Comparison failed: ' + response.statusText);
      }

      onProgress?.('Assembling visual differential matrix & color-coded discrepancy markers...');
      const record: ComparisonRecord = await response.json();
      return record;
    } catch (err: any) {
      console.error('Error during backend comparison, falling back to local simulation:', err);
      return mockForensicEngine.runComparison(
        {
          id: 'doc-orig',
          user_id: 'officer-1',
          file_name: origFile.name,
          file_size: origFile.size,
          mime_type: origFile.type,
          storage_path: 'temp/' + origFile.name,
          sha256_hash: 'orig-hash',
          page_count: 1,
          document_type: 'identity',
          uploaded_at: new Date().toISOString(),
          preview_url: URL.createObjectURL(origFile),
        },
        {
          id: 'doc-susp',
          user_id: 'officer-1',
          file_name: suspFile.name,
          file_size: suspFile.size,
          mime_type: suspFile.type,
          storage_path: 'temp/' + suspFile.name,
          sha256_hash: 'susp-hash',
          page_count: 1,
          document_type: 'identity',
          uploaded_at: new Date().toISOString(),
          preview_url: URL.createObjectURL(suspFile),
        },
        (stage) => onProgress?.(stage)
      );
    }
  }
}

export const apiService = new ApiService();
