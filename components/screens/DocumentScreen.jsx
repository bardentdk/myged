'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon, StatusBadge } from '@/components/ui/Atoms';
import { USERS, ME, DOCS, VERSIONS } from '@/lib/data';
import { useToast } from '@/lib/context/ToastContext';

export default function DocumentScreen({ docId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const doc = DOCS.find((d) => d.id === docId) || DOCS[0];
  const [tab, setTab] = useState('preview');
  const [requestSent, setRequestSent] = useState(false);
  const [notifyOn, setNotifyOn] = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [comment, setComment] = useState('');
  const [scenario, setScenario] = useState('locked');

  const isLocked = !!doc.lockedBy && scenario !== 'released';
  const lockedByMe = doc.lockedBy === ME.id;
  const lockOwner = isLocked ? USERS[doc.lockedBy] : null;

  const handleRequestUnlock = () => { setRequestSent(true); showToast({ message: `Demande envoyée à ${lockOwner.name.split(' ')[0]}`, icon: 'send' }); };
  const handleNotify = () => { setNotifyOn(true); showToast({ message: 'Vous serez notifié·e dès que le document sera libéré', icon: 'bell' }); };
  const handleDownloadCopy = () => showToast({ message: `Copie téléchargée — ${doc.name}`, icon: 'download' });
  const handleForceUnlock = () => { setShowForceModal(false); setScenario('released'); showToast({ message: 'Document déverrouillé. Sylvie a été notifiée.', icon: 'unlock' }); };
  const handleRelease = () => { setScenario('released'); showToast({ message: "Sylvie vient de libérer le document — c'est à vous.", icon: 'unlock' }); };

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
            <span>Modifié {doc.updatedAt} par {USERS[doc.updatedBy].name.split(' ')[0]}</span>
            {doc.expires && (<><span>·</span><span>Expire le <span className="mono">{doc.expires}</span></span></>)}
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm ghost" title="Favori"><Icon name="star" size={14} /></button>
          <button className="btn sm"><Icon name="download" size={13} /> Télécharger</button>
          <button className="btn sm"><Icon name="share" size={13} /> Partager</button>
          {isLocked && !lockedByMe
            ? <button className="btn sm" disabled style={{ opacity: .55, cursor: 'not-allowed' }}><Icon name="lock" size={13} /> Modifier</button>
            : <button className="btn primary sm"><Icon name="edit" size={13} /> Modifier</button>}
          <button className="btn sm ghost"><Icon name="more" size={14} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isLocked && !lockedByMe && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <LockBanner owner={lockOwner} since={doc.lockedSince} requestSent={requestSent} notifyOn={notifyOn}
              onCopy={handleDownloadCopy} onNotify={handleNotify} onRequest={handleRequestUnlock}
              onForce={() => setShowForceModal(true)} onSimulateRelease={handleRelease} />
          </motion.div>
        )}
        {scenario === 'released' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <ReleasedBanner onEdit={() => showToast({ message: 'Édition démarrée — document verrouillé par vous', icon: 'lock' })} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, marginTop: 14 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-hd">
            <div className="tabs" style={{ border: 0 }}>
              {[
                { id: 'preview', label: 'Aperçu' },
                { id: 'versions', label: 'Versions', count: 6 },
                { id: 'activity', label: 'Activité' },
                { id: 'comments', label: 'Commentaires', count: 3 },
                { id: 'permissions', label: 'Permissions' },
              ].map((t) => (
                <span key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.label}{t.count != null && <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 4 }}>{t.count}</span>}
                </span>
              ))}
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn ghost sm"><Icon name="search" size={12} /></button>
              <span className="micro mono">1 / 4</span>
            </div>
          </div>
          <div style={{ minHeight: 540 }}>
            {tab === 'preview' && <PreviewPane doc={doc} isLocked={isLocked} lockOwner={lockOwner} />}
            {tab === 'versions' && <VersionsList />}
            {tab === 'activity' && <ActivityList />}
            {tab === 'comments' && <CommentsPane comment={comment} setComment={setComment} />}
            {tab === 'permissions' && <PermissionsTable />}
          </div>
        </div>

        <aside className="col" style={{ gap: 14 }}>
          <DetailsCard doc={doc} isLocked={isLocked} lockOwner={lockOwner} />
          <RelatedCard />
          <TagsCard doc={doc} />
        </aside>
      </div>

      <AnimatePresence>
        {showForceModal && (
          <ForceUnlockModal owner={lockOwner} onCancel={() => setShowForceModal(false)} onConfirm={handleForceUnlock} />
        )}
      </AnimatePresence>
    </div>
  );
}

