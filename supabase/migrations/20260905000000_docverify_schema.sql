-- ==============================================================================
-- DocVerify AI - Complete PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    organization TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Function and trigger to auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    document_type TEXT DEFAULT 'general',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_sha256 ON public.documents(sha256_hash);


-- 3. VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    verdict TEXT CHECK (verdict IN ('authentic', 'tampered', 'forged', 'suspicious')),
    confidence_score NUMERIC(5,2) DEFAULT 0.00,
    tampering_risk_score NUMERIC(5,2) DEFAULT 0.00,
    summary TEXT,
    metadata_analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own verifications"
    ON public.verifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
    ON public.verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications"
    ON public.verifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_verifications_document_id ON public.verifications(document_id);
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON public.verifications(user_id);


-- 4. VERIFICATION_CHECKS TABLE
CREATE TABLE IF NOT EXISTS public.verification_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('passed', 'warning', 'failed')),
    score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    findings JSONB DEFAULT '{}'::jsonb,
    suspicious_regions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read checks for their verifications"
    ON public.verification_checks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.verifications v
            WHERE v.id = verification_checks.verification_id
            AND v.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert checks for their verifications"
    ON public.verification_checks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.verifications v
            WHERE v.id = verification_checks.verification_id
            AND v.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_verification_checks_verification_id ON public.verification_checks(verification_id);


-- 5. COMPARISONS TABLE (REAL vs TAMPERED)
CREATE TABLE IF NOT EXISTS public.comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    original_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
    suspected_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    similarity_score NUMERIC(5,2) DEFAULT 0.00,
    overall_risk TEXT CHECK (overall_risk IN ('low', 'medium', 'high', 'critical')),
    text_diff_score NUMERIC(5,2) DEFAULT 0.00,
    image_diff_score NUMERIC(5,2) DEFAULT 0.00,
    layout_diff_score NUMERIC(5,2) DEFAULT 0.00,
    metadata_diff_score NUMERIC(5,2) DEFAULT 0.00,
    total_differences INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own comparisons"
    ON public.comparisons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comparisons"
    ON public.comparisons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comparisons"
    ON public.comparisons FOR UPDATE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comparisons_user_id ON public.comparisons(user_id);


-- 6. COMPARISON_DIFFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.comparison_differences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comparison_id UUID NOT NULL REFERENCES public.comparisons(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    difference_type TEXT NOT NULL,
    visual_tag TEXT NOT NULL CHECK (visual_tag IN ('red', 'yellow', 'green', 'blue')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    region_title TEXT NOT NULL,
    original_value TEXT,
    suspected_value TEXT,
    original_coordinates JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 0, "height": 0}'::jsonb,
    suspected_coordinates JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 0, "height": 0}'::jsonb,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comparison_differences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read differences for their comparisons"
    ON public.comparison_differences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.comparisons c
            WHERE c.id = comparison_differences.comparison_id
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert differences for their comparisons"
    ON public.comparison_differences FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.comparisons c
            WHERE c.id = comparison_differences.comparison_id
            AND c.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_comparison_differences_comp_id ON public.comparison_differences(comparison_id);


-- 7. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verification_id UUID REFERENCES public.verifications(id) ON DELETE SET NULL,
    comparison_id UUID REFERENCES public.comparisons(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('verification', 'comparison')),
    report_title TEXT NOT NULL,
    storage_path TEXT,
    summary_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
    ON public.reports FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);


-- ==============================================================================
-- 8. STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================

-- Create private storage buckets if storage extension is active
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for documents bucket
CREATE POLICY "Users can upload own documents to storage"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own documents in storage"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own documents in storage"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS for reports bucket
CREATE POLICY "Users can upload own reports to storage"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'reports' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own reports in storage"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'reports' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
