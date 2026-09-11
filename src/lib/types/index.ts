// Core TypeScript definitions for DocVerify AI platform

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  organization?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 
  | 'aadhaar'
  | 'pan'
  | 'voter_id'
  | 'passport' 
  | 'driving_license'
  | 'academic'
  | 'legal'
  | 'legal_deed'
  | 'financial'
  | 'invoice'
  | 'visa' 
  | 'national_id' 
  | 'border_permit' 
  | 'identity' 
  | 'contract' 
  | 'certificate' 
  | 'land_record' 
  | 'general';

export interface AadhaarOcrData {
  aadhaar_number_masked: string;
  is_masked: boolean;
  full_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'Other';
  address: string;
  qr_code_detected: boolean;
  qr_code_verified: boolean;
  qr_signature_valid: boolean;
  photo_tamper_detected: boolean;
  dob_tamper_detected: boolean;
  uidai_watermark_present: boolean;
}

export interface PanOcrData {
  pan_number: string;
  pan_format_valid: boolean;
  full_name: string;
  father_name: string;
  date_of_birth: string;
  photo_verified: boolean;
  signature_detected: boolean;
  tamper_flags: string[];
}

export interface BatchItemResult {
  id: string;
  fileName: string;
  fileSize: string;
  documentType: DocumentType;
  verdict: VerificationVerdict;
  tamperingRiskScore: number;
  confidenceScore: number;
  tamperedFields: string[];
  processedAt: string;
}

export interface PassportOcrData {
  document_number: string;
  document_type_code: string;
  issuing_country: string;
  full_name: string;
  surname: string;
  given_names: string;
  nationality: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'X';
  date_of_expiry: string;
  place_of_issue?: string;
  mrz_line1: string;
  mrz_line2: string;
  mrz_checksum_valid: boolean;
  standards_compliance: 'ICAO Doc 9303 Compliant' | 'Non-Compliant Format';
}

export interface VisaOcrData {
  visa_number: string;
  visa_type: string;
  issuing_post: string;
  entries_allowed: string;
  valid_from: string;
  valid_until: string;
  stay_duration: string;
  passport_number_match: boolean;
}

export type PhotoMatchVerdict = 
  | 'Photo match successful' 
  | 'Photo match requires review' 
  | 'Photo match unsuccessful';

export interface BiometricFaceMatchResult {
  document_photo_url: string;
  live_booth_photo_url: string;
  similarity_score: number; // 0 to 100
  match_status: 'matched' | 'mismatch' | 'photo_replaced' | 'requires_review' | 'unsuccessful';
  match_verdict?: PhotoMatchVerdict;
  liveness_verified: boolean;
  confidence_level: 'high' | 'medium' | 'low';
  facial_landmarks_detected: number;
  tamper_flags: string[];
  manual_review_recommended?: boolean;
  live_photo_timestamp?: string;
}

export interface WatchlistQueryResult {
  interpol_sltd_status: 'CLEARED' | 'FLAGGED';
  interpol_sltd_hits: number;
  national_loc_status?: 'NO_ADVERSE_RECORD' | 'INTERDICTION_REQUIRED';
  mha_loc_status?: 'NO_ADVERSE_RECORD' | 'INTERDICTION_REQUIRED';
  expiry_status: 'VALID' | 'EXPIRED' | 'EXPIRING_SOON';
  days_to_expiry: number;
}

export interface OfficerEndorsement {
  officer_id: string;
  officer_name: string;
  officer_designation: string;
  status: 'endorsed' | 'overridden_authentic' | 'referred_physical_lab' | 'cleared_entry' | 'detained_fraud';
  remarks: string;
  endorsed_at: string;
  digital_signature_hash: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  sha256_hash: string;
  page_count: number;
  document_type: DocumentType;
  subtype?: string;
  upload_format?: string;
  uploaded_at: string;
  preview_url?: string; // signed URL or local blob URL for preview
  live_photo_url?: string; // base64 data URI or signed URL of mandatory live selfie
  ela_image_url?: string; // real computed client-side ELA heatmap image
}

export type VerificationVerdict = 
  | 'authentic' 
  | 'tampered' 
  | 'forged' 
  | 'suspicious' 
  | 'partially_verified' 
  | 'review_required' 
  | 'invalid';

export type FieldVerificationStatus =
  | 'DETECTED'
  | 'VALID'
  | 'MATCHED'
  | 'MISMATCH'
  | 'INVALID'
  | 'NOT_DETECTED'
  | 'LOW_CONFIDENCE'
  | 'UNABLE_TO_VERIFY'
  | 'REVIEW_REQUIRED';

export interface FaceDetectionResult {
  detected: boolean;
  count: number;
  confidence: number;
  boundingBox: NormalizedCoordinates | null;
  cropDataUrl?: string;
  status: 'Face Detected' | 'Face Not Detected';
  message?: string;
}

