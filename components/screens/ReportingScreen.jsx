'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge } from '@/components/ui/Atoms';
import { useDocs } from '@/lib/context/DocsContext';
import { useToast } from '@/lib/context/ToastContext';
import { USERS, ACTIVITY, QUALIOPI } from '@/lib/data';

/* ─── Tiny bar-chart component ─── */
function BarChart({ data, height = 120, color = 'var(--accent)' }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingBottom: 20 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.v / max) * (height - 20)}px` }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
            style={{ width: '100%', background: d.highlight ? color : `${color}55`, borderRadius: '4px 4px 0 0', minHeight: d.v > 0 ? 3 : 0 }}
            title={`${d.label}: ${d.v}`}
          />
          <span style={{ fontSize: 10, color: 'var(--ink-4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut-like ring stat ─── */
function RingStat({ pct, color, label, sub }) {
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <svg width={84} height={84} viewBox="0 0 84 84">
        <circle cx={42} cy={42} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={8} />
        <motion.circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: 'easeOut' }}
          strokeLinecap="round" transform="rotate(-90 42 42)" />
        <text x={42} y={46} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)">{pct}%</text>
      </svg>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{label}</div>
        <div className="micro">{sub}</div>
      </div>
    </div>
  );
}

/* ─── Horizontal bar ─── */
function HBar({ label, v, max, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12.5 }}>{label}</span>
        <span className="mono" style={{ fontSize: 12 }}>{v}</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${(v / max) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 999, background: color || 'var(--accent)' }} />
      </div>
    </div>
  );
}

/* ─── Export helper ─── */
function exportReport(docs, label) {
  const lines = [
    `Rapport Mar'my GED — ${label}`,
    `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
    '',
    'Documents',
    `Total,${docs.length}`,
    `Validés,${docs.filter(d => d.status === 'validated').length}`,
    `En validation,${docs.filter(d => d.status === 'review').length}`,
    `Brouillons,${docs.filter(d => d.status === 'draft').length}`,
    `Expirés / bientôt,${docs.filter(d => d.status === 'expiring').length}`,
  ].join('\n');
  const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `rapport-ged-${Date.now()}.csv`; a.click();
}

export default function ReportingScreen() {
  const router = useRouter();
  const { docs } = useDocs();
  const { showToast } = useToast();
  const [period, setPeriod] = useState('month');

  /* ─── derived stats ─── */
  const byStatus = useMemo(() => ({
    validated: docs.filter(d => d.status === 'validated').length,
    review:    docs.filter(d => d.status === 'review').length,
    draft:     docs.filter(d => d.status === 'draft').length,
    pending:   docs.filter(d => d.status === 'pending').length,
    expiring:  docs.filter(d => d.status === 'expiring').length,
  }), [docs]);

  const byType = useMemo(() => {
    const m = {};
    docs.forEach(d => { m[d.type] = (m[d.type] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [docs]);

  const byFolder = useMemo(() => {
    const m = {};
    docs.forEach(d => {
      const top = d.folder.split(' / ')[0];
      m[top] = (m[top] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [docs]);

  const byUser = useMemo(() => {
    const m = {};
    docs.forEach(d => { if (d.updatedBy) m[d.updatedBy] = (m[d.updatedBy] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [docs]);

  const activityData = [
    { label: 'Lun', v: 12, highlight: false },
    { label: 'Mar', v: 8,  highlight: false },
    { label: 'Mer', v: 22, highlight: false },
    { label: 'Jeu', v: 17, highlight: false },
    { label: 'Ven', v: 31, highlight: false },
    { label: 'Sam', v: 5,  highlight: false },
    { label: 'Auj', v: 14, highlight: true  },
  ];

  const qualiopiOk = QUALIOPI.filter(q => q.status === 'ok').length;
  const qualiopiPct = Math.round(qualiopiOk / QUALIOPI.length * 100);

  const kpis = [
    { label: 'Documents total',  v: docs.length,             sub: '+3 ce mois',          tone: '',       icon: 'file' },
    { label: 'Taux validation',  v: Math.round(byStatus.validated / docs.length * 100) + '%', sub: `${byStatus.validated} validés`, tone: 'ok', icon: 'checkCircle' },
    { label: 'En attente',       v: byStatus.review + byStatus.pending, sub: 'à traiter', tone: 'warn',   icon: 'clock' },
    { label: 'Qualiopi',         v: qualiopiPct + '%',        sub: `${qualiopiOk}/${QUALIOPI.length} indicateurs`, tone: 'accent', icon: 'shield' },
    { label: 'Stockage utilisé', v: '4,2 Go',                sub: '/ 50 Go (8 %)',       tone: '',       icon: 'layers' },
  ];

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Reporting & statistiques</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>Tableau de bord analytique · CFA Horizon Réunion</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 0, border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
            {[['week', 'Semaine'], ['month', 'Mois'], ['quarter', 'Trimestre'], ['year', 'Année']].map(([id, label]) => (
              <button key={id} onClick={() => setPeriod(id)}
                style={{ padding: '6px 12px', fontSize: 12.5, border: 0, cursor: 'pointer', background: period === id ? 'var(--accent)' : 'var(--surface)', color: period === id ? '#fff' : 'var(--ink-2)', transition: 'all .15s' }}>
                {label}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => exportReport(docs, period)}>
            <Icon name="download" size={13} /> Export CSV
          </button>
          <button className="btn" onClick={() => showToast({ type: 'info', message: 'Export PDF en préparation…' })}>
            <Icon name="download" size={13} /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 22 }}>
        {kpis.map((s, i) => (
          <motion.div className="kpi" key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="label">
              <span>{s.label}</span>
              <Icon name={s.icon} size={13} style={{ color: 'var(--ink-4)' }} />
            </div>
            <div className="value" style={{ color: s.tone === 'ok' ? 'var(--ok)' : s.tone === 'warn' ? 'var(--warn)' : s.tone === 'accent' ? 'var(--accent)' : 'var(--ink)' }}>
              {s.v}
            </div>
            <div className="delta">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Activity chart */}
        <div className="card">
          <div className="card-hd">
            <h2>Activité — 7 derniers jours</h2>
            <Badge kind="ok" dot>Temps réel</Badge>
          </div>
          <div style={{ padding: '8px 22px 0' }}>
            <BarChart data={activityData} height={140} />
          </div>
          <div style={{ padding: '0 22px 14px', display: 'flex', gap: 20 }}>
            {[
              { label: 'Actions totales', v: '109', color: 'var(--ink)' },
              { label: 'Téléversements',  v: '23',  color: 'var(--accent)' },
              { label: 'Validations',     v: '11',  color: 'var(--ok)' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.v}</div>
                <div className="micro">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents by status donut */}
        <div className="card">
          <div className="card-hd"><h2>Répartition par statut</h2></div>
          <div style={{ padding: '8px 22px' }}>
            <RingStat pct={Math.round(byStatus.validated / docs.length * 100)} color="var(--ok)"   label="Validés"       sub={`${byStatus.validated} documents`} />
            <RingStat pct={Math.round((byStatus.review + byStatus.pending) / docs.length * 100)} color="var(--warn)"  label="En validation" sub={`${byStatus.review + byStatus.pending} documents`} />
            <RingStat pct={Math.round(byStatus.draft / docs.length * 100)}     color="var(--ink-3)" label="Brouillons"    sub={`${byStatus.draft} documents`} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* By folder */}
        <div className="card">
          <div className="card-hd"><h2>Par dossier</h2></div>
          <div style={{ padding: '14px 22px' }}>
            {byFolder.map(([folder, count], i) => (
              <HBar key={i} label={folder} v={count} max={byFolder[0][1]} color={['var(--accent)','var(--ok)','var(--violet)','var(--warn)','var(--err)','var(--ink-3)'][i % 6]} />
            ))}
          </div>
        </div>

        {/* By type */}
        <div className="card">
          <div className="card-hd"><h2>Par type de fichier</h2></div>
          <div style={{ padding: '14px 22px' }}>
            {byType.map(([type, count], i) => (
              <HBar key={i} label={{ pdf: 'PDF', doc: 'Word / DOCX', xls: 'Tableur Excel', img: 'Image', zip: 'Archive ZIP' }[type] || type.toUpperCase()}
                v={count} max={byType[0][1]} color={['#ef4444','#2563eb','#16a34a','#f59e0b','#8b5cf6'][i % 5]} />
            ))}
          </div>
        </div>

        {/* By user */}
        <div className="card">
          <div className="card-hd"><h2>Activité par utilisateur</h2></div>
          <div style={{ padding: '8px 22px' }}>
            {byUser.map(([uid, count], i) => {
              const u = USERS[uid];
              if (!u) return null;
              return (
                <div key={uid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < byUser.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                    {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{u.name.split(' ')[0]}</div>
                    <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 999, marginTop: 4, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(count / byUser[0][1]) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        style={{ height: '100%', borderRadius: 999, background: u.color }} />
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Qualiopi progress */}
      <div className="card">
        <div className="card-hd">
          <div className="row" style={{ gap: 10 }}>
            <Icon name="shield" size={15} style={{ color: 'var(--accent)' }} />
            <h2>Progression Qualiopi 2026</h2>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Badge kind="warn" dot>Audit dans 14 jours</Badge>
            <button className="btn sm" onClick={() => router.push('/qualiopi')}>
              <Icon name="chevR" size={12} /> Détails
            </button>
          </div>
        </div>
        <div style={{ padding: '14px 22px' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13.5 }}>{qualiopiOk} indicateurs validés sur {QUALIOPI.length}</span>
            <span style={{ fontWeight: 700, color: qualiopiPct >= 80 ? 'var(--ok)' : 'var(--warn)', fontSize: 16 }}>{qualiopiPct}%</span>
          </div>
          <div style={{ height: 12, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${qualiopiPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 999, background: qualiopiPct >= 80 ? 'var(--ok)' : 'var(--warn)' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {QUALIOPI.map(q => (
              <div key={q.num} onClick={() => router.push('/qualiopi')}
                style={{ width: 28, height: 28, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                  background: q.status === 'ok' ? 'var(--ok-soft)' : q.status === 'err' ? 'var(--err-soft, #fee2e2)' : 'var(--warn-soft)',
                  color: q.status === 'ok' ? 'var(--ok)' : q.status === 'err' ? 'var(--err)' : 'var(--warn)',
                  border: `1.5px solid ${q.status === 'ok' ? '#9fd3b5' : q.status === 'err' ? '#fca5a5' : '#f0c98c'}` }}
                title={`#${q.num} — ${q.label}`}>
                {q.num}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
