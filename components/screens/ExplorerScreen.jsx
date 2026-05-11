'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon, StatusBadge } from '@/components/ui/Atoms';
import { useDocs } from '@/lib/context/DocsContext';
import { useToast } from '@/lib/context/ToastContext';
import { USERS, ME, FOLDERS } from '@/lib/data';

/* ─── New document modal ─── */
const FOLDER_OPTIONS = FOLDERS.map((f) => f.name);
const TYPE_OPTIONS = [
  { value: 'doc', label: 'Document Word (.docx)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'xls', label: 'Tableur (.xlsx)' },
  { value: 'img', label: 'Image (.png / .jpg)' },
];
const CONF_OPTIONS = ['Public', 'Interne', 'Confidentiel'];

function NewDocModal({ onClose }) {
  const { addDoc } = useDocs();
  const { showToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', type: 'doc', folder: FOLDER_OPTIONS[0], tags: '', confidential: 'Interne', expires: '', status: 'draft' });
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!form.name) setForm((p) => ({ ...p, name: f.name.replace(/\.[^.]+$/, '') })); }
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const id = `d${Date.now()}`;
    const ext = { doc: '.docx', pdf: '.pdf', xls: '.xlsx', img: '.png' }[form.type] || '';
    const nameWithExt = form.name.endsWith(ext) ? form.name : form.name + ext;
    const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    addDoc({ id, name: nameWithExt, type: form.type, folder: form.folder, size: file ? `${Math.round(file.size / 1024)} Ko` : '—', version: '1.0', status: form.status, owner: ME.id, updatedBy: ME.id, updatedAt: "à l'instant", tags, confidential: form.confidential, expires: form.expires || null });
    showToast({ type: 'success', message: 'Document créé avec succès' });
    onClose(); router.push(`/documents/${id}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }} onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--surface)', borderRadius: 14, width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }}>
        <div className="card-hd" style={{ padding: '18px 22px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Nouveau document</h2>
          <button className="btn ghost sm" style={{ padding: 6 }} onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
            onClick={() => document.getElementById('nd-file').click()}
            style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--line-strong)'}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-soft)' : 'var(--surface-2)', transition: 'all .15s' }}>
            <input id="nd-file" type="file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files[0]; if (f) { setFile(f); setForm((p) => ({ ...p, name: f.name.replace(/\.[^.]+$/, '') })); } }} />
            <Icon name="upload" size={22} style={{ color: 'var(--accent)', marginBottom: 6 }} />
            {file ? <div style={{ fontSize: 13.5, fontWeight: 500 }}>{file.name} <span className="muted mono">({Math.round(file.size / 1024)} Ko)</span></div>
              : <><div style={{ fontSize: 13.5, fontWeight: 500 }}>Glisser-déposer un fichier</div><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>ou cliquer pour parcourir</div></>}
          </div>
          <div><label className="label">Nom *</label><input className="input" value={form.name} onChange={set('name')} placeholder="ex. Convention formation 2026" autoFocus /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">Type</label><select className="input" value={form.type} onChange={set('type')}>{TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className="label">Statut</label><select className="input" value={form.status} onChange={set('status')}><option value="draft">Brouillon</option><option value="review">En validation</option></select></div>
          </div>
          <div><label className="label">Dossier</label><select className="input" value={form.folder} onChange={set('folder')}>{FOLDER_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">Confidentialité</label><select className="input" value={form.confidential} onChange={set('confidential')}>{CONF_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label">Expiration</label><input className="input" type="date" value={form.expires} onChange={set('expires')} /></div>
          </div>
          <div><label className="label">Tags <span className="muted">(virgules)</span></label><input className="input" value={form.tags} onChange={set('tags')} placeholder="qualiopi, contrat, 2026" /></div>
        </div>
        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={handleSave} disabled={!form.name.trim()}><Icon name="plus" size={14} /> Créer</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Context menu ─── */
function ContextMenu({ x, y, doc, onClose, onOpen, onEdit, onDelete, onMove, onDownload }) {
  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  const items = [
    { label: 'Ouvrir', icon: 'eye', action: onOpen },
    { label: 'Modifier le contenu', icon: 'edit', action: onEdit },
    { divider: true },
    { label: 'Télécharger', icon: 'download', action: onDownload },
    { label: 'Déplacer vers…', icon: 'move', action: onMove },
    { label: 'Copier le lien', icon: 'link', action: () => { navigator.clipboard?.writeText(window.location.origin + '/documents/' + doc.id); onClose(); } },
    { divider: true },
    { label: 'Supprimer', icon: 'trash', action: onDelete, danger: true },
  ];

  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      position: 'fixed', top: y, left: x, zIndex: 2000,
      background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,.18)', padding: '4px 0', minWidth: 200,
    }}>
      {items.map((item, i) =>
        item.divider ? <div key={i} style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
          : <div key={i} onClick={() => { item.action?.(); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: item.danger ? 'var(--err)' : 'var(--ink)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Icon name={item.icon} size={14} />
              {item.label}
            </div>
      )}
    </div>
  );
}

/* ─── Upload progress queue ─── */
function UploadQueue({ items, onDismiss }) {
  if (!items.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
      {items.map((item) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', boxShadow: '0 4px 20px rgba(0,0,0,.12)' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="row" style={{ gap: 8 }}>
              <Icon name="upload" size={14} style={{ color: item.progress === 100 ? 'var(--ok)' : 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
            </div>
            {item.progress === 100 && <button onClick={() => onDismiss(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>×</button>}
          </div>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${item.progress}%` }} transition={{ duration: 0.3 }}
              style={{ height: '100%', background: item.progress === 100 ? 'var(--ok)' : 'var(--accent)', borderRadius: 99 }} />
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--ink-3)' }}>
            <span>{item.size}</span>
            <span>{item.progress === 100 ? '✓ Terminé' : `${item.progress}%`}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main drive screen ─── */
