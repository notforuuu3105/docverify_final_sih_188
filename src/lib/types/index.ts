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

export type DocumentType = 'invoice' | 'identity' | 'contract' | 'certificate' | 'general';

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
  uploaded_at: string;
  preview_url?: string; // signed URL or local blob URL for preview
}

export type VerificationVerdict = 'authentic' | 'tampered' | 'forged' | 'suspicious';
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
