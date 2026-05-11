import React, { useState } from 'react';
import Icon from '../icons.jsx';
import { Avatar, Badge } from '../atoms.jsx';
import { USERS, VERSIONS } from '../data.js';

const VersionsScreen = ({ onNavigate, onOpenDoc }) => {
  const [selected, setSelected] = useState('2.2');
  const compareTo = '2.3';

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <button onClick={() => onOpenDoc('d1')} className="btn ghost sm" style={{ marginBottom: 12, color: 'var(--ink-3)' }}>
        <Icon name="chevL" size={12} /> Convention TP Secrétaire Assistant 2026
      </button>

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 22, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Historique des versions</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>6 versions sur 35 jours · 142 Ko en moyenne · auteurs : 4</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="download" size={13} /> Export ZIP toutes versions</button>
          <button className="btn primary"><Icon name="upload" size={13} /> Téléverser nouvelle version</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>
        <div className="card" style={{ padding: '6px 0' }}>
          {VERSIONS.map((v, i) => {
            const u = USERS[v.author];
            const sel = v.v === selected;
            return (
              <div key={v.v}
                onClick={() => setSelected(v.v)}
                style={{
                  display: 'flex', gap: 10, padding: '12px 16px',
                  cursor: 'pointer',
                  background: sel ? 'var(--accent-soft)' : 'transparent',
                  borderLeft: sel ? '3px solid var(--accent)' : '3px solid transparent',
                  position: 'relative',
                }}>
                <div style={{ position: 'relative', width: 14, paddingTop: 4 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 999,
                    background: v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : '#fff',
                    border: `2px solid ${v.current ? 'var(--accent)' : v.milestone ? 'var(--violet)' : 'var(--line-strong)'}`,
                  }} />
                  {i < VERSIONS.length - 1 && <div style={{ position: 'absolute', left: 4, top: 14, bottom: -14, width: 1, background: 'var(--line)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>v{v.v}</span>
                    {v.current && <Badge kind="accent" dot>actuelle</Badge>}
                    {v.milestone && <Badge kind="violet">jalon</Badge>}
                  </div>
                  <div className="micro mono" style={{ marginTop: 3 }}>{v.date}</div>
                  <div className="row" style={{ gap: 5, marginTop: 6 }}>
                    <Avatar user={u} size="xs" />
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{u.name.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-hd">
            <div className="row" style={{ gap: 10 }}>
              <h2>Comparer <span className="mono" style={{ color: 'var(--ink-3)', fontWeight: 400 }}>v{selected}</span> → <span className="mono" style={{ color: 'var(--accent)' }}>v{compareTo}</span></h2>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="badge b-ok"><span className="dot" style={{ background: 'var(--ok)' }} /> +12 lignes</span>
              <span className="badge b-err"><span className="dot" style={{ background: 'var(--err)' }} /> −4 lignes</span>
              <button className="btn sm"><Icon name="refresh" size={12} /> Restaurer v{selected}</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 540 }}>
            <DiffPane label={`v${selected} · 12 mars 09:14`} side="old" />
            <div style={{ borderLeft: '1px solid var(--line)' }} />
            <DiffPane label={`v${compareTo} · aujourd'hui 14:32`} side="new" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DiffPane = ({ label, side }) => {
  const lines = side === 'old' ? [
    { t: '',   text: 'CONVENTION DE FORMATION PROFESSIONNELLE' },
    { t: '',   text: "N° d'enregistrement : 974-26-00471" },
    { t: '',   text: '' },
    { t: '',   text: 'Article 1 — Objet de la convention' },
    { t: 'rm', text: 'La présente convention a pour objet la formation' },
    { t: 'rm', text: 'du Bénéficiaire dans le cadre du TP SA niveau 4.' },
    { t: '',   text: '' },
    { t: '',   text: 'Article 2 — Nature et durée' },
    { t: 'rm', text: 'Durée : 720 heures, du 15/01/2026 au 30/06/2026' },
    { t: 'rm', text: 'Lieu : Saint-Denis, site principal du CFA.' },
    { t: '',   text: '' },
    { t: '',   text: 'Article 3 — Modalités financières' },
    { t: '',   text: 'Coût horaire pédagogique : 11,80 €' },
    { t: '',   text: 'Prise en charge : OPCO Akto' },
  ] : [
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
    { t: 'add', text: 'Lieu : Saint-Denis, site principal du CFA.' },
    { t: '',    text: '' },
    { t: '',    text: 'Article 3 — Modalités financières' },
    { t: '',    text: 'Coût horaire pédagogique : 11,80 €' },
    { t: 'add', text: 'Prise en charge : OPCO Akto (barème février 2026)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="micro" style={{ padding: '8px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)', fontWeight: 500 }}>{label}</div>
      <div className="mono" style={{ padding: '12px 0', fontSize: 12.5, lineHeight: 1.7, flex: 1 }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            padding: '0 14px',
            background: l.t === 'add' ? 'rgba(21,128,61,.08)' : l.t === 'rm' ? 'rgba(185,28,28,.07)' : 'transparent',
            color: l.t === 'add' ? '#0f6b34' : l.t === 'rm' ? '#8e2222' : 'var(--ink-2)',
            borderLeft: l.t ? '2px solid' : '2px solid transparent',
            borderLeftColor: l.t === 'add' ? 'var(--ok)' : l.t === 'rm' ? 'var(--err)' : 'transparent',
            display: 'flex', gap: 12,
          }}>
            <span style={{ width: 18, color: 'var(--ink-4)', textAlign: 'right' }}>{i + 1}</span>
            <span>{l.t === 'add' ? '+ ' : l.t === 'rm' ? '− ' : '  '}{l.text || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionsScreen;