export default function ExplorerScreen() {
  const router = useRouter();
  const { docs, deleteDoc } = useDocs();
  const { showToast } = useToast();

  const [folder, setFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [sort, setSort] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(new Set());
  const [showNew, setShowNew] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [globalDrag, setGlobalDrag] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [search, setSearch] = useState('');
  const dragCounter = useRef(0);

  /* filter & sort */
  const filtered = docs.filter((d) => {
    const matchFolder = !folder || d.folder.toLowerCase().includes(folder.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'locked' && !!d.lockedBy) || (filter === 'review' && (d.status === 'review' || d.status === 'pending')) || (filter === 'mine' && d.owner === ME.id);
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.tags?.some((t) => t.includes(search.toLowerCase()));
    return matchFolder && matchFilter && matchSearch;
  }).sort((a, b) => {
    let cmp = 0;
    if (sort === 'name') cmp = a.name.localeCompare(b.name);
    else if (sort === 'status') cmp = a.status.localeCompare(b.status);
    else if (sort === 'version') cmp = parseFloat(b.version) - parseFloat(a.version);
    else cmp = 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  /* global drag-from-desktop */
  const handleWindowDragEnter = useCallback((e) => {
    e.preventDefault(); dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) setGlobalDrag(true);
  }, []);
  const handleWindowDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) setGlobalDrag(false);
  }, []);
  const handleWindowDrop = useCallback((e) => {
    e.preventDefault(); setGlobalDrag(false); dragCounter.current = 0;
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    files.forEach((file) => simulateUpload(file));
  }, []);

  useEffect(() => {
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', handleWindowDrop);
    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [handleWindowDragEnter, handleWindowDragLeave, handleWindowDrop]);

  const simulateUpload = (file) => {
    const id = Date.now().toString();
    const item = { id, name: file.name, size: `${Math.round(file.size / 1024)} Ko`, progress: 0 };
    setUploads((u) => [...u, item]);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) { progress = 100; clearInterval(interval); }
      setUploads((u) => u.map((x) => x.id === id ? { ...x, progress: Math.round(progress) } : x));
    }, 300);
    showToast({ type: 'info', message: `Téléversement de ${file.name}…` });
  };

  const toggleSelect = (id, e) => {
    if (e.shiftKey && selected.size > 0) {
      const ids = filtered.map((d) => d.id);
      const last = ids.findIndex((x) => selected.has(x));
      const current = ids.indexOf(id);
      const [a, b] = [Math.min(last, current), Math.max(last, current)];
      setSelected(new Set(ids.slice(a, b + 1)));
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  const openFolder = (f) => {
    setFolder(f.name);
    setBreadcrumb((b) => [...b, f]);
    setSelected(new Set());
  };
  const navTo = (idx) => {
    if (idx === -1) { setFolder(null); setBreadcrumb([]); }
    else { const b = breadcrumb.slice(0, idx + 1); setBreadcrumb(b); setFolder(b[b.length - 1]?.name || null); }
    setSelected(new Set());
  };

  const handleContextMenu = (e, doc) => {
    e.preventDefault();
    setContextMenu({ x: Math.min(e.clientX, window.innerWidth - 220), y: Math.min(e.clientY, window.innerHeight - 300), doc });
  };

  const handleDelete = (doc) => {
    if (selected.size > 1 && selected.has(doc.id)) {
      selected.forEach((id) => deleteDoc(id));
      setSelected(new Set());
      showToast({ type: 'success', message: `${selected.size} documents supprimés` });
    } else {
      deleteDoc(doc.id);
      showToast({ type: 'success', message: 'Document supprimé' });
    }
  };

  const SortHeader = ({ col, label, style: s }) => (
    <th style={{ cursor: 'pointer', userSelect: 'none', ...s }} onClick={() => { if (sort === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSort(col); setSortDir('asc'); } }}>
      <span className="row" style={{ gap: 4, display: 'inline-flex', alignItems: 'center' }}>
        {label}
        {sort === col && <Icon name={sortDir === 'asc' ? 'chevD' : 'chevD'} size={10} style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none' }} />}
      </span>
    </th>
  );

  return (
    <div className="page" style={{ paddingTop: 22, position: 'relative' }}>
      <AnimatePresence>{showNew && <NewDocModal onClose={() => setShowNew(false)} />}</AnimatePresence>

      {/* Context menu */}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} doc={contextMenu.doc}
        onClose={() => setContextMenu(null)}
        onOpen={() => router.push(`/documents/${contextMenu.doc.id}`)}
        onEdit={() => router.push(`/documents/${contextMenu.doc.id}/edit`)}
        onDelete={() => handleDelete(contextMenu.doc)}
        onDownload={() => showToast({ type: 'info', message: 'Téléchargement lancé…' })}
        onMove={() => showToast({ type: 'info', message: 'Déplacer : sélectionner le dossier cible' })}
      />}

      {/* Upload queue */}
      <AnimatePresence>
        <UploadQueue items={uploads} onDismiss={(id) => setUploads((u) => u.filter((x) => x.id !== id))} />
      </AnimatePresence>

      {/* Global drag overlay */}
      <AnimatePresence>
        {globalDrag && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(79,70,229,.12)', border: '3px dashed var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, pointerEvents: 'none' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="upload" size={36} style={{ color: '#fff' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>Déposer pour téléverser</div>
            <div style={{ fontSize: 15, color: 'var(--ink-2)' }}>Les fichiers seront ajoutés au dossier actuel</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Documents</h1>
          <div className="row" style={{ gap: 6, fontSize: 12.5, color: 'var(--ink-3)' }}>
            <span>{docs.length} documents</span>
            <span>·</span>
            <span>{FOLDERS.length} dossiers</span>
            {selected.size > 0 && <><span>·</span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span></>}
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {selected.size > 0 && (
            <div className="row" style={{ gap: 6, padding: '6px 12px', background: 'var(--surface-2)', borderRadius: 8, marginRight: 4 }}>
              <button className="btn sm ghost" onClick={() => showToast({ type: 'info', message: 'Déplacer la sélection…' })}><Icon name="move" size={12} /> Déplacer</button>
              <button className="btn sm ghost" onClick={() => showToast({ type: 'info', message: 'Télécharger la sélection…' })}><Icon name="download" size={12} /> Télécharger</button>
              <button className="btn sm ghost" style={{ color: 'var(--err)' }} onClick={() => { selected.forEach((id) => deleteDoc(id)); setSelected(new Set()); showToast({ type: 'success', message: `${selected.size} supprimé(s)` }); }}><Icon name="trash" size={12} /> Supprimer</button>
            </div>
          )}
          <button className="btn" onClick={() => document.getElementById('drive-upload').click()}><Icon name="upload" size={13} /> Téléverser</button>
          <input id="drive-upload" type="file" multiple style={{ display: 'none' }} onChange={(e) => Array.from(e.target.files).forEach(simulateUpload)} />
          <button className="btn primary" onClick={() => setShowNew(true)}><Icon name="plus" size={13} /> Nouveau document</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="card" style={{ padding: 8 }}>
            {/* Root */}
            <div onClick={() => navTo(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                background: !folder ? 'var(--surface-2)' : 'transparent', fontWeight: !folder ? 600 : 400,
                color: !folder ? 'var(--ink)' : 'var(--ink-2)' }}>
              <Icon name="home" size={14} style={{ color: !folder ? 'var(--accent)' : 'var(--ink-3)' }} /> Tous les documents
            </div>
            <div className="divider" style={{ margin: '6px 0' }} />
            <div className="micro" style={{ padding: '2px 8px 6px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', fontSize: 10 }}>Dossiers</div>
            {FOLDERS.map((f) => (
              <div key={f.id} onClick={() => openFolder(f)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                  background: folder === f.name ? 'var(--surface-2)' : 'transparent',
                  color: folder === f.name ? 'var(--ink)' : 'var(--ink-2)',
                  fontWeight: folder === f.name ? 500 : 400 }}>
                <Icon name="folder" size={14} style={{ color: folder === f.name ? 'var(--accent)' : 'var(--ink-3)' }} />
                <span style={{ flex: 1 }}>{f.name}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{docs.filter((d) => d.folder.toLowerCase().includes(f.name.toLowerCase())).length || f.count}</span>
              </div>
            ))}
            <div className="divider" style={{ margin: '6px 0' }} />
            <div className="micro" style={{ padding: '2px 8px 6px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', fontSize: 10 }}>Tags</div>
            {['qualiopi', 'urgent', 'apprenant', 'financement', 'convention'].map((t) => (
              <div key={t} onClick={() => setSearch(t)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', borderRadius: 6 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-soft)', border: '1px solid var(--accent)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Storage meter */}
          <div className="card" style={{ padding: '12px 14px', fontSize: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>Stockage</span>
              <span className="muted">4,2 / 50 Go</span>
            </div>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: '8.4%', height: '100%', background: 'var(--accent)', borderRadius: 99 }} />
            </div>
            <div className="muted" style={{ marginTop: 6 }}>45,8 Go disponibles</div>
          </div>
        </aside>

        {/* Main area */}
        <div>
          {/* Breadcrumb + toolbar */}
          <div className="card" style={{ marginBottom: 12, padding: '8px 14px' }}>
            <div className="row" style={{ gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
              <button className="btn ghost sm" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navTo(-1)}>
                <Icon name="home" size={11} /> Accueil
              </button>
              {breadcrumb.map((b, i) => (
                <span key={i} className="row" style={{ gap: 4 }}>
                  <Icon name="chevR" size={11} style={{ color: 'var(--ink-3)' }} />
                  <button className="btn ghost sm" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navTo(i)}>{b.name}</button>
                </span>
              ))}
            </div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {/* Filters */}
              <div className="row" style={{ gap: 4 }}>
                {[
                  { id: 'all',    label: 'Tous',        count: docs.length },
                  { id: 'mine',   label: 'À moi',       count: docs.filter((d) => d.owner === ME.id).length },
                  { id: 'review', label: 'À valider',   count: docs.filter((d) => d.status === 'review' || d.status === 'pending').length },
                  { id: 'locked', label: 'Verrouillés', count: docs.filter((d) => !!d.lockedBy).length },
                ].map((f) => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className={`btn sm ${filter === f.id ? '' : 'ghost'}`} style={{ fontSize: 12 }}>
                    {f.label} <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', marginLeft: 2 }}>{f.count}</span>
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 30, background: 'var(--surface-2)', borderRadius: 6, border: '1px solid var(--line)' }}>
                <Icon name="search" size={12} style={{ color: 'var(--ink-3)' }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtrer…"
                  style={{ border: 0, outline: 0, background: 'transparent', fontSize: 12, width: 130, fontFamily: 'inherit' }} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-3)', lineHeight: 1 }}>×</button>}
              </div>
              {/* Sort */}
              <select className="input" style={{ height: 30, fontSize: 12, padding: '0 8px', width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="date">Date</option><option value="name">Nom</option><option value="status">Statut</option><option value="version">Version</option>
              </select>
              {/* View */}
              <div className="row" style={{ gap: 2, padding: 2, background: 'var(--surface-2)', borderRadius: 6 }}>
                <button onClick={() => setView('list')} className={`btn sm ${view === 'list' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="list" size={13} /></button>
                <button onClick={() => setView('grid')} className={`btn sm ${view === 'grid' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="grid" size={13} /></button>
              </div>
            </div>
          </div>

          {/* Drop hint */}
          {!filtered.length && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
              <Icon name="folder" size={36} style={{ marginBottom: 12, opacity: .4 }} />
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Aucun document</div>
              <div style={{ fontSize: 13 }}>Glissez-déposez des fichiers ici ou créez un nouveau document</div>
            </div>
          )}

          {/* List view */}
          {view === 'list' && filtered.length > 0 && (
            <motion.div className="card" style={{ overflow: 'hidden' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <table className="t">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                        onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((d) => d.id)) : new Set())} />
                    </th>
                    <SortHeader col="name" label="Nom" />
                    <SortHeader col="status" label="Statut" style={{ width: 130 }} />
                    <SortHeader col="version" label="Version" style={{ width: 80 }} />
                    <th style={{ width: 130 }}>Propriétaire</th>
                    <SortHeader col="date" label="Modifié" style={{ width: 150 }} />
                    <th style={{ width: 64 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} onContextMenu={(e) => handleContextMenu(e, doc)}
                      style={{ background: selected.has(doc.id) ? 'var(--accent-soft)' : 'transparent' }}
                      onClick={(e) => { if (e.ctrlKey || e.metaKey || e.shiftKey) toggleSelect(doc.id, e); else router.push(`/documents/${doc.id}`); }}>
                      <td onClick={(e) => { e.stopPropagation(); toggleSelect(doc.id, e); }}>
                        <input type="checkbox" checked={selected.has(doc.id)} onChange={() => {}} onClick={(e) => { e.stopPropagation(); toggleSelect(doc.id, e); }} />
                      </td>
                      <td className="col-name">
                        <div className="row" style={{ gap: 12 }}>
                          <FileIcon type={doc.type} size={26} />
                          <div style={{ minWidth: 0 }}>
                            <div className="truncate" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {doc.name}
                              {doc.lockedBy && <Icon name="lock" size={12} style={{ color: 'var(--warn)' }} />}
                            </div>
                            <div className="micro truncate" style={{ marginTop: 2 }}>{doc.folder}</div>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>v{doc.version}</td>
                      <td>
                        <div className="row" style={{ gap: 6 }}>
                          <Avatar user={USERS[doc.owner]} size="xs" />
                          <span style={{ fontSize: 12.5 }}>{USERS[doc.owner]?.name.split(' ')[0] || doc.owner}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{doc.updatedAt}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="row" style={{ gap: 2 }}>
                          <button className="btn ghost sm" style={{ padding: 4 }} title="Modifier" onClick={() => router.push(`/documents/${doc.id}/edit`)}>
                            <Icon name="pencil" size={13} />
                          </button>
                          <button className="btn ghost sm" style={{ padding: 4 }} title="Plus" onClick={(e) => handleContextMenu(e, doc)}>
                            <Icon name="more" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Grid view */}
          {view === 'grid' && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {filtered.map((doc, i) => (
                <motion.div key={doc.id} className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.03 }} onContextMenu={(e) => handleContextMenu(e, doc)}
                  style={{ padding: 0, cursor: 'pointer', overflow: 'hidden', outline: selected.has(doc.id) ? '2px solid var(--accent)' : 'none' }}
                  onClick={(e) => { if (e.ctrlKey || e.metaKey || e.shiftKey) toggleSelect(doc.id, e); else router.push(`/documents/${doc.id}`); }}>
                  {/* Thumbnail */}
                  <div style={{ height: 120, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <FileIcon type={doc.type} size={44} />
                    <div style={{ position: 'absolute', top: 8, right: 8 }}><StatusBadge status={doc.status} /></div>
                    {doc.lockedBy && <div style={{ position: 'absolute', top: 8, left: 8 }}><Icon name="lock" size={13} style={{ color: 'var(--warn)' }} /></div>}
                    <div style={{ position: 'absolute', top: 6, left: 8 }}>
                      <input type="checkbox" checked={selected.has(doc.id)} onClick={(e) => { e.stopPropagation(); toggleSelect(doc.id, e); }} onChange={() => {}} />
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 500, fontSize: 12.5, marginBottom: 2, lineHeight: 1.35, height: 32, overflow: 'hidden' }}>{doc.name}</div>
                    <div className="micro truncate" style={{ marginBottom: 8 }}>{doc.folder}</div>
                    <div className="row" style={{ justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-3)' }}>
                      <div className="row" style={{ gap: 5 }}>
                        <Avatar user={USERS[doc.owner]} size="xs" />
                        <span className="mono">v{doc.version}</span>
                      </div>
                      <div className="row" style={{ gap: 4 }}>
                        <button className="btn ghost sm" style={{ padding: 3 }} onClick={(e) => { e.stopPropagation(); router.push(`/documents/${doc.id}/edit`); }} title="Modifier"><Icon name="pencil" size={12} /></button>
                        <button className="btn ghost sm" style={{ padding: 3 }} onClick={(e) => { e.stopPropagation(); handleContextMenu(e, doc); }} title="Plus"><Icon name="more" size={12} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
