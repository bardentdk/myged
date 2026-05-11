// Search screen — advanced search with OCR, filters, results preview
const SearchScreen = ({ onOpenDoc }) => {
  const [query, setQuery] = useState('convention OPCO');
  const [filters, setFilters] = useState({ type: 'all', status: 'all', author: 'all', dateFrom: '', dateTo: '', expiring: false, tags: '' });
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [preview, setPreview] = useState(null);

  const results = DOCS.filter(d => {
    if (!query) return true;
    const q = query.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.tags.some(t => t.includes(q)) || d.folder.toLowerCase().includes(q);
  });

  const doSearch = (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    setTimeout(() => { setSearching(false); setHasSearched(true); }, 600);
  };

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ marginBottom: 4 }}>Recherche avancée</h1>
        <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>Recherche dans 247 documents · OCR activé sur les PDF scannés</p>
      </div>

      {/* Search bar */}
      <form onSubmit={doSearch}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', background: '#fff', border: '1.5px solid var(--accent)', borderRadius: 10, height: 48, boxShadow: '0 0 0 4px var(--accent-soft)' }}>
            <Icon name="search" size={18} style={{ color: 'var(--accent)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom, texte OCR, apprenant, session, tag…"
              style={{ flex: 1, border: 0, outline: 0, fontSize: 15, fontFamily: 'inherit', background: 'transparent' }} autoFocus />
            {query && <button type="button" className="btn ghost sm" style={{ padding: 4 }} onClick={() => setQuery('')}><Icon name="x" size={14} /></button>}
          </div>
          <button type="submit" className="btn primary lg" style={{ padding: '0 24px' }}>
            {searching ? <Spinner size={16} /> : <><Icon name="search" size={14} /> Rechercher</>}
          </button>
        </div>

        {/* Filter chips */}
        <div className="card" style={{ padding: '14px 18px', marginBottom: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 14, alignItems: 'end' }}>
            <div>
              <label className="label">Type de document</label>
              <select className="input" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                <option value="all">Tous les types</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document Word</option>
                <option value="xls">Tableur</option>
              </select>
            </div>
            <div>
              <label className="label">Statut</label>
              <select className="input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="review">En validation</option>
                <option value="validated">Validé</option>
                <option value="expiring">Expire bientôt</option>
              </select>
            </div>
            <div>
              <label className="label">Auteur</label>
              <select className="input" value={filters.author} onChange={e => setFilters(f => ({ ...f, author: e.target.value }))}>
                <option value="all">Tous les auteurs</option>
                {Object.values(USERS).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tags</label>
              <input className="input" placeholder="qualiopi, contrat…" value={filters.tags}
                onChange={e => setFilters(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div className="col" style={{ gap: 8 }}>
              <label className="row" style={{ fontSize: 13, cursor: 'pointer', gap: 6 }}>
                <input type="checkbox" checked={filters.expiring} onChange={e => setFilters(f => ({ ...f, expiring: e.target.checked }))} />
                Expire bientôt
              </label>
              <button type="button" className="btn sm ghost" onClick={() => setFilters({ type: 'all', status: 'all', author: 'all', dateFrom: '', dateTo: '', expiring: false, tags: '' })}>
                Réinitialiser
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            <span className="micro" style={{ color: 'var(--ink-3)', marginTop: 2 }}>Recherches récentes :</span>
            {['Jean Payet', 'convention OPCO', 'audit qualiopi 2026', 'emargement mars'].map(s => (
              <button key={s} className="btn sm ghost" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => { setQuery(s); }}>
                <Icon name="clock" size={11} /> {s}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Results */}
      {hasSearched && (
        <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 400px' : '1fr', gap: 18 }}>
          <div>
            <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 13 }}><strong style={{ color: 'var(--ink)' }}>{results.length} résultats</strong> pour « {query} »</span>
              <div className="row" style={{ gap: 6 }}>
                <span className="micro">Trier par :</span>
                <select className="input" style={{ width: 'auto', height: 28, fontSize: 12, padding: '0 8px' }}>
                  <option>Pertinence</option>
                  <option>Date</option>
                  <option>Nom</option>
                </select>
              </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              {results.length === 0 ? (
                <EmptyState icon="search" title="Aucun résultat" sub="Essayez avec d'autres mots-clés, ou supprimez un filtre." />
              ) : results.map((doc, i) => (
                <div key={doc.id}
                  onClick={() => setPreview(doc)}
                  style={{ display: 'flex', gap: 14, padding: '14px 18px', borderBottom: i < results.length - 1 ? '1px solid var(--line)' : 0,
                    cursor: 'pointer', background: preview?.id === doc.id ? 'var(--accent-soft)' : 'transparent',
                    transition: 'background .12s', borderLeft: preview?.id === doc.id ? '3px solid var(--accent)' : '3px solid transparent' }}>
                  <FileIcon type={doc.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{highlight(doc.name, query)}</span>
                      <StatusBadge status={doc.status} />
                      {doc.lockedBy && <Badge kind="warn" dot>Verrouillé</Badge>}
                    </div>
                    <div className="micro row" style={{ gap: 6, marginBottom: 6 }}>
                      <Icon name="folder" size={11} />
                      <span>{doc.folder}</span>
                      <span>·</span>
                      <span className="mono">v{doc.version}</span>
                      <span>·</span>
                      <span>{doc.updatedAt}</span>
                    </div>
                    {/* OCR excerpt */}
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5, background: 'var(--surface-2)', padding: '6px 10px', borderRadius: 6, borderLeft: '2px solid var(--line-strong)' }}>
                      …en application des dispositions relatives aux <mark style={{ background: '#fef08a', padding: '0 1px', borderRadius: 2 }}>conventions</mark> de formation passées avec l'<mark style={{ background: '#fef08a', padding: '0 1px', borderRadius: 2 }}>OPCO</mark> Akto, conformément au barème…
                    </div>
                    <div className="row" style={{ gap: 8, marginTop: 8 }}>
                      {doc.tags.map(t => <span key={t} className="badge b-neutral" style={{ fontSize: 11 }}><Icon name="tag" size={9} /> {t}</span>)}
                    </div>
                  </div>
                  <div className="col" style={{ gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    <span className="micro mono">{doc.size}</span>
                    <button className="btn sm primary" onClick={e => { e.stopPropagation(); onOpenDoc(doc.id); }}>Ouvrir</button>
                    <button className="btn sm ghost" onClick={e => { e.stopPropagation(); }}>
                      <Icon name="download" size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick preview panel */}
          {preview && (
            <div className="card" style={{ position: 'sticky', top: 76, height: 'fit-content', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
              <div className="card-hd" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 13 }} className="truncate">{preview.name}</h3>
                <button className="btn ghost sm" style={{ padding: 4 }} onClick={() => setPreview(null)}><Icon name="x" size={14} /></button>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div className="row" style={{ gap: 8, marginBottom: 12 }}>
                  <FileIcon type={preview.type} size={36} />
                  <div>
                    <StatusBadge status={preview.status} />
                    <div className="micro mono" style={{ marginTop: 4 }}>v{preview.version} · {preview.size}</div>
                  </div>
                </div>
                <div style={{ height: 260, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, border: '1px dashed var(--line-strong)' }}>
                  <Icon name="eye" size={28} style={{ color: 'var(--ink-3)' }} />
                  <span className="muted" style={{ fontSize: 13 }}>Aperçu rapide</span>
                  <span className="micro">PDF / 4 pages</span>
                </div>
                <div className="row" style={{ gap: 8, marginTop: 14 }}>
                  <button className="btn primary sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onOpenDoc(preview.id)}>Ouvrir le document</button>
                  <button className="btn sm"><Icon name="download" size={12} /></button>
                  <button className="btn sm"><Icon name="share" size={12} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const highlight = (text, q) => {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<mark style={{ background: '#fef08a', padding: '0 2px', borderRadius: 2 }}>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
};

const EmptyState = ({ icon, title, sub, action }) => (
  <div style={{ padding: '60px 24px', textAlign: 'center' }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
      <Icon name={icon} size={20} style={{ color: 'var(--ink-3)' }} />
    </div>
    <h3 style={{ marginBottom: 4 }}>{title}</h3>
    <p className="muted" style={{ margin: '0 auto', maxWidth: 320, fontSize: 13.5 }}>{sub}</p>
    {action && <div style={{ marginTop: 14 }}>{action}</div>}
  </div>
);

Object.assign(window, { SearchScreen, EmptyState });
