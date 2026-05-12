-- ─── Diagnostic : voir les policies actuelles ────────────────────────────────
-- (optionnel, pour vérifier ce qui existe déjà)
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies WHERE schemaname = 'public';

-- ─── GRANTS de base sur le schéma public ─────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles          TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents         TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_locks    TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_versions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments          TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_log      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications     TO anon, authenticated;

-- Séquences (pour les colonnes SERIAL / BIGSERIAL si présentes)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ─── Supprimer les anciennes policies (évite les conflits) ───────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END$$;

-- ─── Recréer toutes les policies (noms ASCII simples) ────────────────────────

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read"   ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_read"   ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "docs_insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "docs_update" ON public.documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "docs_delete" ON public.documents FOR DELETE TO authenticated USING (true);

-- document_locks
ALTER TABLE public.document_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locks_read"   ON public.document_locks FOR SELECT TO authenticated USING (true);
CREATE POLICY "locks_insert" ON public.document_locks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "locks_update" ON public.document_locks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "locks_delete" ON public.document_locks FOR DELETE TO authenticated USING (true);

-- document_versions
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "versions_read"   ON public.document_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "versions_insert" ON public.document_versions FOR INSERT TO authenticated WITH CHECK (true);

-- comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read"   ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_read"   ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_read"   ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ─── Storage bucket + policies ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Supprimer anciennes policies storage
DROP POLICY IF EXISTS "storage documents: lecture"     ON storage.objects;
DROP POLICY IF EXISTS "storage documents: upload"      ON storage.objects;
DROP POLICY IF EXISTS "storage documents: modification" ON storage.objects;
DROP POLICY IF EXISTS "storage documents: suppression" ON storage.objects;

CREATE POLICY "storage_read"   ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "storage_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');
