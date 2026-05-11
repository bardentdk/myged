'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge, FileIcon } from '@/components/ui/Atoms';
import { useDocs } from '@/lib/context/DocsContext';
import { useToast } from '@/lib/context/ToastContext';
import { USERS, DOCS as INITIAL_DOCS } from '@/lib/data';

const TYPE_COLORS = {
  'Version publiée':   'var(--accent)',
  'Version restaurée': 'var(--violet)',
  'Document créé':     'var(--ok)',
  'Document modifié':  'var(--ink-3)',
};

const TYPE_ICONS = {
  'Version publiée':   'upload',
  'Version restaurée': 'history',
  'Document créé':     'plus',
  'Document modifié':  'edit',
};

function downloadVersionsReport(entries) {
  const lines = [
    'Version,Document,Auteur,Date,Note,Taille',
    ...entries.map(e => `"${e.v}","${e.docName}","${USERS[e.author]?.name || e.author}","${e.date}","${e.note}","${e.size || '—'}"`)
  ].join('\n');
  const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'historique-versions.csv';
  a.click();
}

export default function GlobalHistoryScreen() {
  const router = useRouter();
  const { docs, versions } = useDocs();
  const { showToast } = useToast();
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const allEntries = useMemo(() => {
    const entries = [];
    Object.entries(versions).forEach(([docId, vlist]) => {
      const doc = docs.find(d => d.id === docId) || INITIAL_DOCS.find(d => d.id === docId);
      if (!doc) return;
      vlist.forEach(v => {
        entries.push({ ...v, docId, docName: doc.name, docType: doc.type });
      });
    });
    return entries.sort((a, b) => {
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      return a.v > b.v ? -1 : 1;
    });
  }, [versions, docs]);

  const authors = useMemo(() => {
    const ids = [...new Set(allEntries.map(e => e.author))];
    return ids.filter(id => USERS[id]);
  }, [allEntries]);

  const filtered = allEntries.filter(e => {
    if (filterAuthor !== 'all' && e.author !== filterAuthor) return false;
    if (filterType !== 'all') {
      if (filterType === 'milestone' && !e.milestone) return false;
      if (filterType === 'current' && !e.current) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!e.docName.toLowerCase().includes(q) && !e.note.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const key = e.date?.split(' · ')[0] || 'Date inconnue';
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups);
  }, [filtered]);

  const stats = {
    total:     allEntries.length,
    milestones:allEntries.filter(e => e.milestone).length,
    authors:   new Set(allEntries.map(e => e.author)).size,
    docs:      new Set(allEntries.map(e => e.docId)).size,
  };

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Versions & historique</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {stats.total} version{stats.total > 1 ? 's' : ''} · {stats.docs} document{stats.docs > 1 ? 's' : ''} · {stats.authors} auteur{stats.authors > 1 ? 's' : ''}
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => downloadVersionsReport(allEntries)}>
            <Icon name="download" size={13} /> Export CSV
          </button>
          <button className="btn primary" onClick={() => router.push('/documents')}>
            <Icon name="upload" size={13} /> Nouvelle version
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Versions total',  v: stats.total,      sub: 'tous documents',    tone: '' },
          { label: 'Jalons',          v: stats.milestones, sub: 'versions majeures', tone: 'violet' },
          { label: 'Documents versionnés', v: stats.docs,  sub: 'avec historique',   tone: 'accent' },
          { label: 'Contributeurs',   v: stats.authors,    sub: 'auteurs différents', tone: 'ok' },
        ].map((s, i) => (
          <motion.div className="kpi" key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.tone === 'violet' ? 'var(--violet)' : s.tone === 'accent' ? 'var(--accent)' : s.tone === 'ok' ? 'var(--ok)' : 'var(--ink)' }}>{s.v}</div>
            <div className="delta">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
        {/* Timeline */}
        <div>
          {/* Filters */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, height: 34 }}>
              <Icon name="search" size={13} style={{ color: 'var(--ink-3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher document, note…"
                style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <select className="input" style={{ width: 'auto', height: 34, fontSize: 13, padding: '0 10px' }}
              value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)}>
              <option value="all">Tous les auteurs</option>
              {authors.map(id => <option key={id} value={id}>{USERS[id]?.name}</option>)}
            </select>
            <select className="input" style={{ width: 'auto', height: 34, fontSize: 13, padding: '0 10px' }}
              value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Toutes les versions</option>
              <option value="milestone">Jalons uniquement</option>
              <option value="current">Versions actuelles</option>
            </select>
          </div>

          {grouped.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
              Aucune version ne correspond aux filtres
            </div>
          ) : (
            <div className="col" style={{ gap: 18 }}>
              {grouped.map(([date, entries], gi) => (
                <div key={gi}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-3)', marginBottom: 8, paddingLeft: 4 }}>
                    {date}
                  </div>
                  <div className="card" style={{ overflow: 'hidden' }}>
                    {entries.map((e, i) => {
                      const u = USERS[e.author];
                      return (
                        <motion.div key={`${e.docId}-${e.v}`}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          onClick={() => router.push(`/documents/${e.docId}/versions`)}
                          style={{
                            display: 'flex', gap: 14, padding: '14px 18px', cursor: 'pointer',
                            borderBottom: i < entries.length - 1 ? '1px solid var(--line)' : 0,
                            borderLeft: e.current ? '3px solid var(--accent)' : e.milestone ? '3px solid var(--violet)' : '3px solid transparent',
                          }}
                          onMouseEnter={ev => ev.currentTarget.style.background = 'var(--accent-soft)'}
                          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileIcon type={e.docType} size={18} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="row" style={{ gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 500, fontSize: 13.5 }} className="truncate">{e.docName}</span>
                              <span className="badge mono" style={{ fontSize: 11, padding: '1px 6px' }}>v{e.v}</span>
                              {e.current   && <Badge kind="accent" dot>actuelle</Badge>}
                              {e.milestone && <Badge kind="violet">jalon</Badge>}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>{e.note}</div>
                            <div className="row" style={{ gap: 8 }}>
                              {u && <Avatar user={u} size="xs" />}
                              <span className="micro mono">{e.date?.split(' · ')[1] || e.date}</span>
                              {e.size && <span className="micro mono" style={{ color: 'var(--ink-4)', marginLeft: 'auto' }}>{e.size}</span>}
                            </div>
                          </div>
                          <button className="btn ghost sm" style={{ padding: 6, flexShrink: 0 }} onClick={ev => { ev.stopPropagation(); router.push(`/documents/${e.docId}/versions`); }}>
                            <Icon name="chevR" size={12} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: docs with version activity */}
        <div>
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 76 }}>
            <div className="card-hd"><h3>Documents versionnés</h3></div>
            <div style={{ padding: '8px 0' }}>
              {Object.keys(versions).map(docId => {
                const doc = docs.find(d => d.id === docId) || INITIAL_DOCS.find(d => d.id === docId);
                const vlist = versions[docId] || [];
                const current = vlist.find(v => v.current) || vlist[0];
                if (!doc) return null;
                return (
                  <div key={docId} onClick={() => router.push(`/documents/${docId}/versions`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <FileIcon type={doc.type} size={18} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }} className="truncate">{doc.name}</div>
                      <div className="micro mono">{vlist.length} version{vlist.length > 1 ? 's' : ''} · v{current?.v}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card-ft">
              <button className="btn sm" onClick={() => showToast({ type: 'info', message: 'Comparateur multi-documents — bientôt disponible' })}>
                <Icon name="layers" size={12} /> Comparer des versions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
