'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, FileIcon } from '@/components/ui/Atoms';
import { ME } from '@/lib/data';

export default function AiPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Bonjour Anne — je peux retrouver des documents, résumer des contrats, préparer un audit Qualiopi ou comparer deux versions. Que puis-je faire pour vous ?" },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);

  const suggestions = [
    "Quels documents manquent pour la session TP SA 2026 ?",
    "Résume la dernière version de la convention OPCO Akto",
    "Compare v2.2 et v2.3 de la convention TP SA",
    "Génère la checklist Qualiopi pour l'indicateur 11",
  ];

  const sendPrompt = (text) => {
    setMessages(m => [...m, { role: 'user', text }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const ai = canned(text);
      setMessages(m => [...m, { role: 'ai', text: ai.text, attachments: ai.attachments }]);
    }, 900);
  };

  return (
    <>
      <motion.div
        className="drawer-bg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="drawer"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkles" size={15} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Assistant Mar'my</div>
            <div className="micro">Modèle GED · réponses sourcées</div>
          </div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => <Message key={i} m={m} />)}
          {typing && (
            <div className="row" style={{ gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="sparkles" size={12} />
              </div>
              <div className="row" style={{ gap: 4, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 12 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--ink-3)', animation: `bounce 1.2s ${i * 0.15}s infinite` }} />
                ))}
                <style>{`@keyframes bounce { 0%,80%,100% { transform: scale(0.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }`}</style>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 12px' }}>
            <div className="micro" style={{ marginBottom: 8 }}>Suggestions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggestions.map((s, i) => (
                <button key={i} className="btn sm" style={{ justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal', lineHeight: 1.3 }}
                  onClick={() => sendPrompt(s)}>
                  <Icon name="sparkles" size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: 16, borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>
          <form onSubmit={(e) => { e.preventDefault(); if (draft.trim()) sendPrompt(draft); }}>
            <div style={{ display: 'flex', gap: 8, background: '#fff', border: '1px solid var(--line-strong)', borderRadius: 10, padding: 6 }}>
              <input value={draft} onChange={e => setDraft(e.target.value)}
                placeholder="Demandez quelque chose…"
                style={{ flex: 1, border: 0, outline: 0, padding: '8px 6px', fontSize: 13.5, background: 'transparent', fontFamily: 'inherit' }} />
              <button type="submit" className="btn primary sm" disabled={!draft.trim()}>
                <Icon name="send" size={12} />
              </button>
            </div>
          </form>
          <div className="micro" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Réponses générées · vérifiez toujours les sources</span>
            <span className="mono">Haiku 4.5</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}

const Message = ({ m }) => {
  if (m.role === 'user') return (
    <div className="row" style={{ gap: 10, alignSelf: 'flex-end', maxWidth: '88%', marginLeft: 'auto' }}>
      <div style={{ padding: '8px 12px', background: 'var(--accent)', color: '#fff', borderRadius: 12, borderTopRightRadius: 4, fontSize: 13.5, lineHeight: 1.5 }}>
        {m.text}
      </div>
      <Avatar user={ME} size="md" />
    </div>
  );
  return (
    <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 24, height: 24, borderRadius: 999, background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Icon name="sparkles" size={12} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 12, borderTopLeftRadius: 4, fontSize: 13.5, lineHeight: 1.55 }}>
          {m.text.split('\n').map((p, i) => <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0' }}>{p}</p>)}
        </div>
        {m.attachments && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {m.attachments.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#fff', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12.5, cursor: 'pointer' }}>
                <FileIcon type={a.type} size={20} />
                <span style={{ flex: 1, minWidth: 0 }} className="truncate">{a.name}</span>
                <span className="micro mono">v{a.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function canned(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('manqu') && (p.includes('session') || p.includes('tp sa') || p.includes('apprenants'))) {
    return {
      text: "J'ai analysé le dossier session « TP Secrétaire Assistant 2026 » : 23 documents présents, 4 manquants par rapport au modèle Qualiopi standard.\n\nManquants : émargements semaine 8, attestation présence intervenant externe Marie Técher, bilan intermédiaire mi-parcours, fiche position apprenant pour Jean Payet.",
      attachments: [
        { name: 'Modèle émargement hebdo.docx', type: 'doc', v: '1.2' },
        { name: 'Modèle attestation intervenant.pdf', type: 'pdf', v: '2.0' },
      ],
    };
  }
  if (p.includes('résume') || p.includes('résumé')) {
    return {
      text: "Synthèse de la convention OPCO Akto v3.0 :\n\n• Apprenant : Jean Payet, contrat de professionnalisation 12 mois\n• Coût horaire pédagogique : 11,80 € (barème février 2026)\n• Volume : 805 heures, du 12/01/2026 au 28/08/2026\n• Prise en charge : 9 499 € par OPCO Akto, dossier validé le 03/03/2026\n• Clauses spécifiques : prise en charge frais annexes plafonnée à 350 €",
    };
  }
  if (p.includes('compare') || p.includes('v2')) {
    return {
      text: "Différences clés entre v2.2 et v2.3 :\n\n• Article 1 : reformulation pour préciser le niveau RNCP (n°36804)\n• Article 2 : durée passée de 720h à 805h, période étendue jusqu'au 28/08\n• Article 3 : ajout de la mention du barème OPCO Akto de février 2026\n\nAucun changement sur les articles 4 à 12. Suggérer une notification à Mélanie Grondin pour la mise à jour pédagogique.",
    };
  }
  if (p.includes('checklist') || p.includes('qualiopi') || p.includes('11')) {
    return {
      text: "Checklist indicateur 11 — Suivi des apprenants :\n\n✓ Livret d'accueil 2026 (validé)\n✓ Procédure d'évaluation\n✓ Grille de positionnement\n✓ Bilans intermédiaires\n✓ Échantillon livrets pédagogiques\n✓ Attestation présence formateurs\n✓ Synthèse statistique d'assiduité Q1\n⚠ Plan de remédiation apprenants en difficulté (manquant)\n⚠ Échantillon évaluations sommatives (manquant)\n\nDeux pièces à fournir. Voulez-vous que je rédige un modèle de plan de remédiation à partir des cas existants ?",
    };
  }
  return { text: "Je peux explorer la GED, comparer des versions, vérifier la complétude d'un dossier ou préparer un export Qualiopi. Précisez la session ou le document concerné et je vous montre les sources." };
}
