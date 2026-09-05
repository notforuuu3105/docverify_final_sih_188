import { supabase, isSupabaseConfigured } from '../supabase';
import {
  DocumentRecord,
  VerificationRecord,
  ComparisonRecord,
  ComparisonDifference,
  ReportRecord,
} from '../types';
import { mockStore } from '../mockAI/mockEngine';

export class SupabaseService {
  /**
   * Upload file to Supabase private Storage bucket
   */
  async uploadDocument(file: File, userId: string, docId: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      return URL.createObjectURL(file);
    }

    const path = `${userId}/${docId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to local blob:', uploadError);
      return URL.createObjectURL(file);
    }

    // Generate secure signed URL with 1-hour expiry
    const { data, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 3600);

    if (signError || !data?.signedUrl) {
      return URL.createObjectURL(file);
    }

    return data.signedUrl;
  }

  /**
   * Store Document record in PostgreSQL
   */
  async saveDocument(doc: DocumentRecord): Promise<void> {
    mockStore.addDocument(doc);

    if (!isSupabaseConfigured()) return;

    const { error } = await supabase.from('documents').insert({
      id: doc.id,
      user_id: doc.user_id,
      file_name: doc.file_name,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      storage_path: doc.storage_path,
      sha256_hash: doc.sha256_hash,
      page_count: doc.page_count,
      document_type: doc.document_type,
      uploaded_at: doc.uploaded_at,
    });

    if (error) {
      console.warn('Supabase documents insert error:', error);
    }
  }

  /**
   * Store Verification master record and granular checks
   */
  async saveVerification(verif: VerificationRecord): Promise<void> {
    mockStore.addVerification(verif);

    if (!isSupabaseConfigured()) return;

    // 1. Insert master verification
    const { error: vError } = await supabase.from('verifications').insert({
      id: verif.id,
      document_id: verif.document_id,
      user_id: verif.user_id,
      status: verif.status,
      verdict: verif.verdict,
      confidence_score: verif.confidence_score,
      tampering_risk_score: verif.tampering_risk_score,
      summary: verif.summary,
      metadata_analysis: verif.metadata_analysis,
      created_at: verif.created_at,
      completed_at: verif.completed_at,
    });

    if (vError) {
      console.warn('Supabase verifications insert error:', vError);
      return;
    }

    // 2. Insert granular checks
    if (verif.checks && verif.checks.length > 0) {
      const checkRows = verif.checks.map((chk) => ({
        id: chk.id,
        verification_id: verif.id,
        check_type: chk.check_type,
        title: chk.title,
        description: chk.description,
        status: chk.status,
        score: chk.score,
        findings: chk.findings,
        suspicious_regions: chk.suspicious_regions,
        created_at: chk.created_at,
      }));

      const { error: chkError } = await supabase.from('verification_checks').insert(checkRows);
      if (chkError) {
        console.warn('Supabase verification_checks insert error:', chkError);
      }
    }
  }

  /**
   * Fetch all user verifications with relations
   */
  async getVerifications(): Promise<VerificationRecord[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getVerifications();
    }

    try {
      const { data, error } = await supabase
        .from('verifications')
        .select(`
          *,
          document:documents(*),
          checks:verification_checks(*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockStore.getVerifications();
      }

      return data as VerificationRecord[];
    } catch {
      return mockStore.getVerifications();
    }
  }

  /**
   * Save Dual Document Comparison
   */
  async saveComparison(comp: ComparisonRecord): Promise<void> {
    mockStore.addComparison(comp);

    if (!isSupabaseConfigured()) return;

    const { error: cError } = await supabase.from('comparisons').insert({
      id: comp.id,
      user_id: comp.user_id,
      original_document_id: comp.original_document_id,
      suspected_document_id: comp.suspected_document_id,
      status: comp.status,
      similarity_score: comp.similarity_score,
      overall_risk: comp.overall_risk,
      text_diff_score: comp.text_diff_score,
      image_diff_score: comp.image_diff_score,
      layout_diff_score: comp.layout_diff_score,
      metadata_diff_score: comp.metadata_diff_score,
      total_differences: comp.total_differences,
      created_at: comp.created_at,
      completed_at: comp.completed_at,
    });

    if (cError) {
      console.warn('Supabase comparisons insert error:', cError);
      return;
    }

    if (comp.differences && comp.differences.length > 0) {
      const diffRows = comp.differences.map((diff) => ({
        id: diff.id,
        comparison_id: comp.id,
        page_number: diff.page_number,
        difference_type: diff.difference_type,
        visual_tag: diff.visual_tag,
        risk_level: diff.risk_level,
        region_title: diff.region_title,
        original_value: diff.original_value,
        suspected_value: diff.suspected_value,
        original_coordinates: diff.original_coordinates,
        suspected_coordinates: diff.suspected_coordinates,
        description: diff.description,
        created_at: diff.created_at,
      }));

      const { error: diffError } = await supabase
        .from('comparison_differences')
        .insert(diffRows);

      if (diffError) {
        console.warn('Supabase comparison_differences insert error:', diffError);
      }
    }
  }

  /**
   * Fetch all user comparisons with differences and source documents
   */
  async getComparisons(): Promise<ComparisonRecord[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getComparisons();
    }

    try {
      const { data, error } = await supabase
        .from('comparisons')
        .select(`
          *,
          differences:comparison_differences(*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockStore.getComparisons();
      }

      return data as ComparisonRecord[];
    } catch {
      return mockStore.getComparisons();
    }
  }
}

export const supabaseService = new SupabaseService();
