-- ─── profiles ──────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: lecture pour tous les connectés"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles: mise à jour du profil personnel"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles: insertion à la création du compte"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ─── documents ─────────────────────────────────────────────────────────────
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents: lecture pour tous les connectés"
  ON documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "documents: insertion par les connectés"
  ON documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "documents: modification par les connectés"
  ON documents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "documents: suppression par les connectés"
  ON documents FOR DELETE TO authenticated USING (true);

-- ─── document_locks ────────────────────────────────────────────────────────
ALTER TABLE document_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_locks: lecture"
  ON document_locks FOR SELECT TO authenticated USING (true);

CREATE POLICY "document_locks: insertion"
  ON document_locks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "document_locks: modification"
  ON document_locks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "document_locks: suppression"
  ON document_locks FOR DELETE TO authenticated USING (true);

-- ─── document_versions ─────────────────────────────────────────────────────
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_versions: lecture"
  ON document_versions FOR SELECT TO authenticated USING (true);

CREATE POLICY "document_versions: insertion"
  ON document_versions FOR INSERT TO authenticated WITH CHECK (true);

-- ─── comments ──────────────────────────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments: lecture"
  ON comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "comments: insertion"
  ON comments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "comments: suppression par l'auteur"
  ON comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ─── activity_log ──────────────────────────────────────────────────────────
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log: lecture pour tous les connectés"
  ON activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "activity_log: insertion par les connectés"
  ON activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- ─── notifications ─────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: lecture des siennes"
  ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications: insertion"
  ON notifications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "notifications: modification des siennes"
  ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications: suppression des siennes"
  ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ─── Storage bucket + policies ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,  -- 50 Mo max par fichier
  ARRAY['application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png','image/jpeg','image/webp','image/gif',
        'application/zip','text/plain','text/csv']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage documents: lecture"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "storage documents: upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "storage documents: modification"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "storage documents: suppression"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents');
