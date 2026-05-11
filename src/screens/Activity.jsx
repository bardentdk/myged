import React, { useState } from 'react';
import Icon from '../icons.jsx';
import { Avatar, EmptyState } from '../atoms.jsx';
import { USERS } from '../data.js';

const ALL_ACTIVITY = [
  { id: 'a1',  who: 'sylvie',  verb: 'a verrouillé',            what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '15 mars · 14:32', ip: '192.168.1.10',  type: 'lock' },
  { id: 'a2',  who: 'anne',    verb: 'a téléchargé une copie',  what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '15 mars · 14:36', ip: '192.168.1.22',  type: 'download' },
  { id: 'a3',  who: 'thierry', verb: 'a commenté',              what: 'Indicateur 11 — Suivi apprenants 2026',         doc: 'd7', when: '15 mars · 12:04', ip: '10.0.0.5',      type: 'comment' },
  { id: 'a4',  who: 'anne',    verb: 'a ouvert',                what: 'Feuille émargement — 12 mars 2026',            doc: 'd2', when: '15 mars · 11:50', ip: '192.168.1.22',  type: 'eye' },
  { id: 'a5',  who: 'jb',      verb: 'a validé',                what: 'Bilan pédagogique Q4 2025',                    doc: null, when: '14 mars · 17:08', ip: '192.168.1.1',   type: 'check' },
  { id: 'a6',  who: 'melanie', verb: "a partagé à l'extérieur", what: 'Audit Qualiopi 2026 — checklist',              doc: null, when: '14 mars · 14:20', ip: '192.168.1.14',  type: 'share' },
  { id: 'a7',  who: 'sylvie',  verb: 'a remplacé par v2.3',     what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '15 mars · 14:32', ip: '192.168.1.10',  type: 'upload' },
  { id: 'a8',  who: 'anne',    verb: 'a restauré v1.2',         what: 'Convention TP Secrétaire Assistant 2026',       doc: 'd1', when: '13 mars · 09:15', ip: '192.168.1.22',  type: 'history' },
  { id: 'a9',  who: 'jb',      verb: 'a supprimé',              what: 'Brouillon interne non finalisé.docx',           doc: null, when: '12 mars · 18:00', ip: '192.168.1.1',   type: 'x' },
  { id: 'a10', who: 'sylvie',  verb: 'a signé',                 what: 'Contrat de professionnalisation — OPCO Akto',  doc: 'd6', when: '12 mars · 15:28', ip: '192.168.1.10',  type: 'sig' },
  { id: 'a11', who: 'thierry', verb: 'a téléchargé',            what: 'Indicateur 11 — Suivi apprenants 2026',        doc: 'd7', when: '12 mars · 10:44', ip: '10.0.0.5',      type: 'download' },
  { id: 'a12', who: 'marie',   verb: 'a ouvert',                what: 'Fiche formateur — Marie Técher',               doc: 'd10',when: '11 mars · 16:30', ip: '172.18.0.12',   type: 'eye' },
  { id: 'a13', who: 'audit',   verb: 'a consulté (lien externe)',what: 'Checklist Qualiopi 2026',                      doc: null, when: '10 mars · 09:12', ip: '80.14.2.55',    type: 'link' },
];

const ACTION_LABELS = {
  lock: 'Verrouillage', download: 'Téléchargement', comment: 'Commentaire', eye: 'Consultation',
  check: 'Validation', share: 'Partage', upload: 'Nouvelle version', history: 'Restauration',
  x: 'Suppression', sig: 'Signature', link: 'Accès externe',
};

const ACTION_COLOR = {
  lock: 'var(--warn)', download: 'var(--ink-3)', comment: 'var(--accent)', eye: 'var(--ink-4)',
  check: 'var(--ok)', share: 'var(--accent)', upload: 'var(--ok)', history: 'var(--violet)',
  x: 'var(--err)', sig: 'var(--violet)', link: 'var(--accent)',
};

