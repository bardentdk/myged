'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon, StatusBadge } from '@/components/ui/Atoms';
import { USERS, ME, FOLDERS, STATUS_MAP } from '@/lib/data';
import { useToast } from '@/lib/context/ToastContext';
import { useDocs } from '@/lib/context/DocsContext';

export default function DocumentScreen({ id }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { docs, comments, versions, updateDoc, addComment, deleteComment, addVersion, deleteDoc } = useDocs();

  const doc = docs.find(d => d.id === id) || docs[0];
  const docVersions = versions[doc?.id] || [];
  const docComments = [...(comments[doc?.id] || [])];

  const [tab, setTab] = useState('preview');
  const [scenario, setScenario] = useState('locked');
  const [requestSent, setRequestSent] = useState(false);
  const [notifyOn, setNotifyOn] = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMore, setShowMore] = useState(false);

  if (!doc) return <div className="page" style={{ paddingTop: 40, textAlign: 'center' }} ><p className="muted">Document introuvable.</p></div>;

  const isLocked = !!doc.lockedBy && scenario !== 'released';
  const lockedByMe = doc.lockedBy === ME.id;
  const lockOwner = isLocked ? USERS[doc.lockedBy] : null;

  const handleSaveEdit = (changes) => {
    updateDoc(doc.id, changes);
    setShowEdit(false);
    showToast({ message: 'Document mis à jour avec succès', icon: 'check' });
  };

  const handleUploadVersion = (note, fileName, fileSize) => {
    const parts = (doc.version || '1.0').split('.');
    const newVersion = `${parts[0]}.${parseInt(parts[1] || 0) + 1}`;
    addVersion(doc.id, {
      v: newVersion, author: ME.id, date: "aujourd'hui · " + new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
      note, size: fileSize || '—', milestone: false,
    });
    updateDoc(doc.id, { version: newVersion });
    setShowUpload(false);
    showToast({ message: `Version ${newVersion} publiée avec succès`, icon: 'upload' });
  };

  const handleDelete = () => {
    deleteDoc(doc.id);
    setShowDelete(false);
    showToast({ message: `Document "${doc.name}" supprimé`, icon: 'trash' });
    router.push('/documents');
  };

  const handleStatusChange = (newStatus) => {
    updateDoc(doc.id, { status: newStatus });
    const labels = { review: 'envoyé en validation', validated: 'validé', rejected: 'refusé', draft: 'remis en brouillon' };
    showToast({ message: `Document ${labels[newStatus] || newStatus}`, icon: 'check' });
  };

  return (
    <div className="page" style={{ paddingTop: 18, maxWidth: 'none', padding: '18px 24px 60px' }}>
      <button onClick={() => router.push('/documents')} className="btn ghost sm" style={{ marginBottom: 12, color: 'var(--ink-3)' }}>
        <Icon name="chevL" size={12} /> Retour aux documents
      </button>

      <div className="row" style={{ gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
        <FileIcon type={doc.type} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 20 }}>{doc.name}</h1>
            <Badge kind="neutral"><span className="mono">v{doc.version}</span></Badge>
            <StatusBadge status={doc.status} />
            {doc.confidential === 'Confidentiel' && <Badge kind="violet" dot>Confidentiel</Badge>}
            {isLocked && <Badge kind="warn" dot>Verrouillé</Badge>}
          </div>
          <div className="micro row" style={{ gap: 6 }}>
            <span>{doc.folder}</span><span>·</span><span>{doc.size}</span><span>·</span>
            <span>Modifié {doc.updatedAt} par {USERS[doc.updatedBy]?.name?.split(' ')[0]}</span>
            {doc.expires && (<><span>·</span><span>Expire le <span className="mono">{doc.expires}</span></span></>)}
          </div>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {/* Status actions */}
          {doc.status === 'draft' && (
            <button className="btn sm" onClick={() => handleStatusChange('review')}>
              <Icon name="send" size={13} /> Envoyer en validation
            </button>
          )}
          {doc.status === 'review' && (
            <>
              <button className="btn sm" style={{ color: 'var(--ok)', borderColor: 'var(--ok)' }} onClick={() => handleStatusChange('validated')}>
                <Icon name="check" size={13} /> Valider
              </button>
              <button className="btn sm" style={{ color: 'var(--err)', borderColor: 'var(--err)' }} onClick={() => handleStatusChange('rejected')}>
                <Icon name="x" size={13} /> Refuser
              </button>
            </>
          )}
          {(doc.status === 'validated' || doc.status === 'rejected') && (
            <button className="btn sm ghost" onClick={() => handleStatusChange('draft')}>
              <Icon name="refresh" size={13} /> Remettre en brouillon
            </button>
          )}
          <button className="btn sm ghost" title="Favori"><Icon name="star" size={14} /></button>
          <button className="btn sm" onClick={() => showToast({ message: `Téléchargement de "${doc.name}"`, icon: 'download' })}>
            <Icon name="download" size={13} /> Télécharger
          </button>
          <button className="btn sm" onClick={() => setShowShare(true)}>
            <Icon name="share" size={13} /> Partager
          </button>
          <button className="btn sm" onClick={() => setShowUpload(true)}>
            <Icon name="upload" size={13} /> Nouvelle version
          </button>
          {isLocked && !lockedByMe
            ? <button className="btn sm" disabled style={{ opacity: .55 }}><Icon name="lock" size={13} /> Modifier</button>
            : <>
                <button className="btn sm" onClick={() => setShowEdit(true)}><Icon name="edit" size={13} /> Propriétés</button>
                <button className="btn primary sm" onClick={() => router.push(`/documents/${doc.id}/edit`)}><Icon name="pencil" size={13} /> Modifier le contenu</button>
              </>}
          <div style={{ position: 'relative' }}>
            <button className="btn sm ghost" onClick={() => setShowMore(v => !v)}><Icon name="more" size={14} /></button>
            {showMore && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#fff', border: '1px solid var(--line)', borderRadius: 10, boxShadow: 'var(--shadow-md)', zIndex: 50, minWidth: 160, padding: 4 }}
                onMouseLeave={() => setShowMore(false)}>
                {[
                  { icon: 'copy',    label: 'Dupliquer', action: () => { showToast({ message: 'Document dupliqué', icon: 'copy' }); setShowMore(false); } },
                  { icon: 'archive', label: 'Archiver', action: () => { handleStatusChange('archived'); setShowMore(false); } },
                  { icon: 'trash',   label: 'Supprimer', action: () => { setShowMore(false); setShowDelete(true); }, danger: true },
                ].map((item, i) => (
                  <button key={i} onClick={item.action}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 13, width: '100%', background: 'none', border: 0, cursor: 'pointer', borderRadius: 6, color: item.danger ? 'var(--err)' : 'var(--ink)', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <Icon name={item.icon} size={13} style={{ color: item.danger ? 'var(--err)' : 'var(--ink-3)' }} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLocked && !lockedByMe && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <LockBanner owner={lockOwner} since={doc.lockedSince} requestSent={requestSent} notifyOn={notifyOn}
              onCopy={() => showToast({ message: `Copie téléchargée — ${doc.name}`, icon: 'download' })}
              onNotify={() => { setNotifyOn(true); showToast({ message: 'Vous serez notifié·e dès que le document sera libéré', icon: 'bell' }); }}
              onRequest={() => { setRequestSent(true); showToast({ message: `Demande envoyée à ${lockOwner.name.split(' ')[0]}`, icon: 'send' }); }}
              onForce={() => setShowForceModal(true)}
              onSimulateRelease={() => { setScenario('released'); showToast({ message: "Sylvie vient de libérer le document — c'est à vous.", icon: 'unlock' }); }} />
          </motion.div>
        )}
        {scenario === 'released' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <ReleasedBanner onEdit={() => { showToast({ message: 'Édition démarrée — document verrouillé par vous', icon: 'lock' }); setShowEdit(true); }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, marginTop: 14 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-hd">
            <div className="tabs" style={{ border: 0 }}>
              {[
                { id: 'preview',     label: 'Aperçu' },
                { id: 'versions',    label: 'Versions', count: docVersions.length },
                { id: 'activity',    label: 'Activité' },
                { id: 'comments',    label: 'Commentaires', count: docComments.length },
                { id: 'permissions', label: 'Permissions' },
              ].map(t => (
                <span key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.label}{t.count != null && <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 4 }}>{t.count}</span>}
                </span>
              ))}
            </div>
          </div>
          <div style={{ minHeight: 540 }}>
            {tab === 'preview'     && <PreviewPane doc={doc} isLocked={isLocked} lockOwner={lockOwner} />}
            {tab === 'versions'    && <VersionsList docId={doc.id} docVersions={docVersions} onUpload={() => setShowUpload(true)} />}
            {tab === 'activity'    && <ActivityList />}
            {tab === 'comments'    && <CommentsPane docId={doc.id} comments={docComments} onAdd={addComment} onDelete={deleteComment} />}
            {tab === 'permissions' && <PermissionsTable />}
          </div>
        </div>

        <aside className="col" style={{ gap: 14 }}>
          <DetailsCard doc={doc} isLocked={isLocked} lockOwner={lockOwner} onEdit={() => setShowEdit(true)} />
          <RelatedCard />
          <TagsCard doc={doc} onSave={(tags) => updateDoc(doc.id, { tags })} />
        </aside>
      </div>

      <AnimatePresence>
        {showForceModal && (
          <ForceUnlockModal owner={lockOwner}
            onCancel={() => setShowForceModal(false)}
            onConfirm={() => { setShowForceModal(false); setScenario('released'); showToast({ message: 'Document déverrouillé. Sylvie a été notifiée.', icon: 'unlock' }); }} />
        )}
        {showEdit   && <EditDocModal doc={doc} onClose={() => setShowEdit(false)} onSave={handleSaveEdit} />}
        {showUpload && <UploadVersionModal onClose={() => setShowUpload(false)} onSave={handleUploadVersion} />}
        {showShare  && <ShareModal doc={doc} onClose={() => setShowShare(false)} />}
        {showDelete && <DeleteConfirmModal doc={doc} onCancel={() => setShowDelete(false)} onConfirm={handleDelete} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Lock / Release banners ─────────────────────────────────────────── */

const LockBanner = ({ owner, since, requestSent, notifyOn, onCopy, onNotify, onRequest, onForce, onSimulateRelease }) => (
  <div className="card" style={{ borderColor: '#f0c98c', background: 'linear-gradient(180deg,#fdf6ea,#fcf2e2)', marginBottom: 14 }}>
    <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fbe3bd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
        <Icon name="lock" size={18} style={{ color: 'var(--warn)' }} />
        <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 999, background: 'var(--warn)', border: '2px solid #fcf2e2' }} className="pulse-warn" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar user={owner} size="xs" />
          <span><strong style={{ fontWeight: 600 }}>{owner.name}</strong> modifie ce document en ce moment</span>
        </div>
        <div style={{ fontSize: 12.5, color: '#92400e' }}>Verrouillé depuis <span className="mono">{since}</span> · vous ne pouvez pas écraser sa version.</div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn sm" onClick={onCopy}><Icon name="download" size={13} /> Copie</button>
        <button className="btn sm" onClick={onNotify} disabled={notifyOn} style={notifyOn ? { color: 'var(--ok)', borderColor: 'var(--ok)' } : {}}>
          {notifyOn ? <><Icon name="check" size={13} /> Notifié</> : <><Icon name="bell" size={13} /> Me notifier</>}
        </button>
        <button className="btn sm primary" onClick={onRequest} disabled={requestSent}>
          {requestSent ? <><Icon name="check" size={13} /> Demande envoyée</> : <><Icon name="send" size={13} /> Demander l'accès</>}
        </button>
        <button className="btn sm danger" onClick={onForce}><Icon name="unlock" size={13} /> Forcer</button>
      </div>
    </div>
    <div style={{ padding: '8px 18px', borderTop: '1px dashed rgba(180,83,9,.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
      <span style={{ color: '#92400e' }}>💡 Démo : simulez la libération du document par Sylvie</span>
      <button className="btn sm ghost" onClick={onSimulateRelease} style={{ color: '#92400e' }}><Icon name="play" size={11} /> Simuler la libération</button>
    </div>
  </div>
);

const ReleasedBanner = ({ onEdit }) => (
  <div className="card" style={{ borderColor: '#9fd3b5', background: 'linear-gradient(180deg,#f1faf3,#e7f6ec)', marginBottom: 14 }}>
    <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#c8ecd4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="checkCircle" size={18} style={{ color: 'var(--ok)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>Document libéré — c'est à vous.</div>
        <div style={{ fontSize: 12.5, color: '#15803d' }}>Sylvie a publié la version <span className="mono">2.3</span>. Vous pouvez maintenant le modifier sans conflit.</div>
      </div>
      <button className="btn primary sm" onClick={onEdit}><Icon name="edit" size={13} /> Modifier maintenant</button>
    </div>
  </div>
);

/* ─── Modals ──────────────────────────────────────────────────────────── */

const ForceUnlockModal = ({ owner, onCancel, onConfirm }) => (
  <motion.div className="modal-bg" onClick={onCancel}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="modal" onClick={e => e.stopPropagation()}
      initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--err-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="warn" size={18} style={{ color: 'var(--err)' }} />
        </div>
        <h2 style={{ fontSize: 17 }}>Forcer le déverrouillage ?</h2>
      </div>
      <div style={{ padding: '18px 24px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
        <p style={{ marginTop: 0 }}><strong>{owner.name}</strong> est en train de modifier ce document. Forcer peut <strong>provoquer la perte de ses modifications</strong>.</p>
        <label className="label" style={{ marginTop: 14 }}>Motif (obligatoire)</label>
        <textarea className="input" rows={3} defaultValue="Document bloqué depuis ce matin, Sylvie en congé exceptionnel cet après-midi." />
      </div>
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={onCancel}>Annuler</button>
        <button onClick={onConfirm} style={{ padding: '0 18px', height: 38, borderRadius: 8, background: 'var(--err)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>Forcer le déverrouillage</button>
      </div>
    </motion.div>
  </motion.div>
);

const EditDocModal = ({ doc, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: doc.name, folder: doc.folder, status: doc.status,
    confidential: doc.confidential || 'Interne', expires: doc.expires || '',
    tags: (doc.tags || []).join(', '),
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <motion.div className="modal-bg" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}
        initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Modifier le document</h2>
          <button className="btn ghost sm" style={{ padding: 4 }} onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Nom du document *</label>
              <input className="input" required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Dossier</label>
              <select className="input" value={form.folder} onChange={set('folder')}>
                {FOLDERS.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                <option value={form.folder}>{form.folder}</option>
              </select>
            </div>
            <div>
              <label className="label">Statut</label>
              <select className="input" value={form.status} onChange={set('status')}>
                <option value="draft">Brouillon</option>
                <option value="review">En validation</option>
                <option value="validated">Validé</option>
                <option value="rejected">Refusé</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div>
              <label className="label">Confidentialité</label>
              <select className="input" value={form.confidential} onChange={set('confidential')}>
                <option value="Public">Public</option>
                <option value="Interne">Interne</option>
                <option value="Confidentiel">Confidentiel</option>
              </select>
            </div>
            <div>
              <label className="label">Date d'expiration</label>
              <input className="input" type="date" value={form.expires ? form.expires.split('/').reverse().join('-') : ''} onChange={(e) => setForm(f => ({ ...f, expires: e.target.value ? e.target.value.split('-').reverse().join('/') : '' }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Tags <span className="muted" style={{ fontWeight: 400 }}>(séparés par des virgules)</span></label>
              <input className="input" placeholder="qualiopi, convention, session-2026…" value={form.tags} onChange={set('tags')} />
            </div>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn primary"><Icon name="check" size={13} /> Enregistrer</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const UploadVersionModal = ({ onClose, onSave }) => {
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => f && setFile(f);
  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} Ko` : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

  return (
    <motion.div className="modal-bg" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}
        initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Téléverser une nouvelle version</h2>
          <button className="btn ghost sm" style={{ padding: 4 }} onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            style={{ padding: '28px 18px', border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--line-strong)'}`, borderRadius: 10, textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--accent-soft)' : 'var(--surface-2)', transition: 'all .15s' }}>
            {file ? (
              <>
                <Icon name="file" size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{file.name}</div>
                <div className="micro" style={{ marginTop: 4 }}>{formatSize(file.size)}</div>
              </>
            ) : (
              <>
                <Icon name="upload" size={28} style={{ color: 'var(--ink-3)', marginBottom: 8 }} />
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>Glissez votre fichier ici</div>
                <div className="micro" style={{ marginTop: 4 }}>ou cliquez pour sélectionner — DOC, DOCX, PDF, XLS, XLSX</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".doc,.docx,.pdf,.xls,.xlsx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          <div>
            <label className="label">Note de version <span className="muted" style={{ fontWeight: 400 }}>(décrivez les modifications)</span></label>
            <textarea className="input" rows={3} placeholder="ex. Mise à jour des clauses de financement OPCO Akto barème mars 2026" value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn primary" disabled={!file} onClick={() => onSave(note || 'Nouvelle version', file?.name, formatSize(file?.size))}>
            <Icon name="upload" size={13} /> Publier la version
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ShareModal = ({ doc, onClose }) => {
  const { showToast } = useToast();
  const [expiry, setExpiry] = useState('7');
  const [access, setAccess] = useState('read');
  const [copied, setCopied] = useState(false);
  const link = `https://gedify.vercel.app/share/${doc.id}?token=abc123`;

  const copyLink = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast({ message: 'Lien copié dans le presse-papiers', icon: 'copy' });
  };

  return (
    <motion.div className="modal-bg" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}
        initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Partager le document</h2>
          <button className="btn ghost sm" style={{ padding: 4 }} onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--line)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Icon name="globe" size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink-2)' }}>{link}</span>
            <button className="btn sm primary" onClick={copyLink} style={{ flexShrink: 0 }}>
              {copied ? <><Icon name="check" size={12} /> Copié !</> : <><Icon name="copy" size={12} /> Copier</>}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Accès</label>
              <select className="input" value={access} onChange={e => setAccess(e.target.value)}>
                <option value="read">Lecture seule</option>
                <option value="download">Lecture + téléchargement</option>
                <option value="comment">Lecture + commentaires</option>
              </select>
            </div>
            <div>
              <label className="label">Expiration du lien</label>
              <select className="input" value={expiry} onChange={e => setExpiry(e.target.value)}>
                <option value="1">24 heures</option>
                <option value="7">7 jours</option>
                <option value="30">30 jours</option>
                <option value="0">Jamais</option>
              </select>
            </div>
          </div>
          <div style={{ padding: 12, background: 'var(--accent-soft)', borderRadius: 8, fontSize: 13, color: 'var(--accent-ink)', display: 'flex', gap: 8 }}>
            <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Le lien donne accès à la version <strong>v{doc.version}</strong> uniquement. Toute consultation sera journalisée.</span>
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Fermer</button>
          <button className="btn primary" onClick={copyLink}><Icon name="share" size={13} /> Partager le lien</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DeleteConfirmModal = ({ doc, onCancel, onConfirm }) => (
  <motion.div className="modal-bg" onClick={onCancel}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}
      initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--err-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="trash" size={18} style={{ color: 'var(--err)' }} />
        </div>
        <h2 style={{ fontSize: 17 }}>Supprimer ce document ?</h2>
      </div>
      <div style={{ padding: '18px 24px', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
        <p style={{ marginTop: 0 }}>Vous êtes sur le point de supprimer <strong>"{doc.name}"</strong>. Cette action est <strong>irréversible</strong> et supprimera toutes les versions et l'historique associés.</p>
      </div>
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={onCancel}>Annuler</button>
        <button onClick={onConfirm} style={{ padding: '0 18px', height: 38, borderRadius: 8, background: 'var(--err)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>
          Supprimer définitivement
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── Tabs content ────────────────────────────────────────────────────── */

const PreviewPane = ({ doc, isLocked, lockOwner }) => (
  <div style={{ padding: 28, background: 'var(--surface-2)', minHeight: 540, position: 'relative' }}>
    <div style={{ background: '#fff', maxWidth: 620, margin: '0 auto', padding: '48px 56px', boxShadow: '0 4px 24px rgba(0,0,0,.06)', borderRadius: 4, fontFamily: 'Georgia, serif', color: '#1a1a1a', position: 'relative', fontSize: 12.5, lineHeight: 1.55 }}>
      {isLocked && (
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6, background: '#fcf2e2', color: '#92400e', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontFamily: 'Geist, sans-serif', border: '1px solid #f0c98c' }}>
          <Avatar user={lockOwner} size="xs" />
          <span><strong style={{ fontWeight: 600 }}>{lockOwner.name.split(' ')[0]}</strong> édite</span>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warn)' }} className="pulse-warn" />
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ fontSize: 9, letterSpacing: '.2em', color: '#888', marginBottom: 6 }}>CONVENTION DE FORMATION PROFESSIONNELLE</div>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1a1a1a', fontWeight: 700, margin: 0 }}>{doc.name.replace('.docx', '').replace('.pdf', '')}</h3>
        <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>N° d'enregistrement : 974-26-00471</div>
      </div>
      <p style={{ marginTop: 0 }}><strong>Entre les soussignés :</strong></p>
      <p>L'organisme de formation <strong>CFA Horizon Réunion</strong>, immatriculé sous le numéro <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11.5 }}>974-OF-001234</span>, dont le siège est situé 12 rue Sainte-Anne — 97400 Saint-Denis.</p>
      <p><strong>Article 1 — Objet de la convention</strong></p>
      <p>La présente convention a pour objet la formation professionnelle continue de l'apprenant dans le cadre de la préparation au Titre Professionnel de niveau 4.</p>
      <p><strong>Article 2 — Nature et durée de la formation</strong></p>
      <p>L'action de formation se déroule sur <strong>805 heures</strong>, du 12 janvier 2026 au 28 août 2026, sur le site de Saint-Denis…</p>
      <div style={{ marginTop: 18, height: 1, background: '#eee' }} />
      <div style={{ textAlign: 'center', fontSize: 10, color: '#aaa', marginTop: 12 }}>Page 1 / 4</div>
    </div>
  </div>
);

const VersionsList = ({ docId, docVersions, onUpload }) => (
  <div style={{ padding: '8px 0' }}>
    <div style={{ padding: '10px 22px 14px', display: 'flex', justifyContent: 'flex-end' }}>
      <button className="btn sm primary" onClick={onUpload}><Icon name="upload" size={12} /> Téléverser une nouvelle version</button>
    </div>
    {docVersions.length === 0 && (
      <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
        Aucune version disponible — téléversez la première version ci-dessus.
      </div>
    )}
    {docVersions.map((v, i) => {
      const u = USERS[v.author];
      return (
        <div key={v.v} style={{ display: 'flex', gap: 14, padding: '14px 22px', borderBottom: i < docVersions.length - 1 ? '1px solid var(--line)' : 0, background: v.current ? 'var(--accent-soft)' : 'transparent', position: 'relative' }}>
          {v.current && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--accent)' }} />}
          <div style={{ position: 'relative', width: 18, paddingTop: 2 }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : '#fff', border: `2px solid ${v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : 'var(--line-strong)'}`, margin: '0 auto' }} />
            {i < docVersions.length - 1 && <div style={{ position: 'absolute', left: '50%', top: 16, bottom: -14, width: 1, background: 'var(--line)', transform: 'translateX(-.5px)' }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>v{v.v}</span>
              {v.current && <Badge kind="accent" dot>Version actuelle</Badge>}
              {v.milestone && <Badge kind="violet">Jalon</Badge>}
              <span className="micro mono" style={{ marginLeft: 'auto' }}>{v.size}</span>
            </div>
            <div className="row" style={{ gap: 6, fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 6 }}>
              <Avatar user={u} size="xs" /><span><strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{u?.name}</strong> · {v.date}</span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{v.note}</div>
            <div className="row" style={{ gap: 6, marginTop: 8 }}>
              <button className="btn sm ghost"><Icon name="eye" size={12} /> Aperçu</button>
              <button className="btn sm ghost"><Icon name="download" size={12} /> Télécharger</button>
              {!v.current && <button className="btn sm ghost"><Icon name="refresh" size={12} /> Restaurer</button>}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const ActivityList = () => {
  const items = [
    { who: 'sylvie', verb: 'a verrouillé',          when: "aujourd'hui · 14:32", type: 'lock' },
    { who: 'anne',   verb: 'a téléchargé une copie', when: "aujourd'hui · 14:36", type: 'download' },
    { who: 'jb',     verb: 'a validé v2.0',          when: '01 mars · 10:22',     type: 'check' },
    { who: 'sylvie', verb: 'a remplacé par v2.3',    when: '15 mars · 14:32',     type: 'upload' },
  ];
  const colorMap = { lock: 'var(--warn)', download: 'var(--ink-3)', check: 'var(--ok)', upload: 'var(--ok)' };
  return (
    <div style={{ padding: '8px 22px' }}>
      {items.map((a, i) => {
        const u = USERS[a.who];
        return (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 0 }}>
            <Avatar user={u} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={a.type} size={12} style={{ color: colorMap[a.type] }} />
                <strong style={{ fontWeight: 500 }}>{u.name}</strong>
                <span className="muted">{a.verb}</span>
              </div>
              <div className="micro mono" style={{ marginTop: 2 }}>{a.when}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CommentsPane = ({ docId, comments, onAdd, onDelete }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(docId, {
      id: `c${Date.now()}`, who: 'anne', text: text.trim(),
      when: "à l'instant", ts: Date.now(),
    });
    setText('');
  };

  return (
    <div style={{ padding: 22 }}>
      {comments.map((c, i) => {
        const u = USERS[c.who];
        return (
          <div key={c.id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            <Avatar user={u} size="lg" />
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 8, marginBottom: 4, justifyContent: 'space-between' }}>
                <div className="row" style={{ gap: 8 }}>
                  <strong style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</strong>
                  <span className="micro">{c.when}</span>
                </div>
                {c.who === 'anne' && (
                  <button className="btn ghost sm" style={{ padding: 4 }} onClick={() => onDelete(docId, c.id)}>
                    <Icon name="trash" size={12} style={{ color: 'var(--err)' }} />
                  </button>
                )}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{c.text}</div>
            </div>
          </div>
        );
      })}
      {comments.length === 0 && (
        <div style={{ padding: '20px 0', color: 'var(--ink-3)', fontSize: 13 }}>Aucun commentaire pour l'instant.</div>
      )}
      <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Avatar user={ME} size="lg" />
        <div style={{ flex: 1 }}>
          <textarea className="input" rows={3}
            placeholder="Ajouter un commentaire… utilisez @ pour mentionner"
            value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }} />
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
            <span className="micro muted">⌘ + Entrée pour publier</span>
            <button className="btn primary sm" disabled={!text.trim()} onClick={handleSubmit}>
              <Icon name="send" size={12} /> Publier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PermissionsTable = () => {
  const rows = [
    { who: 'sylvie',  role: 'Propriétaire', perms: { r:1,d:1,w:1,v:1,s:1,x:1 } },
    { who: 'jb',      role: 'Direction',    perms: { r:1,d:1,w:1,v:1,s:1,x:0 } },
    { who: 'melanie', role: 'Resp. pédago', perms: { r:1,d:1,w:1,v:1,s:0,x:0 } },
    { who: 'anne',    role: 'Assistante',   perms: { r:1,d:1,w:0,v:0,s:0,x:0 } },
    { who: 'audit',   role: 'Auditeur ext.',perms: { r:1,d:0,w:0,v:0,s:0,x:0 } },
  ];
  const labels = { r: 'Lire', d: 'Télécharger', w: 'Modifier', v: 'Valider', s: 'Signer', x: 'Supprimer' };
  return (
    <div style={{ padding: 22 }}>
      <table className="t">
        <thead><tr><th>Utilisateur</th><th>Rôle</th>{Object.entries(labels).map(([k,v]) => <th key={k} style={{ textAlign: 'center', padding: '8px 4px' }}>{v}</th>)}</tr></thead>
        <tbody>
          {rows.map(r => {
            const u = USERS[r.who];
            return (
              <tr key={r.who} style={{ cursor: 'default' }}>
                <td><div className="row" style={{ gap: 8 }}><Avatar user={u} size="md" /><span style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</span></div></td>
                <td><span className="micro">{r.role}</span></td>
                {Object.keys(labels).map(k => (
                  <td key={k} style={{ textAlign: 'center' }}>
                    {r.perms[k] ? <Icon name="check" size={14} style={{ color: 'var(--ok)' }} /> : <Icon name="x" size={12} style={{ color: 'var(--ink-4)' }} />}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Sidebar cards ───────────────────────────────────────────────────── */

const DetailsCard = ({ doc, isLocked, lockOwner, onEdit }) => {
  const rows = [
    { label: 'Statut',          v: <StatusBadge status={doc.status} /> },
    { label: 'Version',         v: <span className="mono">v{doc.version}</span> },
    { label: 'Propriétaire',    v: <span className="row" style={{ gap: 6 }}><Avatar user={USERS[doc.owner]} size="xs" />{USERS[doc.owner]?.name}</span> },
    { label: 'Taille',          v: <span className="mono">{doc.size}</span> },
    { label: 'Confidentialité', v: <Badge kind={doc.confidential === 'Confidentiel' ? 'violet' : 'neutral'} dot>{doc.confidential}</Badge> },
    { label: 'Expiration',      v: doc.expires ? <span className="mono">{doc.expires}</span> : <span className="muted">—</span> },
    { label: 'Verrouillage',    v: isLocked ? <span className="row" style={{ gap: 6 }}><Avatar user={lockOwner} size="xs" /><span style={{ fontSize: 12.5 }}>{lockOwner?.name?.split(' ')[0]}</span></span> : <span className="muted">Libre</span> },
  ];
  return (
    <div className="card">
      <div className="card-hd"><h3>Détails</h3><button className="btn ghost sm" style={{ padding: 4 }} onClick={onEdit}><Icon name="pencil" size={13} /></button></div>
      <div style={{ padding: '4px 18px' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0, fontSize: 13 }}>
            <span className="muted">{r.label}</span><span>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RelatedCard = () => (
  <div className="card">
    <div className="card-hd"><h3>Documents liés</h3></div>
    <div>
      {[
        { name: 'Annexe pédagogique TP SA 2026', type: 'doc', v: '2.1' },
        { name: 'Feuille émargement — 12 mars',  type: 'pdf', v: '1.0' },
      ].map((d, i) => (
        <div key={i} className="row" style={{ padding: '10px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 0, gap: 10, cursor: 'pointer', fontSize: 13 }}>
          <FileIcon type={d.type} size={22} />
          <span style={{ flex: 1, minWidth: 0 }} className="truncate">{d.name}</span>
          <span className="mono micro">v{d.v}</span>
        </div>
      ))}
    </div>
  </div>
);

const TagsCard = ({ doc, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState(doc.tags || []);
  const [newTag, setNewTag] = useState('');
  const { showToast } = useToast();

  const addTag = () => {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || tags.includes(t)) { setNewTag(''); return; }
    setTags([...tags, t]);
    setNewTag('');
  };

  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const handleSave = () => {
    onSave(tags);
    setEditing(false);
    showToast({ message: 'Tags mis à jour', icon: 'tag' });
  };

  return (
    <div className="card">
      <div className="card-hd">
        <h3>Tags</h3>
        {!editing
          ? <button className="btn ghost sm" style={{ padding: 4 }} onClick={() => setEditing(true)}><Icon name="pencil" size={13} /></button>
          : <div className="row" style={{ gap: 6 }}>
              <button className="btn ghost sm" onClick={() => { setTags(doc.tags || []); setEditing(false); }}>Annuler</button>
              <button className="btn sm primary" onClick={handleSave}><Icon name="check" size={12} /> Enregistrer</button>
            </div>}
      </div>
      <div className="card-bd" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map(t => (
          <span key={t} className="badge b-neutral" style={{ fontSize: 12, gap: 4 }}>
            <Icon name="tag" size={10} /> {t}
            {editing && (
              <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2, color: 'var(--ink-3)', display: 'flex' }}>
                <Icon name="x" size={10} />
              </button>
            )}
          </span>
        ))}
        {editing && (
          <div className="row" style={{ gap: 4, marginTop: 4, width: '100%' }}>
            <input className="input" style={{ height: 30, fontSize: 12, flex: 1 }}
              placeholder="Nouveau tag…" value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()} />
            <button className="btn sm" onClick={addTag}><Icon name="plus" size={12} /></button>
          </div>
        )}
        {!editing && tags.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Aucun tag</span>}
      </div>
    </div>
  );
};
