// Explorer — folder tree + document table/grid
const Explorer = ({ onOpenDoc, view = 'list', onViewChange }) => {
  const [folder, setFolder] = useState('sessions');
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = DOCS.filter(d => {
    if (filter === 'locked') return !!d.lockedBy;
    if (filter === 'review') return d.status === 'review' || d.status === 'pending';
    if (filter === 'mine')   return d.owner === ME.id;
    return true;
  });

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Documents</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>247 documents · 18 dossiers · 4,2 Go utilisés sur 50 Go</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="folder" size={13} /> Nouveau dossier</button>
          <button className="btn"><Icon name="upload" size={13} /> Téléverser</button>
          <button className="btn primary"><Icon name="plus" size={13} /> Nouveau document</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 18 }}>
        {/* Folder tree */}
        <aside className="card" style={{ padding: 10, height: 'fit-content', position: 'sticky', top: 76 }}>
          <div className="micro" style={{ padding: '4px 8px 8px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Dossiers</div>
          {FOLDERS.map(f => (
            <div key={f.id}
              onClick={() => setFolder(f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                borderRadius: 6, cursor: 'pointer', fontSize: 13,
                background: folder === f.id ? 'var(--surface-2)' : 'transparent',
                color: folder === f.id ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: folder === f.id ? 500 : 400,
              }}>
              <Icon name="folder" size={14} style={{ color: folder === f.id ? 'var(--accent)' : 'var(--ink-3)' }} />
              <span style={{ flex: 1 }}>{f.name}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{f.count}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="micro" style={{ padding: '4px 8px 8px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Tags</div>
          {['qualiopi', 'urgent', 'apprenant', 'financement', 'signé'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-soft)', border: '1px solid var(--accent)', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t}</span>
            </div>
          ))}
        </aside>

        {/* Main column */}
        <div>
          {/* Filter bar */}
          <div className="card" style={{ marginBottom: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="row" style={{ gap: 4 }}>
              {[
                { id: 'all',    label: 'Tous',           count: DOCS.length },
                { id: 'mine',   label: 'À moi',          count: DOCS.filter(d=>d.owner===ME.id).length },
                { id: 'review', label: 'À valider',      count: DOCS.filter(d=>d.status==='review'||d.status==='pending').length },
                { id: 'locked', label: 'Verrouillés',    count: DOCS.filter(d=>!!d.lockedBy).length },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`btn sm ${filter === f.id ? '' : 'ghost'}`}
                  style={{ fontWeight: filter === f.id ? 500 : 400 }}>
                  {f.label}
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 2 }}>{f.count}</span>
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button className="btn sm ghost"><Icon name="filter" size={13} /> Filtres</button>
            <button className="btn sm ghost"><Icon name="tag" size={13} /> Tags</button>
            <div style={{ width: 1, height: 18, background: 'var(--line)' }} />
            <div className="row" style={{ gap: 2, padding: 2, background: 'var(--surface-2)', borderRadius: 6 }}>
              <button onClick={() => onViewChange('list')} className={`btn sm ${view === 'list' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="list" size={13} /></button>
              <button onClick={() => onViewChange('grid')} className={`btn sm ${view === 'grid' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="grid" size={13} /></button>
            </div>
          </div>

          {/* Table or grid */}
          {view === 'list' && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="t">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}><input type="checkbox" /></th>
                    <th>Nom</th>
                    <th style={{ width: 130 }}>Statut</th>
                    <th style={{ width: 80 }}>Version</th>
                    <th style={{ width: 130 }}>Propriétaire</th>
                    <th style={{ width: 150 }}>Modifié</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <tr key={doc.id} onClick={() => onOpenDoc(doc.id)}>
                      <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                      <td className="col-name">
                        <div className="row" style={{ gap: 12 }}>
                          <FileIcon type={doc.type} size={26} />
                          <div style={{ minWidth: 0 }}>
                            <div className="truncate" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {doc.name}
                              {doc.lockedBy && <Icon name="lock" size={12} style={{ color: 'var(--warn)' }} />}
                            </div>
                            <div className="micro truncate" style={{ marginTop: 2 }}>{doc.folder}</div>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>v{doc.version}</td>
                      <td>
                        <div className="row" style={{ gap: 6 }}>
                          <Avatar user={USERS[doc.owner]} size="xs" />
                          <span style={{ fontSize: 12.5 }}>{USERS[doc.owner].name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{doc.updatedAt}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn ghost sm" style={{ padding: 4 }}><Icon name="more" size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {filtered.map(doc => (
                <div key={doc.id} className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => onOpenDoc(doc.id)}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                    <FileIcon type={doc.type} size={32} />
                    {doc.lockedBy
                      ? <Badge kind="warn" dot>Verrouillé</Badge>
                      : <StatusBadge status={doc.status} />}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 4, lineHeight: 1.35, height: 36, overflow: 'hidden' }}>{doc.name}</div>
                  <div className="micro truncate" style={{ marginBottom: 12 }}>{doc.folder}</div>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
                    <div className="row" style={{ gap: 6 }}>
                      <Avatar user={USERS[doc.owner]} size="xs" />
                      <span className="mono">v{doc.version}</span>
                    </div>
                    <span>{doc.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.Explorer = Explorer;
