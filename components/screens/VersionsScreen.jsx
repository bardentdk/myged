'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon } from '@/components/ui/Atoms';
import { useDocs } from '@/lib/context/DocsContext';
import { useToast } from '@/lib/context/ToastContext';
import { USERS, VERSIONS as FALLBACK_VERSIONS, ME } from '@/lib/data';

/* ─── Upload modal ─── */
function UploadModal({ doc, onClose, onSubmit }) {
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }} onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--surface)', borderRadius: 14, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }}>
        <div className="card-hd" style={{ padding: '18px 22px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Téléverser une nouvelle version</h2>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            onClick={() => document.getElementById('vup-file').click()}
            style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--line-strong)'}`, borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-soft)' : 'var(--surface-2)', transition: 'all .15s' }}>
            <input id="vup-file" type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            <Icon name="upload" size={22} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            {file
              ? <div style={{ fontWeight: 500, fontSize: 13.5 }}>{file.name} <span className="muted mono">({Math.round(file.size / 1024)} Ko)</span></div>
              : <><div style={{ fontWeight: 500, fontSize: 13.5 }}>Glisser ou cliquer pour importer</div><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Remplacera la version actuelle v{doc?.version}</div></>}
          </div>
          <div>
            <label className="label">Note de version</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex. Mise à jour clauses financement OPCO" autoFocus />
          </div>
        </div>
        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={() => onSubmit(note, file?.name, file ? `${Math.round(file.size / 1024)} Ko` : null)} disabled={!note.trim()}>
            <Icon name="upload" size={13} /> Publier la version
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Diff pane ─── */
const DIFF_OLD = [
  { t: '',   text: 'CONVENTION DE FORMATION PROFESSIONNELLE' },
  { t: '',   text: "N° d'enregistrement : 974-26-00471" },
  { t: '',   text: '' },
  { t: '',   text: 'Article 1 — Objet de la convention' },
  { t: 'rm', text: 'La présente convention a pour objet la formation' },
  { t: 'rm', text: 'du Bénéficiaire dans le cadre du TP SA niveau 4.' },
  { t: '',   text: 'Article 2 — Nature et durée' },
  { t: 'rm', text: 'Durée : 720 heures, du 15/01/2026 au 30/06/2026' },
  { t: '',   text: 'Article 3 — Modalités financières' },
  { t: '',   text: 'Coût horaire pédagogique : 11,80 €' },
  { t: '',   text: 'Prise en charge : OPCO Akto' },
];
const DIFF_NEW = [
  { t: '',    text: 'CONVENTION DE FORMATION PROFESSIONNELLE' },
  { t: '',    text: "N° d'enregistrement : 974-26-00471" },
  { t: '',    text: '' },
  { t: '',    text: 'Article 1 — Objet de la convention' },
  { t: 'add', text: 'La présente convention a pour objet la formation' },
  { t: 'add', text: "professionnelle continue de l'apprenant, dans le" },
  { t: 'add', text: 'cadre de la préparation au TP Secrétaire Assistant' },
  { t: 'add', text: 'de niveau 4 (RNCP n° 36804).' },
  { t: '',    text: 'Article 2 — Nature et durée' },
  { t: 'add', text: 'Durée : 805 heures, du 12/01/2026 au 28/08/2026' },
  { t: '',    text: 'Article 3 — Modalités financières' },
  { t: '',    text: 'Coût horaire pédagogique : 11,80 €' },
  { t: 'add', text: 'Prise en charge : OPCO Akto (barème février 2026)' },
];