const LockBanner = ({ owner, since, requestSent, notifyOn, onCopy, onNotify, onRequest, onForce, onSimulateRelease }) => (
  <div className="card" style={{ borderColor: '#f0c98c', background: 'linear-gradient(180deg, #fdf6ea, #fcf2e2)', boxShadow: '0 1px 0 rgba(180,83,9,.08), 0 4px 12px rgba(180,83,9,.06)', marginBottom: 14 }}>
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
        <button className="btn sm" onClick={onCopy}><Icon name="download" size={13} /> Télécharger une copie</button>
        <button className="btn sm" onClick={onNotify} disabled={notifyOn} style={notifyOn ? { color: 'var(--ok)', borderColor: 'var(--ok)' } : {}}>
          {notifyOn ? <><Icon name="check" size={13} /> Notification activée</> : <><Icon name="bell" size={13} /> Me notifier</>}
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
  <div className="card" style={{ borderColor: '#9fd3b5', background: 'linear-gradient(180deg, #f1faf3, #e7f6ec)', marginBottom: 14 }}>
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

const ForceUnlockModal = ({ owner, onCancel, onConfirm }) => (
  <motion.div className="modal-bg" onClick={onCancel}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="modal" onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--err-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="warn" size={18} style={{ color: 'var(--err)' }} />
          </div>
          <h2 style={{ fontSize: 17 }}>Forcer le déverrouillage ?</h2>
        </div>
      </div>
      <div style={{ padding: '18px 24px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
        <p style={{ marginTop: 0 }}><strong>{owner.name}</strong> est en train de modifier ce document depuis 23 minutes. Forcer le déverrouillage peut <strong>provoquer la perte de ses modifications</strong>.</p>
        <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, border: '1px solid var(--line)', fontSize: 12.5 }}>
          <div className="row" style={{ gap: 8 }}>
            <Icon name="info" size={13} style={{ color: 'var(--ink-3)' }} />
            <span>{owner.name.split(' ')[0]} sera notifiée immédiatement.</span>
          </div>
        </div>
        <label className="label" style={{ marginTop: 14 }}>Motif (obligatoire, conservé dans le journal d'audit)</label>
        <textarea className="input" rows={3} defaultValue="Document bloqué depuis ce matin, Sylvie en congé exceptionnel cet après-midi." />
      </div>
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="micro">Action réservée aux administrateurs · traçable</span>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={onCancel}>Annuler</button>
          <button className="btn danger" onClick={onConfirm} style={{ background: 'var(--err)', color: '#fff', borderColor: 'var(--err)' }}>Forcer le déverrouillage</button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

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
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1a1a1a', fontWeight: 700, margin: 0 }}>Titre Professionnel Secrétaire Assistant·e — Session 2026</h3>
        <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>N° d'enregistrement : 974-26-00471</div>
      </div>
      <p style={{ marginTop: 0 }}><strong>Entre les soussignés :</strong></p>
      <p>L'organisme de formation <strong>CFA Horizon Réunion</strong>, immatriculé sous le numéro <span className="mono" style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11.5 }}>974-OF-001234</span>, dont le siège est situé 12 rue Sainte-Anne — 97400 Saint-Denis, représenté par M. Jean-Baptiste Fontaine, Directeur,</p>
      <p><strong>Article 1 — Objet de la convention</strong></p>
      <p>La présente convention a pour objet la formation professionnelle continue de l'apprenant Jean Payet dans le cadre de la préparation au Titre Professionnel Secrétaire Assistant·e de niveau 4.</p>
      <p><strong>Article 2 — Nature et durée de la formation</strong></p>
      <p>L'action de formation se déroule sur <strong>805 heures</strong>, du 12 janvier 2026 au 28 août 2026, sur le site de Saint-Denis…</p>
      <div style={{ marginTop: 18, height: 1, background: '#eee' }} />
      <div style={{ textAlign: 'center', fontSize: 10, color: '#aaa', marginTop: 12 }}>Page 1 / 4</div>
    </div>
  </div>
);

const VersionsList = () => (
  <div style={{ padding: '8px 0' }}>
    {VERSIONS.map((v, i) => {
      const u = USERS[v.author];
      return (
        <div key={v.v} style={{ display: 'flex', gap: 14, padding: '14px 22px', borderBottom: i < VERSIONS.length - 1 ? '1px solid var(--line)' : 0, background: v.current ? 'var(--accent-soft)' : 'transparent', position: 'relative' }}>
          {v.current && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--accent)' }} />}
          <div style={{ position: 'relative', width: 18, paddingTop: 2 }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : '#fff', border: `2px solid ${v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : 'var(--line-strong)'}`, margin: '0 auto' }} />
            {i < VERSIONS.length - 1 && <div style={{ position: 'absolute', left: '50%', top: 16, bottom: -14, width: 1, background: 'var(--line)', transform: 'translateX(-.5px)' }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>v{v.v}</span>
              {v.current && <Badge kind="accent" dot>Version actuelle</Badge>}
              {v.milestone && <Badge kind="violet">Jalon</Badge>}
              <span className="micro mono" style={{ marginLeft: 'auto' }}>{v.size}</span>
            </div>
            <div className="row" style={{ gap: 6, fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 6 }}>
              <Avatar user={u} size="xs" /><span><strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{u.name}</strong> · {v.date}</span>
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
  return (
    <div style={{ padding: '8px 22px' }}>
      {items.map((a, i) => {
        const u = USERS[a.who];
        return (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 0 }}>
            <Avatar user={u} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}><strong style={{ fontWeight: 500 }}>{u.name}</strong> <span className="muted">{a.verb}</span></div>
              <div className="micro mono" style={{ marginTop: 2 }}>{a.when}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CommentsPane = ({ comment, setComment }) => (
  <div style={{ padding: 22 }}>
    {[
      { who: 'thierry', text: "J'ai besoin du n° d'enregistrement Qualiopi à jour avant validation finale.", when: 'il y a 3 j' },
      { who: 'sylvie',  text: "Bien noté. Je l'intègre dans la prochaine version cet après-midi.", when: 'il y a 3 j' },
      { who: 'jb',      text: "Pensez à vérifier les clauses de financement OPCO — Akto a mis à jour son barème.", when: 'il y a 1 j' },
    ].map((c, i) => {
      const u = USERS[c.who];
      return (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
          <Avatar user={u} size="lg" />
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <strong style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</strong>
              <span className="micro">{c.when}</span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{c.text}</div>
          </div>
        </div>
      );
    })}
    <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Avatar user={ME} size="lg" />
      <div style={{ flex: 1 }}>
        <textarea className="input" rows={3} placeholder="Ajouter un commentaire… utilisez @ pour mentionner" value={comment} onChange={(e) => setComment(e.target.value)} />
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn primary sm" disabled={!comment}><Icon name="send" size={12} /> Publier</button>
        </div>
      </div>
    </div>
  </div>
);

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
          {rows.map((r) => {
            const u = USERS[r.who];
            return (
              <tr key={r.who} style={{ cursor: 'default' }}>
                <td><div className="row" style={{ gap: 8 }}><Avatar user={u} size="md" /><span style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</span></div></td>
                <td><span className="micro">{r.role}</span></td>
                {Object.keys(labels).map((k) => (
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

const DetailsCard = ({ doc, isLocked, lockOwner }) => {
  const rows = [
    { label: 'Statut',          v: <StatusBadge status={doc.status} /> },
    { label: 'Version',         v: <span className="mono">v{doc.version}</span> },
    { label: 'Propriétaire',    v: <span className="row" style={{ gap: 6 }}><Avatar user={USERS[doc.owner]} size="xs" />{USERS[doc.owner].name}</span> },
    { label: 'Taille',          v: <span className="mono">{doc.size}</span> },
    { label: 'Confidentialité', v: <Badge kind={doc.confidential === 'Confidentiel' ? 'violet' : 'neutral'} dot>{doc.confidential}</Badge> },
    { label: 'Expiration',      v: doc.expires ? <span className="mono">{doc.expires}</span> : <span className="muted">—</span> },
    { label: 'Verrouillage',    v: isLocked ? <span className="row" style={{ gap: 6 }}><Avatar user={lockOwner} size="xs" /><span style={{ fontSize: 12.5 }}>{lockOwner.name.split(' ')[0]}</span></span> : <span className="muted">Libre</span> },
  ];
  return (
    <div className="card">
      <div className="card-hd"><h3>Détails</h3></div>
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

const TagsCard = ({ doc }) => (
  <div className="card">
    <div className="card-hd"><h3>Tags</h3><button className="btn ghost sm" style={{ padding: 4 }}><Icon name="plus" size={13} /></button></div>
    <div className="card-bd" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {doc.tags.map((t) => <Badge key={t} kind="neutral"><Icon name="tag" size={10} /> {t}</Badge>)}
    </div>
  </div>
);
