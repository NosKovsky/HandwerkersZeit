-- Tabelle für Dokumente erstellen
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kommentar zur Tabelle
COMMENT ON TABLE public.project_documents IS 'Speichert Dokumente, die zu einer Baustelle hochgeladen wurden.';

-- Index für schnellen Zugriff
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON public.project_documents(project_id);

-- Trigger für updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'set_project_documents_updated_at'
    ) THEN
        CREATE TRIGGER set_project_documents_updated_at
        BEFORE UPDATE ON public.project_documents
        FOR EACH ROW
        EXECUTE FUNCTION public.set_current_timestamp_updated_at();
    END IF;
END $$;

-- Storage Bucket für Dokumente erstellen, falls noch nicht vorhanden
-- (Dies muss normalerweise über die Supabase UI oder API gemacht werden)