function DiffPane({ label, lines }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="micro" style={{ padding: '8px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)', fontWeight: 500 }}>{label}</div>
      <div className="mono" style={{ padding: '10px 0', fontSize: 12.5, lineHeight: 1.7, flex: 1, overflowY: 'auto' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ padding: '0 14px', background: l.t === 'add' ? 'rgba(21,128,61,.08)' : l.t === 'rm' ? 'rgba(185,28,28,.07)' : 'transparent', color: l.t === 'add' ? '#0f6b34' : l.t === 'rm' ? '#8e2222' : 'var(--ink-2)', borderLeft: l.t ? '2px solid' : '2px solid transparent', borderLeftColor: l.t === 'add' ? 'var(--ok)' : l.t === 'rm' ? 'var(--err)' : 'transparent', display: 'flex', gap: 12 }}>
            <span style={{ width: 18, color: 'var(--ink-4)', textAlign: 'right' }}>{i + 1}</span>
            <span>{l.t === 'add' ? '+ ' : l.t === 'rm' ? '− ' : '  '}{l.text || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main screen ─── */
export default function VersionsScreen({ docId }) {
  const router = useRouter();
  const { docs, versions, updateDoc, addVersion } = useDocs();
  const { showToast } = useToast();

  const doc = docs.find((d) => d.id === docId) || docs[0];
  const docVersions = versions[doc?.id] || FALLBACK_VERSIONS;
  const [selected, setSelected] = useState(docVersions[1]?.v || docVersions[0]?.v);
  const current = docVersions.find((v) => v.current) || docVersions[0];
  const [showUpload, setShowUpload] = useState(false);

  const handleRestore = (v) => {
    updateDoc(doc.id, { version: v.v });
    showToast({ type: 'success', message: `Version ${v.v} restaurée comme version actuelle` });
  };

  const handleUpload = (note, fileName, fileSize) => {
    const parts = (doc.version || '1.0').split('.');
    const newVersion = `${parts[0]}.${parseInt(parts[1] || 0) + 1}`;
    addVersion(doc.id, {
      v: newVersion,
      author: ME.id,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      note,
      size: fileSize || '—',
      milestone: false,
    });
    updateDoc(doc.id, { version: newVersion });
    setShowUpload(false);
    showToast({ type: 'success', message: `Version ${newVersion} publiée` });
  };

  const exportZip = () => {
    const lines = docVersions.map((v) => `v${v.v} | ${v.date} | ${USERS[v.author]?.name || v.author} | ${v.note}`).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `versions-${doc?.name || 'document'}.txt`; a.click();
    showToast({ type: 'success', message: 'Export téléchargé' });
  };

  if (!doc) return null;
  const selectedV = docVersions.find((v) => v.v === selected) || docVersions[0];
  const compareTo = current?.v;

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <AnimatePresence>{showUpload && <UploadModal doc={doc} onClose={() => setShowUpload(false)} onSubmit={handleUpload} />}</AnimatePresence>

      <button onClick={() => router.push(`/documents/${doc.id}`)} className="btn ghost sm" style={{ marginBottom: 12, color: 'var(--ink-3)' }}>
        <Icon name="chevL" size={12} /> {doc.name}
      </button>

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 22, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Historique des versions</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {docVersions.length} version{docVersions.length > 1 ? 's' : ''} · v{current?.v} actuelle · {new Set(docVersions.map((v) => v.author)).size} auteurs
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={exportZip}><Icon name="download" size={13} /> Export</button>
          <button className="btn primary" onClick={() => setShowUpload(true)}><Icon name="upload" size={13} /> Nouvelle version</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>
        {/* Timeline */}
        <div className="card" style={{ padding: '6px 0', height: 'fit-content' }}>
          {docVersions.map((v, i) => {
            const u = USERS[v.author];
            const sel = v.v === selected;
            return (
              <motion.div key={v.v} onClick={() => setSelected(v.v)} whileHover={{ x: 2 }} transition={{ duration: 0.1 }}
                style={{ display: 'flex', gap: 10, padding: '12px 16px', cursor: 'pointer', background: sel ? 'var(--accent-soft)' : 'transparent', borderLeft: sel ? '3px solid var(--accent)' : '3px solid transparent', position: 'relative' }}>
                <div style={{ position: 'relative', width: 14, paddingTop: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : '#fff', border: `2px solid ${v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : 'var(--line-strong)'}` }} />
                  {i < docVersions.length - 1 && <div style={{ position: 'absolute', left: 4, top: 14, bottom: -14, width: 1, background: 'var(--line)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>v{v.v}</span>
                    {v.current && <Badge kind="accent" dot>actuelle</Badge>}
                    {v.milestone && <Badge kind="violet">jalon</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{v.note}</div>
                  <div className="micro mono" style={{ marginTop: 4 }}>{v.date}</div>
                  <div className="row" style={{ gap: 5, marginTop: 6 }}>
                    {u && <Avatar user={u} size="xs" />}
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{u?.name.split(' ')[0] || v.author}</span>
                    {v.size && <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto' }}>{v.size}</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Diff viewer */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-hd">
            <div className="row" style={{ gap: 10 }}>
              <FileIcon type={doc.type} size={20} />
              <h2>
                Comparer <span className="mono" style={{ color: 'var(--ink-3)', fontWeight: 400 }}>v{selected}</span>
                {' → '}
                <span className="mono" style={{ color: 'var(--accent)' }}>v{compareTo}</span>
              </h2>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="badge b-ok"><span className="dot" style={{ background: 'var(--ok)' }} /> +12 lignes</span>
              <span className="badge b-err"><span className="dot" style={{ background: 'var(--err)' }} /> −4 lignes</span>
              {selectedV && !selectedV.current && (
                <button className="btn sm primary" onClick={() => handleRestore(selectedV)}>
                  <Icon name="history" size={12} /> Restaurer v{selected}
                </button>
              )}
              <button className="btn sm" onClick={() => router.push(`/documents/${doc.id}/edit`)}>
                <Icon name="pencil" size={12} /> Modifier actuelle
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 4px 1fr', minHeight: 500 }}>
            <DiffPane label={`v${selected} · ${selectedV?.date || ''}`} lines={DIFF_OLD} />
            <div style={{ background: 'var(--line)' }} />
            <DiffPane label={`v${compareTo} · actuelle`} lines={DIFF_NEW} />
          </div>
        </div>
      </div>
    </div>
  );
}
