'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Avatar, EmptyState } from '@/components/ui/Atoms';
import { useToast } from '@/lib/context/ToastContext';
import { USERS } from '@/lib/data';

const ALL_ACTIVITY = [
  { id: 'a1',  who: 'sylvie',  verb: 'a verrouillé',             what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '15 mars · 14:32', ip: '192.168.1.10',  type: 'lock' },
  { id: 'a2',  who: 'anne',    verb: 'a téléchargé une copie',   what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '15 mars · 14:36', ip: '192.168.1.22',  type: 'download' },
  { id: 'a3',  who: 'thierry', verb: 'a commenté',               what: 'Indicateur 11 — Suivi apprenants 2026',         doc: 'd7', when: '15 mars · 12:04', ip: '10.0.0.5',      type: 'comment' },
  { id: 'a4',  who: 'anne',    verb: 'a ouvert',                 what: 'Feuille émargement — 12 mars 2026',             doc: 'd2', when: '15 mars · 11:50', ip: '192.168.1.22',  type: 'eye' },
  { id: 'a5',  who: 'jb',      verb: 'a validé',                 what: 'Bilan pédagogique Q4 2025',                     doc: null, when: '14 mars · 17:08', ip: '192.168.1.1',   type: 'check' },
  { id: 'a6',  who: 'melanie', verb: "a partagé à l'extérieur",  what: 'Audit Qualiopi 2026 — checklist',               doc: null, when: '14 mars · 14:20', ip: '192.168.1.14',  type: 'share' },
  { id: 'a7',  who: 'sylvie',  verb: 'a remplacé par v2.3',      what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '15 mars · 14:32', ip: '192.168.1.10',  type: 'upload' },
  { id: 'a8',  who: 'anne',    verb: 'a restauré v1.2',          what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '13 mars · 09:15', ip: '192.168.1.22',  type: 'history' },
  { id: 'a9',  who: 'jb',      verb: 'a supprimé',               what: 'Brouillon interne non finalisé.docx',           doc: null, when: '12 mars · 18:00', ip: '192.168.1.1',   type: 'x' },
  { id: 'a10', who: 'sylvie',  verb: 'a signé',                  what: 'Contrat de professionnalisation — OPCO Akto',   doc: 'd6', when: '12 mars · 15:28', ip: '192.168.1.10',  type: 'sig' },
  { id: 'a11', who: 'thierry', verb: 'a téléchargé',             what: 'Indicateur 11 — Suivi apprenants 2026',         doc: 'd7', when: '12 mars · 10:44', ip: '10.0.0.5',      type: 'download' },
  { id: 'a12', who: 'marie',   verb: 'a ouvert',                 what: 'Fiche formateur — Marie Técher',                doc: 'd10',when: '11 mars · 16:30', ip: '172.18.0.12',   type: 'eye' },
  { id: 'a13', who: 'audit',   verb: 'a consulté (lien externe)',what: 'Checklist Qualiopi 2026',                        doc: null, when: '10 mars · 09:12', ip: '80.14.2.55',    type: 'link' },
];

const ACTION_LABELS = { lock: 'Verrouillage', download: 'Téléchargement', comment: 'Commentaire', eye: 'Consultation', check: 'Validation', share: 'Partage', upload: 'Nouvelle version', history: 'Restauration', x: 'Suppression', sig: 'Signature', link: 'Accès externe' };
const ACTION_COLOR  = { lock: 'var(--warn)', download: 'var(--ink-3)', comment: 'var(--accent)', eye: 'var(--ink-4)', check: 'var(--ok)', share: 'var(--accent)', upload: 'var(--ok)', history: 'var(--violet)', x: 'var(--err)', sig: 'var(--violet)', link: 'var(--accent)' };