export interface ParsedQrData {
  detected: boolean;
  rawPayload?: string;
  isEncryptedOrUnparseable?: boolean;
  full_name?: string;
  date_of_birth?: string;
  year_of_birth?: string;
  gender?: string;
  aadhaar_number_masked?: string;
  address?: string;
  statusMessage?: string;
}
export type VerificationStatus = 'processing' | 'completed' | 'failed';

export type CheckSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface NormalizedCoordinates {
  x: number;      // 0.0 to 1.0 (left ratio)
  y: number;      // 0.0 to 1.0 (top ratio)
  width: number;  // 0.0 to 1.0 (width ratio)
  height: number; // 0.0 to 1.0 (height ratio)
}

export interface SuspiciousRegion {
  id: string;
  page: number;
  coordinates: NormalizedCoordinates;
  severity: CheckSeverity;
  label: string;
  description: string;
}

export interface VerificationCheck {
  id: string;
  verification_id: string;
  check_type: 'metadata_integrity' | 'font_consistency' | 'layout_alignment' | 'signature_stamp' | 'compression_artifacts' | 'digital_tampering';
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  score: number;
  findings: Record<string, any>;
  suspicious_regions: SuspiciousRegion[];
  created_at: string;
}

export interface BoundingBox2D {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  area?: number;
  normalized?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DetectedDocumentItem {
  type: string;
  confidence: number;
  bbox: BoundingBox2D;
}

export interface PerspectiveCorrectionInfo {
  applied: boolean;
  method: string;
  corners_detected?: boolean;
  skew_angle?: number;
}

export interface DocumentDetectionResult {
  document_detected: boolean;
  document_type: string;
  confidence: number;
  bounding_box?: BoundingBox2D | null;
  all_detected_documents?: DetectedDocumentItem[];
  multiple_documents_detected?: boolean;
  cropped_document?: string | null;
  original_document?: string | null;
  quality_score?: number;
  perspective_correction?: PerspectiveCorrectionInfo;
  message?: string;
}

export interface VerificationRecord {
  id: string;
  document_id: string;
  user_id: string;
  status: VerificationStatus;
  verdict?: VerificationVerdict;
  confidence_score: number;
  tampering_risk_score: number;
  summary: string;
  metadata_analysis: Record<string, any>;
  created_at: string;
  completed_at?: string;
  document?: DocumentRecord;
  checks?: VerificationCheck[];
  officer_endorsement?: OfficerEndorsement;
  ocr_passport_data?: PassportOcrData;
  ocr_visa_data?: VisaOcrData;
  aadhaar_data?: AadhaarOcrData;
  pan_data?: PanOcrData;
  biometric_face_match?: BiometricFaceMatchResult;
  face_detection?: FaceDetectionResult;
  detection?: DocumentDetectionResult;
  qr_data?: ParsedQrData;
  watchlist_query?: WatchlistQueryResult;
  ela_image_url?: string;
  is_live_ocr?: boolean;
  live_ocr_raw_text?: string;
}

export type DifferenceVisualTag = 'red' | 'yellow' | 'green' | 'blue';
// Red = changed, Yellow = suspicious, Green = unchanged, Blue = newly added

export type DifferenceType = 
  | 'modified_name'
  | 'changed_date'
  | 'altered_signature'
  | 'changed_image'
  | 'layout_shift'
  | 'metadata_difference'
  | 'added_element';

export interface ComparisonDifference {
  id: string;
  comparison_id: string;
  page_number: number;
  difference_type: DifferenceType;
  visual_tag: DifferenceVisualTag;
  risk_level: CheckSeverity;
  region_title: string;
  original_value: string;
  suspected_value: string;
  original_coordinates: NormalizedCoordinates;
  suspected_coordinates: NormalizedCoordinates;
  description: string;
  created_at: string;
}

export interface ComparisonRecord {
  id: string;
  user_id: string;
  original_document_id: string;
  suspected_document_id: string;
  status: VerificationStatus;
  similarity_score: number;
  overall_risk: CheckSeverity;
  text_diff_score: number;
  image_diff_score: number;
  layout_diff_score: number;
  metadata_diff_score: number;
  total_differences: number;
  created_at: string;
  completed_at?: string;
  original_document?: DocumentRecord;
  suspected_document?: DocumentRecord;
  differences?: ComparisonDifference[];
}

export interface ReportRecord {
  id: string;
  user_id: string;
  verification_id?: string;
  comparison_id?: string;
  report_type: 'verification' | 'comparison';
  report_title: string;
  storage_path?: string;
  summary_snapshot: Record<string, any>;
  created_at: string;
}

export type VerificationPipelineStage = 
  | 'idle'
  | 'uploading'
  | 'extracting_info'
  | 'visual_analysis'
  | 'metadata_check'
  | 'suspicious_region_detection'
  | 'pattern_analysis'
  | 'result_generation'
  | 'completed'
  | 'failed';

export interface PipelineStageInfo {
  stage: VerificationPipelineStage;
  label: string;
  description: string;
  progress: number; // 0 to 100
}
