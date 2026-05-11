'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon } from '@/components/ui/Atoms';
import { USERS, QUALIOPI } from '@/lib/data';

export default function QualiopiScreen() {
  const [selected, setSelected] = useState(11);
  const ind = QUALIOPI.find((q) => q.num === selected) || QUALIOPI[0];

  const statusMap = { ok: 'ok', warn: 'warn', err: 'err', review: 'warn' };
  const statusLabels = { ok: 'Validé', warn: 'À compléter', err: 'Bloqué', review: 'En relecture' };

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            <Badge kind="accent"><Icon name="shield" size={11} /> Audit programmé 29 mars 2026</Badge>
            <Badge kind="warn">14 jours restants</Badge>
          </div>
          <h1 style={{ marginBottom: 4 }}>Préparation audit Qualiopi 2026</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>32 indicateurs · 56 pièces collectées sur 76 · 5 indicateurs validés direction</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="sparkles" size={13} style={{ color: 'var(--accent)' }} /> Suggérer pièces manquantes</button>
          <button className="btn"><Icon name="download" size={13} /> Export PDF audit</button>
          <button className="btn primary"><Icon name="checkCircle" size={13} /> Marquer prêt pour audit</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Indicateurs', v: '32',  sub: 'total',             tone: '' },
          { label: 'Validés',     v: '21',  sub: '66 %',              tone: 'ok' },
          { label: 'En cours',    v: '8',   sub: 'à compléter',       tone: 'warn' },
          { label: 'Bloqués',     v: '3',   sub: 'pièces manquantes', tone: 'err' },
          { label: 'Échéance',    v: '14j', sub: '29 mars 2026',      tone: 'accent' },
        ].map((s, i) => (
          <motion.div className="kpi" key={i}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.tone === 'ok' ? 'var(--ok)' : s.tone === 'warn' ? 'var(--warn)' : s.tone === 'err' ? 'var(--err)' : s.tone === 'accent' ? 'var(--accent)' : 'var(--ink)' }}>{s.v}</div>
            <div className="delta">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-hd">
            <h2>Indicateurs (32)</h2>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn sm ghost">Tous · 32</button>
              <button className="btn sm ghost" style={{ color: 'var(--err)' }}>Bloqués · 3</button>
            </div>
          </div>
          <table className="t">
            <thead>
              <tr>
                <th style={{ width: 60 }}>N°</th>
                <th>Indicateur</th>
                <th style={{ width: 90 }}>Pièces</th>
                <th style={{ width: 110 }}>Statut</th>
                <th style={{ width: 80 }}>Resp.</th>
              </tr>
            </thead>
            <tbody>
              {QUALIOPI.map((q) => (
                <tr key={q.num} onClick={() => setSelected(q.num)}
                  style={{ background: selected === q.num ? 'var(--surface-2)' : 'transparent' }}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>#{q.num}</td>
                  <td className="col-name" style={{ fontSize: 13 }}>{q.label}</td>
                  <td>
                    <div className="row" style={{ gap: 6, fontSize: 12.5 }}>
                      <span className="mono">{q.docs}/{q.total}</span>
                      <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 2, minWidth: 40 }}>
                        <div style={{ width: `${(q.docs / q.total) * 100}%`, height: '100%', borderRadius: 2,
                          background: q.status === 'ok' ? 'var(--ok)' : q.status === 'err' ? 'var(--err)' : 'var(--warn)'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td><Badge kind={statusMap[q.status]} dot>{statusLabels[q.status]}</Badge></td>
                  <td><Avatar user={USERS[q.resp]} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-hd">
            <div>
              <div className="micro mono">INDICATEUR #{ind.num}</div>
              <h2 style={{ marginTop: 4 }}>{ind.label}</h2>
            </div>
            <Badge kind={ind.status === 'ok' ? 'ok' : ind.status === 'err' ? 'err' : 'warn'} dot>
              {statusLabels[ind.status]}
            </Badge>
          </div>

          <div className="card-bd" style={{ paddingTop: 0 }}>
            <div className="row" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <Avatar user={USERS[ind.resp]} size="md" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{USERS[ind.resp].name}</div>
                <div className="micro">Référent · mise à jour {ind.updated}</div>
              </div>
              <button className="btn sm"><Icon name="msg" size={12} /> Relancer</button>
            </div>

            <div style={{ marginTop: 14 }}>
              <h3 style={{ marginBottom: 10, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-3)' }}>
                Pièces requises ({ind.docs} / {ind.total})
              </h3>
              <div className="col" style={{ gap: 6 }}>
                {[
                  { name: "Livret d'accueil apprenant 2026",            ok: true,  type: 'pdf' },
                  { name: "Procédure d'évaluation des acquis",           ok: true,  type: 'doc' },
                  { name: 'Grille de positionnement',                   ok: true,  type: 'xls' },
                  { name: 'Compte-rendu des bilans intermédiaires',      ok: true,  type: 'pdf' },
                  { name: 'Synthèse statistique assiduité Q1',           ok: true,  type: 'xls' },
                  { name: 'Plan de remédiation apprenants en difficulté',ok: false, type: 'doc' },
                  { name: 'Échantillon évaluations sommatives',          ok: false, type: 'zip' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: p.ok ? 'transparent' : 'var(--warn-soft)', border: `1px solid ${p.ok ? 'var(--line)' : '#f0c98c'}`, borderRadius: 8, fontSize: 13 }}>
                    {p.ok ? <Icon name="checkCircle" size={15} style={{ color: 'var(--ok)' }} /> : <Icon name="warn" size={15} style={{ color: 'var(--warn)' }} />}
                    <FileIcon type={p.type} size={20} />
                    <span style={{ flex: 1 }}>{p.name}</span>
                    {!p.ok && <button className="btn sm primary"><Icon name="upload" size={12} /> Téléverser</button>}
                    {p.ok && <button className="btn ghost sm" style={{ padding: 4 }}><Icon name="eye" size={13} /></button>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18, padding: 14, background: 'linear-gradient(180deg, var(--accent-soft), transparent)', border: '1px solid var(--accent-soft)', borderRadius: 12 }}>
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <Icon name="sparkles" size={14} style={{ color: 'var(--accent)' }} />
                <strong style={{ fontSize: 13, color: 'var(--accent-ink)' }}>Suggestion de l'assistant</strong>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                Les pièces manquantes existent peut-être dans le dossier <strong>Pédagogie / Suivi 2025</strong>. Voulez-vous que je les recherche et les rattache automatiquement ?
              </div>
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <button className="btn sm primary">Lancer la recherche IA</button>
                <button className="btn sm ghost" style={{ color: 'var(--accent-ink)' }}>Ignorer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
