'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon, StatusBadge } from '@/components/ui/Atoms';
import { useDocs } from '@/lib/context/DocsContext';
import { useToast } from '@/lib/context/ToastContext';
import { USERS, QUALIOPI } from '@/lib/data';
import { useUser } from '@/lib/context/UserContext';

const STATUS_KIND   = { ok: 'ok', warn: 'warn', err: 'err', review: 'warn' };
const STATUS_LABELS = { ok: 'Validé', warn: 'À compléter', err: 'Bloqué', review: 'En relecture' };

const PIECES_MAP = {
  1:  [{ name: "Livret d'accueil apprenant 2026", ok: true, type: 'pdf' }, { name: "Affichage informations réglementaires", ok: true, type: 'pdf' }, { name: "Plaquette / site internet CFA", ok: false, type: 'doc' }],
  2:  [{ name: "Référentiel de formation TP SA", ok: true, type: 'pdf' }, { name: "Programme de formation détaillé", ok: true, type: 'doc' }, { name: "Fiche objectifs pédagogiques", ok: false, type: 'doc' }],
  4:  [{ name: "Inventaire matériel pédagogique", ok: true, type: 'xls' }, { name: "Plan salle de formation", ok: true, type: 'pdf' }, { name: "Conventions partenariat formateurs", ok: false, type: 'doc' }, { name: "CV formateurs à jour", ok: false, type: 'pdf' }],
  8:  [{ name: "CR réunion équipe pédagogique", ok: true, type: 'doc' }, { name: "Tableau de bord formation", ok: true, type: 'xls' }, { name: "Fiche coordination intervenants", ok: true, type: 'doc' }],
  11: [{ name: "Livret d'accueil apprenant 2026", ok: true, type: 'pdf' }, { name: "Procédure d'évaluation des acquis", ok: true, type: 'doc' }, { name: "Grille de positionnement", ok: true, type: 'xls' }, { name: "CR des bilans intermédiaires", ok: true, type: 'pdf' }, { name: "Synthèse statistique assiduité Q1", ok: true, type: 'xls' }, { name: "Plan de remédiation apprenants en difficulté", ok: false, type: 'doc' }, { name: "Échantillon évaluations sommatives", ok: false, type: 'zip' }],
  19: [{ name: "Veille législative 2025-2026", ok: true, type: 'doc' }, { name: "Mise à jour référentiel RNCP", ok: false, type: 'pdf' }, { name: "CR veille réglementaire", ok: false, type: 'doc' }],
  22: [{ name: "Questionnaire satisfaction apprenant", ok: true, type: 'pdf' }, { name: "Synthèse résultats satisfaction S2 2025", ok: true, type: 'xls' }, { name: "Plan d'amélioration suite enquête", ok: true, type: 'doc' }],
  32: [{ name: "Plan d'amélioration continue 2026", ok: true, type: 'doc' }, { name: "Bilan actions correctives 2025", ok: true, type: 'doc' }, { name: "Indicateurs de performance internes", ok: false, type: 'xls' }, { name: "CR revue de direction", ok: false, type: 'pdf' }],
};
const DEFAULT_PIECES = [{ name: "Document principal", ok: true, type: 'doc' }, { name: "Pièces justificatives", ok: false, type: 'pdf' }];