function RowMenu({ a, onClose }) {
  const router = useRouter();
  const { showToast } = useToast();
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 100, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,.12)', padding: '4px 0', minWidth: 180 }}>
      {a.doc && (
        <div onClick={() => { router.push(`/documents/${a.doc}`); onClose(); }} style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 8 }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon name="eye" size={14} /> Voir le document
        </div>
      )}
      <div onClick={() => { navigator.clipboard?.writeText(a.ip); showToast({ type: 'success', message: `IP ${a.ip} copiée` }); onClose(); }}
        style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Icon name="copy" size={14} /> Copier l'IP
      </div>
    </div>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState('all');
  const [filterWho, setFilterWho] = useState('all');
  const [search, setSearch] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const shown = ALL_ACTIVITY.filter((a) => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterWho !== 'all' && a.who !== filterWho) return false;
    if (search && !a.what.toLowerCase().includes(search.toLowerCase()) && !a.who.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const downloadFile = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = 'Date,Utilisateur,Rôle,Action,Document,IP\n';
    const rows   = shown.map((a) => {
      const u = USERS[a.who];
      return [a.when, u?.name || a.who, u?.role || '', ACTION_LABELS[a.type] || a.type, a.what, a.ip].map((v) => `"${v}"`).join(',');
    }).join('\n');
    downloadFile(header + rows, 'journal-activite.csv', 'text/csv');
    showToast({ type: 'success', message: 'Export CSV téléchargé' });
    setExportOpen(false);
  };

  const exportJSON = () => {
    const data = shown.map((a) => ({ date: a.when, user: USERS[a.who]?.name || a.who, action: ACTION_LABELS[a.type] || a.type, document: a.what, ip: a.ip }));
    downloadFile(JSON.stringify(data, null, 2), 'journal-activite.json', 'application/json');
    showToast({ type: 'success', message: 'Export JSON téléchargé' });
    setExportOpen(false);
  };

  const kpiTypes = ['lock', 'upload', 'comment', 'check', 'share'];

  return (
    <div className="page" style={{ paddingTop: 22 }} onClick={() => setOpenMenu(null)}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Journal d'activité</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>{shown.length} événement{shown.length !== 1 ? 's' : ''} · {Object.keys(USERS).length} utilisateurs actifs</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn primary" onClick={(e) => { e.stopPropagation(); setExportOpen((v) => !v); }}>
            <Icon name="download" size={13} /> Exporter
          </button>
          {exportOpen && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.15)', padding: '6px 0', minWidth: 180, zIndex: 50 }}>
              {[
                { label: 'Exporter en CSV',  icon: 'list',     action: exportCSV  },
                { label: 'Exporter en JSON', icon: 'code',     action: exportJSON },
                { label: 'Export PDF',       icon: 'file',     action: () => { showToast({ type: 'info', message: 'Export PDF en préparation…' }); setExportOpen(false); } },
              ].map((item) => (
                <div key={item.label} onClick={item.action} style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Icon name={item.icon} size={14} /> {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI pills */}
      <div className="row" style={{ gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {kpiTypes.map((t) => {
          const count = ALL_ACTIVITY.filter((a) => a.type === t).length;
          return (
            <button key={t} onClick={() => setFilterType((f) => f === t ? 'all' : t)}
              className={`btn sm ${filterType === t ? '' : 'ghost'}`}
              style={{ borderLeftColor: ACTION_COLOR[t], borderLeftWidth: 3, borderLeftStyle: 'solid' }}>
              <Icon name={t === 'lock' ? 'lock' : t === 'check' ? 'check' : t === 'comment' ? 'msg' : t === 'upload' ? 'upload' : 'share'} size={12} style={{ color: ACTION_COLOR[t] }} />
              {ACTION_LABELS[t]}
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 2 }}>{count}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)', alignSelf: 'center' }}>{shown.length} résultat{shown.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 32, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 7, flex: 1, minWidth: 160 }}>
          <Icon name="search" size={13} style={{ color: 'var(--ink-3)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, document…"
            style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13, fontFamily: 'inherit', flex: 1 }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-3)' }}>×</button>}
        </div>
        <select className="input" style={{ height: 32, fontSize: 13, padding: '0 10px', width: 'auto' }} value={filterWho} onChange={(e) => setFilterWho(e.target.value)}>
          <option value="all">Tous les utilisateurs</option>
          {Object.values(USERS).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="input" style={{ height: 32, fontSize: 13, padding: '0 10px', width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(search || filterWho !== 'all' || filterType !== 'all') && (
          <button className="btn sm ghost" onClick={() => { setSearch(''); setFilterWho('all'); setFilterType('all'); }}>
            <Icon name="x" size={12} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {shown.length === 0 ? (
          <EmptyState icon="search" title="Aucun événement" sub="Modifiez les filtres pour voir des résultats." />
        ) : (
          <table className="t">
            <thead>
              <tr>
                <th style={{ width: 150 }}>Date</th>
                <th style={{ width: 180 }}>Utilisateur</th>
                <th style={{ width: 140 }}>Action</th>
                <th>Document</th>
                <th style={{ width: 130 }}>IP</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => {
                const u = USERS[a.who];
                return (
                  <tr key={a.id}>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.when}</td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <Avatar user={u} size="xs" />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{u?.name}</div>
                          <div className="micro truncate">{u?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <Icon name={a.type === 'lock' ? 'lock' : a.type === 'check' ? 'check' : a.type === 'comment' ? 'msg' : a.type === 'upload' ? 'upload' : a.type === 'share' ? 'share' : a.type === 'history' ? 'history' : a.type === 'x' ? 'trash' : a.type === 'sig' ? 'sig' : a.type === 'link' ? 'link' : 'eye'} size={13} style={{ color: ACTION_COLOR[a.type] || 'var(--ink-3)' }} />
                        <span style={{ fontSize: 12.5 }}>{ACTION_LABELS[a.type] || a.type}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{a.what}</div>
                      {a.doc && <div className="micro" style={{ marginTop: 1 }}><button onClick={() => router.push(`/documents/${a.doc}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 11, padding: 0 }}>Ouvrir →</button></div>}
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--ink-4)' }}>{a.ip}</td>
                    <td style={{ position: 'relative' }}>
                      <button className="btn ghost sm" style={{ padding: 4 }} onClick={(e) => { e.stopPropagation(); setOpenMenu((v) => v === a.id ? null : a.id); }}>
                        <Icon name="more" size={14} />
                      </button>
                      {openMenu === a.id && <RowMenu a={a} onClose={() => setOpenMenu(null)} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