const ActivityScreen = ({ onOpenDoc }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterWho, setFilterWho] = useState('all');
  const [search, setSearch] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  const shown = ALL_ACTIVITY.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterWho !== 'all' && a.who !== filterWho) return false;
    if (search && !a.what.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Journal d'activité</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>Audit complet · {ALL_ACTIVITY.length} événements · conformité RGPD & Qualiopi</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn sm" onClick={() => setExportOpen(v => !v)}><Icon name="download" size={13} /> Exporter le journal</button>
        </div>
      </div>

      {exportOpen && (
        <div className="card" style={{ padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 16, alignItems: 'center', background: 'var(--accent-soft)', borderColor: 'var(--accent-soft)' }}>
          <Icon name="download" size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ flex: 1, fontSize: 13 }}>Exporter les <strong>{shown.length}</strong> événements filtrés en :</span>
          <button className="btn sm primary">CSV</button>
          <button className="btn sm">PDF horodaté</button>
          <button className="btn sm">JSON (RGPD)</button>
          <button className="btn ghost sm" onClick={() => setExportOpen(false)}><Icon name="x" size={12} /></button>
        </div>
      )}

      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search" style={{ flex: 1, minWidth: 200 }}>
          <Icon name="search" size={14} />
          <input placeholder="Filtrer par document…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        </div>
        <select className="input" style={{ width: 'auto', height: 34, fontSize: 13, padding: '0 10px' }} value={filterWho} onChange={e => setFilterWho(e.target.value)}>
          <option value="all">Tous les utilisateurs</option>
          {Object.values(USERS).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="input" style={{ width: 'auto', height: 34, fontSize: 13, padding: '0 10px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn sm ghost" onClick={() => { setSearch(''); setFilterType('all'); setFilterWho('all'); }}>
          <Icon name="refresh" size={12} /> Réinitialiser
        </button>
        <span className="micro mono" style={{ marginLeft: 'auto' }}>{shown.length} événements</span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="t">
          <thead>
            <tr>
              <th style={{ width: 160 }}>Utilisateur</th>
              <th style={{ width: 130 }}>Action</th>
              <th>Document</th>
              <th style={{ width: 160 }}>Date & heure</th>
              <th style={{ width: 120 }}>IP / Appareil</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {shown.map(a => {
              const u = USERS[a.who];
              return (
                <tr key={a.id}>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar user={u} size="md" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name.split(' ')[0]}</div>
                        <div className="micro">{u.role.split(' ')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="row" style={{ gap: 6 }}>
                      <Icon name={a.type} size={13} style={{ color: ACTION_COLOR[a.type] }} />
                      <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{ACTION_LABELS[a.type]}</span>
                    </span>
                  </td>
                  <td className="col-name" style={{ fontSize: 13 }}>
                    {a.doc
                      ? <a href="#" style={{ color: 'var(--ink)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); onOpenDoc(a.doc); }}>{a.what}</a>
                      : <span style={{ color: 'var(--ink-2)' }}>{a.what}</span>}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.when}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.ip}</td>
                  <td>
                    <button className="btn ghost sm" style={{ padding: 4 }}>
                      <Icon name="more" size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <EmptyState icon="clock" title="Aucun événement" sub="Modifiez vos filtres pour voir l'activité." />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 18 }}>
        {Object.entries(ACTION_LABELS).slice(0, 5).map(([k, v]) => {
          const cnt = ALL_ACTIVITY.filter(a => a.type === k).length;
          return (
            <div className="kpi" key={k} onClick={() => setFilterType(k)} style={{ cursor: 'pointer' }}>
              <div className="label"><span>{v}</span><Icon name={k} size={13} style={{ color: ACTION_COLOR[k] }} /></div>
              <div className="value" style={{ fontSize: 22, color: ACTION_COLOR[k] }}>{cnt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityScreen;