export default function QualiopiScreen() {
  const router = useRouter();
  const { docs, addDoc } = useDocs();
  const { showToast } = useToast();
  const { profile: me } = useUser();
  const [selected, setSelected] = useState(11);
  const [filterStatus, setFilterStatus] = useState('all');

  const ind    = QUALIOPI.find((q) => q.num === selected) || QUALIOPI[0];
  const pieces = PIECES_MAP[ind.num] || DEFAULT_PIECES;

  const filteredQ = QUALIOPI.filter((q) => filterStatus === 'all' || q.status === filterStatus);

  const relatedDocs = docs.filter((d) =>
    d.tags?.some((t) => ['qualiopi', `indicateur-${ind.num}`, 'émargement', 'attestation', 'bilan', 'contrat', 'convention'].includes(t)) ||
    d.folder?.toLowerCase().includes('qualiopi') || d.folder?.toLowerCase().includes('audit')
  ).slice(0, 4);

  const handleCreatePiece = (pieceName) => {
    const id = `d${Date.now()}`;
    addDoc({ id, name: pieceName + '.pdf', type: 'pdf', folder: 'Qualiopi / Audit 2026', size: '—', version: '1.0', status: 'draft', owner: me?.id || null, updatedBy: me?.id || null, updatedAt: "à l'instant", tags: ['qualiopi', `indicateur-${ind.num}`], confidential: 'Interne', expires: null });
    showToast({ type: 'success', message: `"${pieceName}" créé — indicateur ${ind.num}` });
    setTimeout(() => router.push(`/documents/${id}/edit`), 400);
  };

  const kpis = [
    { label: 'Indicateurs', v: '32', sub: 'total', tone: '' },
    { label: 'Validés',     v: QUALIOPI.filter(q => q.status === 'ok').length, sub: Math.round(QUALIOPI.filter(q => q.status === 'ok').length / QUALIOPI.length * 100) + '%', tone: 'ok' },
    { label: 'En cours',    v: QUALIOPI.filter(q => q.status === 'warn' || q.status === 'review').length, sub: 'à compléter', tone: 'warn' },
    { label: 'Bloqués',     v: QUALIOPI.filter(q => q.status === 'err').length, sub: 'pièces manquantes', tone: 'err' },
    { label: 'Échéance',    v: '14j', sub: '29 mars 2026', tone: 'accent' },
  ];

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            <Badge kind="accent"><Icon name="shield" size={11} /> Audit programmé 29 mars 2026</Badge>
            <Badge kind="warn">14 jours restants</Badge>
          </div>
          <h1 style={{ marginBottom: 4 }}>Préparation audit Qualiopi 2026</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>32 indicateurs · {docs.filter(d => d.tags?.includes('qualiopi')).length} pièces Qualiopi dans la GED</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => showToast({ type: 'info', message: 'Analyse IA en cours…' })}><Icon name="sparkles" size={13} style={{ color: 'var(--accent)' }} /> Suggérer pièces manquantes</button>
          <button className="btn" onClick={() => showToast({ type: 'info', message: 'Export PDF en préparation…' })}><Icon name="download" size={13} /> Export PDF audit</button>
          <button className="btn primary" onClick={() => showToast({ type: 'success', message: 'Dossier marqué prêt — notification envoyée à Thierry Bègue' })}><Icon name="checkCircle" size={13} /> Marquer prêt pour audit</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 22 }}>
        {kpis.map((s, i) => (
          <motion.div className="kpi" key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.tone === 'ok' ? 'var(--ok)' : s.tone === 'warn' ? 'var(--warn)' : s.tone === 'err' ? 'var(--err)' : s.tone === 'accent' ? 'var(--accent)' : 'var(--ink)' }}>{s.v}</div>
            <div className="delta">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-hd">
            <h2>Indicateurs ({QUALIOPI.length})</h2>
            <div className="row" style={{ gap: 4 }}>
              {[['all', 'Tous'], ['ok', 'Validés'], ['warn', 'En cours'], ['err', 'Bloqués']].map(([id, label]) => (
                <button key={id} className={`btn sm ${filterStatus === id ? '' : 'ghost'}`} onClick={() => setFilterStatus(id)}
                  style={{ fontSize: 11.5, color: id === 'err' && filterStatus !== id ? 'var(--err)' : undefined }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <table className="t">
            <thead>
              <tr>
                <th style={{ width: 60 }}>N°</th><th>Indicateur</th><th style={{ width: 90 }}>Pièces</th><th style={{ width: 110 }}>Statut</th><th style={{ width: 80 }}>Resp.</th>
              </tr>
            </thead>
            <tbody>
              {filteredQ.map((q) => (
                <tr key={q.num} onClick={() => setSelected(q.num)} style={{ background: selected === q.num ? 'var(--accent-soft)' : 'transparent', cursor: 'pointer' }}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>#{q.num}</td>
                  <td className="col-name" style={{ fontSize: 13 }}>{q.label}</td>
                  <td>
                    <div className="row" style={{ gap: 6, fontSize: 12.5 }}>
                      <span className="mono">{q.docs}/{q.total}</span>
                      <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 2, minWidth: 40 }}>
                        <div style={{ width: `${(q.docs / q.total) * 100}%`, height: '100%', borderRadius: 2, background: q.status === 'ok' ? 'var(--ok)' : q.status === 'err' ? 'var(--err)' : 'var(--warn)' }} />
                      </div>
                    </div>
                  </td>
                  <td><Badge kind={STATUS_KIND[q.status]} dot>{STATUS_LABELS[q.status]}</Badge></td>
                  <td><Avatar user={USERS[q.resp]} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        <div className="card" style={{ overflowY: 'auto', maxHeight: 700 }}>
          <div className="card-hd">
            <div><div className="micro mono">INDICATEUR #{ind.num}</div><h2 style={{ marginTop: 4 }}>{ind.label}</h2></div>
            <Badge kind={STATUS_KIND[ind.status]} dot>{STATUS_LABELS[ind.status]}</Badge>
          </div>

          <div className="card-bd" style={{ paddingTop: 0 }}>
            <div className="row" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--line)', marginBottom: 14 }}>
              <Avatar user={USERS[ind.resp] || { name: ind.resp || '?' }} size="md" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{USERS[ind.resp]?.name || ind.resp || '—'}</div>
                <div className="micro">Référent · {ind.updated}</div>
              </div>
              <button className="btn sm" onClick={() => showToast({ type: 'info', message: `Notification envoyée à ${USERS[ind.resp]?.name || ind.resp || 'ce référent'}` })}><Icon name="msg" size={12} /> Relancer</button>
            </div>

            {/* Pieces */}
            <h3 style={{ marginBottom: 8, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-3)' }}>
              Pièces requises ({pieces.filter(p => p.ok).length}/{pieces.length})
            </h3>
            <div className="col" style={{ gap: 5, marginBottom: 16 }}>
              {pieces.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: p.ok ? 'transparent' : 'var(--warn-soft)', border: `1px solid ${p.ok ? 'var(--line)' : '#f0c98c'}`, borderRadius: 8, fontSize: 13 }}>
                  <Icon name={p.ok ? 'checkCircle' : 'warn'} size={15} style={{ color: p.ok ? 'var(--ok)' : 'var(--warn)', flexShrink: 0 }} />
                  <FileIcon type={p.type} size={18} />
                  <span style={{ flex: 1 }}>{p.name}</span>
                  {p.ok
                    ? <button className="btn ghost sm" style={{ padding: 4 }} onClick={() => router.push('/documents')}><Icon name="eye" size={13} /></button>
                    : <button className="btn sm primary" onClick={() => handleCreatePiece(p.name)}><Icon name="plus" size={11} /> Créer</button>}
                </div>
              ))}
            </div>

            {/* Related docs */}
            {relatedDocs.length > 0 && (
              <>
                <h3 style={{ marginBottom: 8, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-3)' }}>
                  Docs associés dans la GED ({relatedDocs.length})
                </h3>
                <div className="col" style={{ gap: 5, marginBottom: 16 }}>
                  {relatedDocs.map((d) => (
                    <div key={d.id} onClick={() => router.push(`/documents/${d.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <FileIcon type={d.type} size={18} />
                      <span style={{ flex: 1, fontSize: 12.5 }} className="truncate">{d.name}</span>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* AI suggestion */}
            <div style={{ padding: 14, background: 'linear-gradient(180deg,var(--accent-soft),transparent)', border: '1px solid var(--accent-soft)', borderRadius: 12 }}>
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <Icon name="sparkles" size={14} style={{ color: 'var(--accent)' }} />
                <strong style={{ fontSize: 13 }}>Suggestion de l'assistant</strong>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                {pieces.filter(p => !p.ok).length > 0
                  ? `${pieces.filter(p => !p.ok).length} pièce(s) manquante(s). Des documents similaires existent peut-être dans la GED — souhaitez-vous que je les recherche ?`
                  : 'Toutes les pièces sont collectées pour cet indicateur. Excellent travail !'}
              </div>
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <button className="btn sm primary" onClick={() => showToast({ type: 'info', message: 'Recherche IA lancée…' })}>Lancer la recherche IA</button>
                <button className="btn sm ghost">Ignorer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
