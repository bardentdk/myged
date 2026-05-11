import React from 'react';
import Icon from '../icons.jsx';
import { Avatar, Badge, FileIcon, StatusBadge } from '../atoms.jsx';
import { USERS, ME, DOCS, ACTIVITY } from '../data.js';

const Dashboard = ({ onNavigate, onOpenDoc, productName }) => {
  const kpis = [
    { label: 'Documents récents',          value: 47,  delta: '+12 cette semaine', deltaCls: 'up', icon: 'file' },
    { label: 'En attente de validation',   value: 8,   delta: '3 urgents',          deltaCls: 'down', icon: 'clock' },
    { label: 'Verrouillés actuellement',   value: 3,   delta: 'par 2 collaborateurs', deltaCls: '', icon: 'lock' },
    { label: 'Expirent sous 30 jours',     value: 6,   delta: '2 documents Qualiopi', deltaCls: 'down', icon: 'warn' },
  ];

  const lockedDocs = DOCS.filter(d => d.lockedBy);
  const expiringSoon = [
    { name: 'Assurance RC professionnelle 2025-2026', expires: '01/06/2026', days: 21, type: 'pdf' },
    { name: 'Pièce identité — Mélanie Grondin',        expires: '14/06/2026', days: 34, type: 'pdf' },
    { name: 'Convention OPCO Akto — TP SA 2026',       expires: '15/06/2026', days: 35, type: 'pdf' },
  ];

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 22, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Bonjour Anne</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            Vendredi 15 mars 2026 · Vous avez <strong style={{ color: 'var(--ink)' }}>3 tâches</strong> en attente aujourd'hui.
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="upload" size={13} /> Téléverser</button>
          <button className="btn primary"><Icon name="plus" size={13} /> Nouveau document</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="label">
              <span>{k.label}</span>
              <Icon name={k.icon} size={14} style={{ color: 'var(--ink-4)' }} />
            </div>
            <div className="value">{k.value}</div>
            <div className={`delta ${k.deltaCls}`}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div className="col" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-hd">
              <div className="row" style={{ gap: 10 }}>
                <Icon name="lock" size={15} style={{ color: 'var(--warn)' }} />
                <h2>Documents verrouillés en ce moment</h2>
                <Badge kind="warn" dot>{lockedDocs.length} actifs</Badge>
              </div>
              <a href="#" className="micro" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Voir tout →</a>
            </div>
            <div>
              {lockedDocs.map((doc, i) => (
                <div key={doc.id}
                  onClick={() => onOpenDoc(doc.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    borderBottom: i < lockedDocs.length - 1 ? '1px solid var(--line)' : '0',
                    cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FileIcon type={doc.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 3 }} className="truncate">{doc.name}</div>
                    <div className="row" style={{ gap: 8, fontSize: 12, color: 'var(--ink-3)' }}>
                      <Avatar user={USERS[doc.lockedBy]} size="xs" />
                      <span><strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{USERS[doc.lockedBy].name.split(' ')[0]}</strong> modifie · depuis <span className="mono">{doc.lockedSince}</span></span>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warn)' }} className="pulse-warn" />
                    </div>
                  </div>
                  <button className="btn sm" onClick={(e) => e.stopPropagation()}>
                    <Icon name="download" size={12} /> Copie
                  </button>
                  <button className="btn sm primary" onClick={(e) => { e.stopPropagation(); onOpenDoc(doc.id); }}>
                    Ouvrir
                  </button>
                </div>
              ))}
              {[
                { name: 'Bilan pédagogique Q1 — Saint-Pierre.xlsx',  who: 'melanie', since: '11:48', type: 'xls' },
                { name: 'Plan de formation 2026 — Direction.docx',   who: 'jb',      since: '09:15', type: 'doc' },
              ].map((doc, i) => (
                <div key={'fake' + i}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    borderTop: '1px solid var(--line)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FileIcon type={doc.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 3 }} className="truncate">{doc.name}</div>
                    <div className="row" style={{ gap: 8, fontSize: 12, color: 'var(--ink-3)' }}>
                      <Avatar user={USERS[doc.who]} size="xs" />
                      <span><strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{USERS[doc.who].name.split(' ')[0]}</strong> modifie · depuis <span className="mono">{doc.since}</span></span>
                    </div>
                  </div>
                  <button className="btn sm"><Icon name="download" size={12} /> Copie</button>
                  <button className="btn sm"><Icon name="bell" size={12} /> Notifier</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <h2>Activité récente</h2>
              <div className="tabs" style={{ border: 0, marginRight: -8 }}>
                <span className="tab active">Tout</span>
                <span className="tab">Mon équipe</span>
                <span className="tab">Mes documents</span>
              </div>
            </div>
            <div className="card-bd" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {ACTIVITY.map(a => {
                const u = USERS[a.who];
                const iconMap = { lock: 'lock', upload: 'upload', comment: 'msg', validate: 'check', share: 'share', restore: 'history', sign: 'sig' };
                const colorMap = { lock: 'var(--warn)', upload: 'var(--ink-3)', comment: 'var(--accent)', validate: 'var(--ok)', share: 'var(--accent)', restore: 'var(--ink-3)', sign: 'var(--violet)' };
                return (
                  <div key={a.id} className="act-item">
                    <Avatar user={u} size="md" />
                    <div className="act-body">
                      <div>
                        <strong style={{ fontWeight: 500 }}>{u.name}</strong>{' '}
                        <span className="muted">{a.verb}</span>{' '}
                        {a.target && <span><strong style={{ fontWeight: 500 }}>{a.target}</strong>{' '}<span className="muted">le document</span>{' '}</span>}
                        <a href="#" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>{a.what}</a>
                      </div>
                      <div className="act-time row" style={{ gap: 6, marginTop: 2 }}>
                        <Icon name={iconMap[a.type]} size={11} style={{ color: colorMap[a.type] }} />
                        <span>{a.when}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-hd">
              <h2>À faire aujourd'hui</h2>
              <Badge kind="accent">3 tâches</Badge>
            </div>
            <div>
              {[
                { label: 'Valider la convention TP SA 2026', sub: 'Demandé par Sylvie · il y a 8 min', accent: true, icon: 'check' },
                { label: 'Compléter indicateur 19 Qualiopi',  sub: 'Audit dans 14 jours · 2 pièces manquantes', icon: 'shield' },
                { label: 'Renouveler assurance RC pro',       sub: 'Expire dans 21 jours', icon: 'refresh' },
              ].map((task, i) => (
                <div key={i} style={{ padding: '12px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 0, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: task.accent ? 'var(--accent-soft)' : 'var(--surface-2)',
                    color: task.accent ? 'var(--accent)' : 'var(--ink-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--line)'
                  }}>
                    <Icon name={task.icon} size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{task.label}</div>
                    <div className="micro" style={{ marginTop: 2 }}>{task.sub}</div>
                  </div>
                  <Icon name="chevR" size={14} style={{ color: 'var(--ink-4)', marginTop: 6 }} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <div className="row" style={{ gap: 8 }}>
                <Icon name="shield" size={14} style={{ color: 'var(--accent)' }} />
                <h2>Qualiopi 2026</h2>
              </div>
              <a className="micro" style={{ color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }} onClick={() => onNavigate('qualiopi')}>Voir l'audit →</a>
            </div>
            <div className="card-bd">
              <div className="row" style={{ alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>74%</span>
                <span className="muted" style={{ fontSize: 13 }}>de pièces collectées</span>
                <span className="badge b-warn" style={{ marginLeft: 'auto' }}><span className="dot" /> Audit dans 14 j</span>
              </div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {Array.from({ length: 32 }).map((_, i) => {
                  let c = 'var(--surface-3)';
                  if (i < 21) c = 'var(--ok)';
                  else if (i < 26) c = 'var(--warn)';
                  return <span key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: c }} />;
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <div className="micro">Validés</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>5 <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>/ 8 indic.</span></div>
                </div>
                <div>
                  <div className="micro">En cours</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>2</div>
                </div>
                <div>
                  <div className="micro">À traiter</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--err)' }}>1</div>
                </div>
              </div>
            </div>
            <div className="card-ft">
              <span className="micro">Responsable: Thierry Bègue</span>
              <button className="btn sm">Préparer l'export</button>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <h2>Expirent bientôt</h2>
              <Badge kind="warn">{expiringSoon.length}</Badge>
            </div>
            <div>
              {expiringSoon.map((d, i) => (
                <div key={i} style={{ padding: '10px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 0, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FileIcon type={d.type} size={22} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{d.name}</div>
                    <div className="micro mono">expire le {d.expires}</div>
                  </div>
                  <Badge kind={d.days < 30 ? 'err' : 'warn'}>{d.days}j</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
