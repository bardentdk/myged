'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon, StatusBadge } from '@/components/ui/Atoms';
import { useDocs } from '@/lib/context/DocsContext';
import { useNotifications } from '@/lib/context/NotificationsContext';
import { USERS, ACTIVITY, ME } from '@/lib/data';

function KpiCard({ label, value, delta, deltaCls, icon, index }) {
  const valRef = useRef(null);
  useEffect(() => {
    const el = valRef.current;
    if (!el) return;
    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: value, duration: 1.0, delay: index * 0.1, ease: 'power2.out',
      onUpdate() { if (el) el.textContent = Math.round(obj.n); },
    });
    return () => tween.kill();
  }, [value, index]);

  return (
    <motion.div className="kpi" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.07 }}>
      <div className="label"><span>{label}</span><Icon name={icon} size={14} style={{ color: 'var(--ink-4)' }} /></div>
      <div className="value" ref={valRef}>{value}</div>
      <div className={`delta ${deltaCls}`}>{delta}</div>
    </motion.div>
  );
}

const TASK_ICONS = { check: 'check', shield: 'shield', refresh: 'refresh', bell: 'bell', upload: 'upload' };

export default function DashboardScreen() {
  const router = useRouter();
  const { docs } = useDocs();
  const { unreadCount } = useNotifications();

  const lockedDocs     = docs.filter((d) => d.lockedBy);
  const pendingDocs    = docs.filter((d) => d.status === 'review' || d.status === 'pending');
  const expiringDocs   = docs.filter((d) => d.expires && d.expires !== null).slice(0, 3);
  const recentDocs     = docs.slice(0, 7);

  const [actFilter, setActFilter] = useState('all');
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Valider la convention TP SA 2026',  sub: 'Demandé par Sylvie · il y a 8 min', accent: true,  icon: 'check',   done: false, docId: 'd1' },
    { id: 2, label: 'Compléter indicateur 19 Qualiopi',  sub: 'Audit dans 14 jours · 2 pièces manquantes',      icon: 'shield',  done: false, docId: null },
    { id: 3, label: 'Renouveler assurance RC pro',       sub: 'Expire dans 21 jours',               icon: 'refresh', done: false, docId: 'd9'  },
  ]);
  const pendingTasks = tasks.filter((t) => !t.done).length;

  const kpis = [
    { label: 'Documents',           value: docs.length,                    delta: `${pendingDocs.length} en validation`,  deltaCls: pendingDocs.length > 0 ? 'down' : '', icon: 'file'  },
    { label: 'En attente validation',value: pendingDocs.length,            delta: pendingDocs.length > 0 ? 'À traiter' : 'Tout est validé', deltaCls: pendingDocs.length > 0 ? 'down' : '', icon: 'clock' },
    { label: 'Verrouillés',          value: lockedDocs.length,             delta: 'par ' + new Set(lockedDocs.map(d => d.lockedBy)).size + ' collaborateurs', deltaCls: '', icon: 'lock' },
    { label: 'Notifications',        value: unreadCount,                   delta: 'non lues',                            deltaCls: unreadCount > 0 ? 'down' : '', icon: 'bell' },
  ];

  const shownActivity = ACTIVITY.filter((a) => {
    if (actFilter === 'mine') return a.who === ME.id;
    if (actFilter === 'team') return ['sylvie', 'melanie', 'jb', 'thierry'].includes(a.who);
    return true;
  });

  const now = new Date();
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 22, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Bonjour {ME.name.split(' ')[0]}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} · Vous avez{' '}
            <strong style={{ color: pendingTasks > 0 ? 'var(--ink)' : 'var(--ok)' }}>{pendingTasks} tâche{pendingTasks !== 1 ? 's' : ''}</strong> en attente.
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => router.push('/documents')}><Icon name="folder" size={13} /> Documents</button>
          <button className="btn primary" onClick={() => router.push('/documents')}><Icon name="plus" size={13} /> Nouveau document</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {kpis.map((k, i) => <KpiCard key={i} index={i} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div className="col" style={{ gap: 18 }}>
          {/* Locked docs */}
          <div className="card">
            <div className="card-hd">
              <div className="row" style={{ gap: 10 }}>
                <Icon name="lock" size={15} style={{ color: 'var(--warn)' }} />
                <h2>Documents verrouillés</h2>
                {lockedDocs.length > 0 && <Badge kind="warn" dot>{lockedDocs.length} actifs</Badge>}
              </div>
              <button className="micro" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => router.push('/documents')}>Voir tout →</button>
            </div>
            {lockedDocs.length === 0 ? (
              <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                <Icon name="unlock" size={24} style={{ marginBottom: 8, opacity: .4 }} /><br />Aucun document verrouillé
              </div>
            ) : lockedDocs.map((doc, i) => (
              <div key={doc.id} onClick={() => router.push(`/documents/${doc.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 0, cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <FileIcon type={doc.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 3 }} className="truncate">{doc.name}</div>
                  <div className="row" style={{ gap: 8, fontSize: 12, color: 'var(--ink-3)' }}>
                    <Avatar user={USERS[doc.lockedBy]} size="xs" />
                    <span><strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{USERS[doc.lockedBy]?.name.split(' ')[0]}</strong> modifie · depuis <span className="mono">{doc.lockedSince}</span></span>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warn)', flexShrink: 0 }} />
                  </div>
                </div>
                <button className="btn sm" onClick={(e) => e.stopPropagation()}><Icon name="download" size={12} /> Copie</button>
                <button className="btn sm primary" onClick={(e) => { e.stopPropagation(); router.push(`/documents/${doc.id}`); }}>Ouvrir</button>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div className="card">
            <div className="card-hd">
              <h2>Activité récente</h2>
              <div className="tabs" style={{ border: 0, marginRight: -8 }}>
                {[['all', 'Tout'], ['team', 'Mon équipe'], ['mine', 'Mes documents']].map(([id, label]) => (
                  <span key={id} className={`tab ${actFilter === id ? 'active' : ''}`} onClick={() => setActFilter(id)} style={{ cursor: 'pointer' }}>{label}</span>
                ))}
              </div>
            </div>
            <div className="card-bd" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {shownActivity.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Aucune activité</div>
              ) : shownActivity.map((a) => {
                const u = USERS[a.who];
                const iconMap = { lock: 'lock', upload: 'upload', comment: 'msg', validate: 'check', share: 'share', restore: 'history', sign: 'sig' };
                const colorMap = { lock: 'var(--warn)', upload: 'var(--ink-3)', comment: 'var(--accent)', validate: 'var(--ok)', share: 'var(--accent)', restore: 'var(--ink-3)', sign: 'var(--violet)' };
                return (
                  <div key={a.id} className="act-item" style={{ cursor: a.docId ? 'pointer' : 'default' }} onClick={() => a.docId && router.push(`/documents/${a.docId}`)}>
                    <Avatar user={u} size="md" />
                    <div className="act-body">
                      <div>
                        <strong style={{ fontWeight: 500 }}>{u.name}</strong>{' '}
                        <span className="muted">{a.verb}</span>{' '}
                        {a.target && <><strong style={{ fontWeight: 500 }}>{a.target}</strong>{' '}<span className="muted">le</span>{' '}</>}
                        <span style={{ fontWeight: 500 }}>{a.what}</span>
                      </div>
                      <div className="act-time row" style={{ gap: 6, marginTop: 2 }}>
                        <Icon name={iconMap[a.type] || 'clock'} size={11} style={{ color: colorMap[a.type] || 'var(--ink-3)' }} />
                        <span>{a.when}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card-ft">
              <span />
              <button className="btn sm ghost" onClick={() => router.push('/activity')}>Journal complet →</button>
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          {/* Tasks */}
          <div className="card">
            <div className="card-hd">
              <h2>À faire aujourd'hui</h2>
              <Badge kind={pendingTasks > 0 ? 'accent' : 'ok'}>{pendingTasks > 0 ? `${pendingTasks} tâches` : 'Tout fait ✓'}</Badge>
            </div>
            <div>
              {tasks.map((task, i) => (
                <div key={task.id} style={{ padding: '12px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 0, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', opacity: task.done ? 0.45 : 1, transition: 'opacity .2s' }}
                  onClick={() => task.docId && router.push(`/documents/${task.docId}`)}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setTasks((ts) => ts.map((t) => t.id === task.id ? { ...t, done: !t.done } : t)); }}
                    style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2, background: task.done ? 'var(--ok)' : 'transparent', color: task.done ? '#fff' : 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${task.done ? 'var(--ok)' : 'var(--line-strong)'}`, cursor: 'pointer' }}>
                    {task.done && <Icon name="check" size={12} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5, textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</div>
                    <div className="micro" style={{ marginTop: 2 }}>{task.sub}</div>
                  </div>
                  {!task.done && <Icon name="chevR" size={14} style={{ color: 'var(--ink-4)', marginTop: 4 }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Qualiopi */}
          <div className="card">
            <div className="card-hd">
              <div className="row" style={{ gap: 8 }}>
                <Icon name="shield" size={14} style={{ color: 'var(--accent)' }} />
                <h2>Qualiopi 2026</h2>
              </div>
              <button className="micro" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => router.push('/qualiopi')}>Voir l'audit →</button>
            </div>
            <div className="card-bd">
              <div className="row" style={{ alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>74%</span>
                <span className="muted" style={{ fontSize: 13 }}>de pièces collectées</span>
                <span className="badge b-warn" style={{ marginLeft: 'auto' }}>Audit dans 14 j</span>
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
                <div><div className="micro">Validés</div><div style={{ fontSize: 16, fontWeight: 600 }}>5 <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>/ 8</span></div></div>
                <div><div className="micro">En cours</div><div style={{ fontSize: 16, fontWeight: 600 }}>2</div></div>
                <div><div className="micro">À traiter</div><div style={{ fontSize: 16, fontWeight: 600, color: 'var(--err)' }}>1</div></div>
              </div>
            </div>
            <div className="card-ft">
              <span className="micro">Responsable: Thierry Bègue</span>
              <button className="btn sm" onClick={() => router.push('/qualiopi')}>Préparer l'export</button>
            </div>
          </div>

          {/* Expiring */}
          <div className="card">
            <div className="card-hd">
              <h2>Expirent bientôt</h2>
              {expiringDocs.length > 0 && <Badge kind="warn">{expiringDocs.length}</Badge>}
            </div>
            {expiringDocs.length === 0 ? (
              <div style={{ padding: '20px 18px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Aucun document en expiration</div>
            ) : expiringDocs.map((d, i) => {
              const expires = d.expires;
              return (
                <div key={d.id} onClick={() => router.push(`/documents/${d.id}`)}
                  style={{ padding: '10px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 0, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <FileIcon type={d.type} size={22} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{d.name}</div>
                    <div className="micro mono">expire le {expires}</div>
                  </div>
                  <Badge kind="warn">!</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
