'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

function relativeTime(iso) {
  if (!iso) return '—';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)     return "à l'instant";
  if (diff < 3600)   return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)  return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return 'hier';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function mapDoc(d) {
  return {
    id: d.id, name: d.name, type: d.type,
    folder: d.folder_path || 'Sans dossier',
    folder_id: d.folder_id ?? null,
    size: d.size || '—', version: d.version || '1.0', status: d.status || 'draft',
    owner: d.owner_id, updatedBy: d.updated_by,
    updatedAt: relativeTime(d.updated_at || d.created_at),
    tags: Array.isArray(d.tags) ? d.tags : [],
    confidential: d.confidential || 'Interne',
    expires: d.expires_at ? new Date(d.expires_at).toLocaleDateString('fr-FR') : null,
    lockedBy: d.document_locks?.[0]?.locked_by ?? null,
    lockedSince: d.document_locks?.[0]?.locked_at
      ? new Date(d.document_locks[0].locked_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : null,
    storage_path: d.storage_path ?? null,
  };
}

function mapVersion(v, isCurrent) {
  return {
    v: v.version, author: v.author_id,
    date: v.created_at
      ? new Date(v.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + new Date(v.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '—',
    note: v.note || '', size: v.size || '—', milestone: v.milestone ?? false, current: isCurrent,
  };
}

function mapComment(c) {
  return { id: c.id, who: c.author_id, text: c.text, when: relativeTime(c.created_at), ts: new Date(c.created_at).getTime() };
}

const DocsCtx = createContext(null);

export function DocsProvider({ children }) {
  const [docs,     setDocs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [profiles, setProfiles] = useState({});
  const [comments, setComments] = useState({});
  const [versions, setVersions] = useState({});
  const [contents, setContents] = useState({});

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    async function init() {
      const [{ data: docRows }, { data: profileRows }] = await Promise.all([
        supabase.from('documents').select('*, document_locks(*)').order('updated_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ]);
      if (docRows)     setDocs(docRows.map(mapDoc));
      if (profileRows) {
        const map = {};
        profileRows.forEach(p => { map[p.id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    }
    init();

    const refreshDocs = async () => {
      const { data } = await supabase.from('documents').select('*, document_locks(*)').order('updated_at', { ascending: false });
      if (data) setDocs(data.map(mapDoc));
    };

    const channel = supabase.channel('ged-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, refreshDocs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'document_locks' }, refreshDocs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchComments = useCallback(async (docId) => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from('comments').select('*').eq('document_id', docId).order('created_at');
    if (data) setComments(c => ({ ...c, [docId]: data.map(mapComment) }));
  }, []);

  const fetchVersions = useCallback(async (docId) => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from('document_versions').select('*').eq('document_id', docId).order('created_at', { ascending: false });
    if (data && data.length > 0) setVersions(v => ({ ...v, [docId]: data.map((row, i) => mapVersion(row, i === 0)) }));
  }, []);

  const addDoc = useCallback(async (doc) => {
    const supabase = createClient();
    if (!supabase) {
      const temp = { ...doc, updatedAt: "à l'instant" };
      setDocs(d => [temp, ...d]);
      return temp;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('documents').insert({
      name: doc.name, type: doc.type || 'doc', folder_path: doc.folder || 'Sans dossier',
      folder_id: doc.folder_id ?? null, size: doc.size ?? null, version: doc.version || '1.0',
      status: doc.status || 'draft', owner_id: user?.id ?? null, updated_by: user?.id ?? null,
      tags: doc.tags ?? [], confidential: doc.confidential || 'Interne',
      expires_at: doc.expires_at ?? null, storage_path: doc.storage_path ?? null,
    }).select('*, document_locks(*)').single();
    if (error) { console.error('addDoc:', error.message); return null; }
    const mapped = mapDoc(data);
    setDocs(d => [mapped, ...d]);
    if (user) await supabase.from('activity_log').insert({ user_id: user.id, action: 'upload', document_id: data.id, document_name: data.name }).then(() => {}, () => {});
    return mapped;
  }, []);

  const updateDoc = useCallback(async (id, changes) => {
    setDocs(d => d.map(doc => doc.id === id ? { ...doc, ...changes, updatedAt: "à l'instant" } : doc));
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { updated_at: new Date().toISOString(), updated_by: user?.id };
    if (changes.name         !== undefined) payload.name = changes.name;
    if (changes.status       !== undefined) payload.status = changes.status;
    if (changes.version      !== undefined) payload.version = changes.version;
    if (changes.folder       !== undefined) payload.folder_path = changes.folder;
    if (changes.tags         !== undefined) payload.tags = changes.tags;
    if (changes.confidential !== undefined) payload.confidential = changes.confidential;
    if (changes.expires      !== undefined) payload.expires_at = changes.expires;
    if (changes.storage_path !== undefined) payload.storage_path = changes.storage_path;
    await supabase.from('documents').update(payload).eq('id', id);
  }, []);

  const deleteDoc = useCallback(async (id) => {
    setDocs(d => d.filter(doc => doc.id !== id));
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from('documents').delete().eq('id', id);
  }, []);

  const addComment = useCallback(async (docId, comment) => {
    setComments(c => ({ ...c, [docId]: [...(c[docId] || []), comment] }));
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('comments').insert({ document_id: docId, author_id: user?.id ?? null, text: comment.text });
    fetchComments(docId);
  }, [fetchComments]);

  const deleteComment = useCallback(async (docId, commentId) => {
    setComments(c => ({ ...c, [docId]: (c[docId] || []).filter(x => x.id !== commentId) }));
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from('comments').delete().eq('id', commentId);
  }, []);

  const addVersion = useCallback(async (docId, version) => {
    setVersions(v => ({ ...v, [docId]: [{ ...version, current: true }, ...(v[docId] || []).map(x => ({ ...x, current: false }))] }));
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('document_versions').insert({
      document_id: docId, version: version.v, author_id: user?.id ?? null,
      note: version.note, size: version.size, milestone: version.milestone ?? false,
    });
  }, []);

  const updateContent = useCallback((docId, content) => {
    setContents(c => ({ ...c, [docId]: content }));
  }, []);

  const getProfile = useCallback((id) => profiles[id] ?? null, [profiles]);

  return (
    <DocsCtx.Provider value={{
      docs, loading, profiles, getProfile,
      comments, versions, contents,
      fetchComments, fetchVersions,
      addDoc, updateDoc, deleteDoc,
      addComment, deleteComment, addVersion, updateContent,
    }}>
      {children}
    </DocsCtx.Provider>
  );
}

export function useDocs() {
  const ctx = useContext(DocsCtx);
  if (!ctx) throw new Error('useDocs must be used within DocsProvider');
  return ctx;
}
