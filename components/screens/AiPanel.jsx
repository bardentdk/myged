'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, FileIcon } from '@/components/ui/Atoms';
import { ME } from '@/lib/data';
import { useDocs } from '@/lib/context/DocsContext';

const SUGGESTIONS = [
  "Quels documents manquent pour la session TP SA 2026 ?",
  "Résume la convention OPCO Akto",
  "Quels documents expirent bientôt ?",
  "Checklist Qualiopi indicateur 11",
];

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f3f4f6;padding:1px 4px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>');
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
      <div style={{ width: 26, height: 26, borderRadius: 8, background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Icon name="sparkles" size={13} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 12, borderTopLeftRadius: 4, fontSize: 13.5, lineHeight: 1.6 }}>
          {m.text.split('\n').map((p, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0' }}
               dangerouslySetInnerHTML={{ __html: parseMarkdown(p) }} />
          ))}
        </div>
        {m.attachments?.length > 0 && (
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
        {m.error && <div style={{ fontSize: 12, color: 'var(--err)', marginTop: 6 }}>⚠ Réponse de secours — vérifiez la configuration API</div>}
      </div>
    </div>
  );
};

export default function AiPanel({ onClose }) {
  const { docs } = useDocs();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Bonjour " + ME.name.split(' ')[0] + " — je peux retrouver des documents, résumer des contrats, préparer un audit Qualiopi ou comparer des versions. Que puis-je faire pour vous ?" },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendPrompt = async (text) => {
    const userMsg = { role: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);
    setDraft('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          docs: docs.map((d) => ({ id: d.id, name: d.name, type: d.type, folder: d.folder, status: d.status, version: d.version, tags: d.tags, expires: d.expires })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'ai', text: data.content }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: "Je rencontre un problème de connexion. Vérifiez votre réseau ou la configuration API.", error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div className="drawer-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkles" size={15} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Assistant Mar'my</div>
            <div className="micro">{docs.length} documents accessibles · Haiku 4.5</div>
          </div>
          <button className="btn ghost sm" onClick={() => { setMessages([{ role: 'ai', text: "Conversation réinitialisée. Comment puis-je vous aider ?" }]); }} title="Nouvelle conversation">
            <Icon name="refresh" size={13} />
          </button>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => <Message key={i} m={m} />)}

          {loading && (
            <div className="row" style={{ gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="sparkles" size={13} />
              </div>
              <div className="row" style={{ gap: 4, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 12 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--ink-3)', display: 'inline-block', animation: `bounce 1.2s ${i * 0.15}s infinite` }} />
                ))}
                <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }`}</style>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
            <div className="micro" style={{ marginBottom: 8, color: 'var(--ink-3)' }}>Suggestions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="btn sm" style={{ justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal', lineHeight: 1.3 }} onClick={() => sendPrompt(s)}>
                  <Icon name="sparkles" size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)', flexShrink: 0 }}>
          <form onSubmit={(e) => { e.preventDefault(); if (draft.trim() && !loading) sendPrompt(draft); }}>
            <div style={{ display: 'flex', gap: 8, background: '#fff', border: '1.5px solid var(--line-strong)', borderRadius: 10, padding: 6 }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={loading}
                placeholder="Demandez quelque chose…"
                style={{ flex: 1, border: 0, outline: 0, padding: '8px 6px', fontSize: 13.5, background: 'transparent', fontFamily: 'inherit' }} />
              <button type="submit" className="btn primary sm" disabled={!draft.trim() || loading} style={{ borderRadius: 7 }}>
                <Icon name="send" size={12} />
              </button>
            </div>
          </form>
          <div className="micro" style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', color: 'var(--ink-4)' }}>
            <span>Vérifiez toujours les informations importantes</span>
            <span className="mono">claude-haiku-4-5</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
