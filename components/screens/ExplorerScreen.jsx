'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon, StatusBadge } from '@/components/ui/Atoms';
import { useDocs } from '@/lib/context/DocsContext';
import { useToast } from '@/lib/context/ToastContext';
import { USERS, ME, FOLDERS } from '@/lib/data';

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

  const [form, setForm] = useState({
    name: '',
    type: 'doc',
    folder: FOLDER_OPTIONS[0],
    tags: '',
    confidential: 'Interne',
    expires: '',
    status: 'draft',
  });
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      if (!form.name) setForm((prev) => ({ ...prev, name: f.name.replace(/\.[^.]+$/, '') }));
    }
  };

  const handleFileInput = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      if (!form.name) setForm((prev) => ({ ...prev, name: f.name.replace(/\.[^.]+$/, '') }));
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const id = `d${Date.now()}`;
    const ext = { doc: '.docx', pdf: '.pdf', xls: '.xlsx', img: '.png' }[form.type] || '';
    const nameWithExt = form.name.endsWith(ext) ? form.name : form.name + ext;
    const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const now = new Date();
    const size = file ? `${Math.round(file.size / 1024)} Ko` : '—';

    addDoc({
      id,
      name: nameWithExt,
      type: form.type,
      folder: form.folder,
      size,
      version: '1.0',
      status: form.status,
      owner: ME.id,
      updatedBy: ME.id,
      updatedAt: "à l'instant",
      tags,
      confidential: form.confidential,
      expires: form.expires || null,
    });

    showToast({ type: 'success', message: 'Document créé avec succès' });
    onClose();
    router.push(`/documents/${id}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'var(--surface)', borderRadius: 14, width: '100%', maxWidth: 580, boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }}>

          <div className="card-hd" style={{ padding: '18px 22px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Nouveau document</h2>
            <button className="btn ghost sm" style={{ padding: 6 }} onClick={onClose}><Icon name="x" size={16} /></button>
          </div>

          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('nd-file-input').click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--line-strong)'}`,
                borderRadius: 10, padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'var(--accent-soft)' : 'var(--surface-2)',
                transition: 'all .15s',
              }}>
              <input id="nd-file-input" type="file" style={{ display: 'none' }} onChange={handleFileInput} />
              <Icon name="upload" size={22} style={{ color: 'var(--accent)', marginBottom: 8 }} />
              {file
                ? <div style={{ fontSize: 13.5, fontWeight: 500 }}>{file.name} <span className="muted mono">({Math.round(file.size / 1024)} Ko)</span></div>
                : <><div style={{ fontSize: 13.5, fontWeight: 500 }}>Glisser-déposer un fichier</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>ou cliquer pour parcourir · PDF, Word, Excel, images</div></>}
            </div>

            {/* Name */}
            <div>
              <label className="label">Nom du document *</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="ex. Convention formation — Session 2026" autoFocus />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Type */}
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={set('type')}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {/* Status */}
              <div>
                <label className="label">Statut initial</label>
                <select className="input" value={form.status} onChange={set('status')}>
                  <option value="draft">Brouillon</option>
                  <option value="review">En validation</option>
                </select>
              </div>
            </div>

            {/* Folder */}
            <div>
              <label className="label">Dossier</label>
              <select className="input" value={form.folder} onChange={set('folder')}>
                {FOLDER_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Confidentiality */}
              <div>
                <label className="label">Confidentialité</label>
                <select className="input" value={form.confidential} onChange={set('confidential')}>
                  {CONF_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Expiry */}
              <div>
                <label className="label">Date d'expiration</label>
                <input className="input" type="date" value={form.expires} onChange={set('expires')} />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="label">Tags <span className="muted">(séparés par des virgules)</span></label>
              <input className="input" value={form.tags} onChange={set('tags')} placeholder="ex. qualiopi, contrat, 2026" />
            </div>
          </div>

          <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>Annuler</button>
            <button className="btn primary" onClick={handleSave} disabled={!form.name.trim()}>
              <Icon name="plus" size={14} /> Créer le document
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ExplorerScreen() {
  const router = useRouter();
  const { docs } = useDocs();
  const [folder, setFolder] = useState('sessions');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [showNew, setShowNew] = useState(false);

  const filtered = docs.filter((d) => {
    if (filter === 'locked') return !!d.lockedBy;
    if (filter === 'review') return d.status === 'review' || d.status === 'pending';
    if (filter === 'mine')   return d.owner === ME.id;
    return true;
  });

  const openDoc = (id) => router.push(`/documents/${id}`);

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      {showNew && <NewDocModal onClose={() => setShowNew(false)} />}

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Documents</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>{docs.length} documents · {FOLDERS.length} dossiers</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="folder" size={13} /> Nouveau dossier</button>
          <button className="btn"><Icon name="upload" size={13} /> Téléverser</button>
          <button className="btn primary" onClick={() => setShowNew(true)}><Icon name="plus" size={13} /> Nouveau document</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 18 }}>
        <aside className="card" style={{ padding: 10, height: 'fit-content', position: 'sticky', top: 76 }}>
          <div className="micro" style={{ padding: '4px 8px 8px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Dossiers</div>
          {FOLDERS.map((f) => (
            <div key={f.id} onClick={() => setFolder(f.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                background: folder === f.id ? 'var(--surface-2)' : 'transparent',
                color: folder === f.id ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: folder === f.id ? 500 : 400 }}>
              <Icon name="folder" size={14} style={{ color: folder === f.id ? 'var(--accent)' : 'var(--ink-3)' }} />
              <span style={{ flex: 1 }}>{f.name}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{f.count}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="micro" style={{ padding: '4px 8px 8px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Tags</div>
          {['qualiopi', 'urgent', 'apprenant', 'financement', 'signé'].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-soft)', border: '1px solid var(--accent)', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t}</span>
            </div>
          ))}
        </aside>

        <div>
          <div className="card" style={{ marginBottom: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="row" style={{ gap: 4 }}>
              {[
                { id: 'all',    label: 'Tous',        count: docs.length },
                { id: 'mine',   label: 'À moi',       count: docs.filter((d) => d.owner === ME.id).length },
                { id: 'review', label: 'À valider',   count: docs.filter((d) => d.status === 'review' || d.status === 'pending').length },
                { id: 'locked', label: 'Verrouillés', count: docs.filter((d) => !!d.lockedBy).length },
              ].map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`btn sm ${filter === f.id ? '' : 'ghost'}`}>
                  {f.label}
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 2 }}>{f.count}</span>
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button className="btn sm ghost"><Icon name="filter" size={13} /> Filtres</button>
            <button className="btn sm ghost"><Icon name="tag" size={13} /> Tags</button>
            <div style={{ width: 1, height: 18, background: 'var(--line)' }} />
            <div className="row" style={{ gap: 2, padding: 2, background: 'var(--surface-2)', borderRadius: 6 }}>
              <button onClick={() => setView('list')} className={`btn sm ${view === 'list' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="list" size={13} /></button>
              <button onClick={() => setView('grid')} className={`btn sm ${view === 'grid' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="grid" size={13} /></button>
            </div>
          </div>

          {view === 'list' && (
            <motion.div className="card" style={{ overflow: 'hidden' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <table className="t">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}><input type="checkbox" /></th>
                    <th>Nom</th>
                    <th style={{ width: 130 }}>Statut</th>
                    <th style={{ width: 80 }}>Version</th>
                    <th style={{ width: 130 }}>Propriétaire</th>
                    <th style={{ width: 150 }}>Modifié</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} onClick={() => openDoc(doc.id)}>
                      <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
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
                        <button className="btn ghost sm" style={{ padding: 4 }}><Icon name="more" size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {view === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {filtered.map((doc, i) => (
                <motion.div key={doc.id} className="card" style={{ padding: 14, cursor: 'pointer' }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => openDoc(doc.id)}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                    <FileIcon type={doc.type} size={32} />
                    {doc.lockedBy ? <Badge kind="warn" dot>Verrouillé</Badge> : <StatusBadge status={doc.status} />}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 4, lineHeight: 1.35, height: 36, overflow: 'hidden' }}>{doc.name}</div>
                  <div className="micro truncate" style={{ marginBottom: 12 }}>{doc.folder}</div>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
                    <div className="row" style={{ gap: 6 }}>
                      <Avatar user={USERS[doc.owner]} size="xs" />
                      <span className="mono">v{doc.version}</span>
                    </div>
                    <span>{doc.updatedAt}</span>
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
