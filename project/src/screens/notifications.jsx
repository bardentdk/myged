// Notifications center
const NOTIFS = [
  { id: 'n1', type: 'unlock',   icon: 'unlock',   title: 'Document libéré',              body: 'Sylvie Hoarau a libéré « Convention TP SA 2026 ». Vous pouvez maintenant le modifier.', who: 'sylvie',  when: 'il y a 2 min',   read: false, docId: 'd1' },
  { id: 'n2', type: 'review',   icon: 'checkCircle', title: 'Validation demandée',        body: 'Anne Payet vous demande de valider « Feuille émargement — 12 mars 2026 ».', who: 'anne',    when: 'il y a 1 h',     read: false, docId: 'd2' },
  { id: 'n3', type: 'mention',  icon: 'msg',      title: 'Mention dans un commentaire',  body: 'Thierry Bègue vous a mentionné dans « Indicateur 11 — Suivi apprenants 2026 » : "@Anne merci de vérifier l\'assiduité de Jan Payet."', who: 'thierry', when: 'il y a 3 h', read: false, docId: 'd7' },
  { id: 'n4', type: 'expiring', icon: 'clock',    title: 'Document expire dans 21 jours', body: '« Assurance RC professionnelle 2025-2026 » expire le 01/06/2026. Pensez à le renouveler.', who: null,    when: 'aujourd\'hui · 09:00', read: false, docId: 'd9' },
  { id: 'n5', type: 'version',  icon: 'upload',   title: 'Nouvelle version disponible',   body: 'Sylvie Hoarau a publié la version 2.3 de « Convention TP SA 2026 ».', who: 'sylvie',  when: 'aujourd\'hui · 14:32', read: false, docId: 'd1' },
  { id: 'n6', type: 'share',    icon: 'share',    title: 'Document partagé avec vous',    body: 'Jean-Baptiste Fontaine vous a partagé « Plan de formation 2026 — Direction » en lecture seule.', who: 'jb', when: 'hier · 16:44',   read: true,  docId: null },
  { id: 'n7', type: 'validated',icon: 'check',    title: 'Document validé',               body: 'Jean-Baptiste Fontaine a validé « Bilan pédagogique Q4 2025 ».', who: 'jb',      when: 'hier · 17:08',   read: true,  docId: null },
  { id: 'n8', type: 'expiring', icon: 'warn',     title: 'Pièce d\'identité arrive à expiration', body: '« Pièce identité — Jean Payet » expire le 12/06/2027. Demandez le renouvellement à l\'apprenant.', who: null, when: 'il y a 2 j', read: true, docId: 'd5' },
  { id: 'n9', type: 'lock',     icon: 'lock',     title: 'Document verrouillé',           body: 'Mélanie Grondin a verrouillé « Bilan pédagogique Q1 — Saint-Pierre ». Vous serez notifié·e à sa libération.', who: 'melanie', when: 'il y a 2 j', read: true, docId: null },
  { id: 'n10',type: 'qualiopi', icon: 'shield',   title: 'Alerte Qualiopi',               body: 'Indicateur 19 bloqué : 2 pièces manquantes. Audit dans 14 jours.', who: null,    when: 'il y a 3 j',     read: true,  docId: null },
];

const NOTIF_COLORS = {
  unlock: 'var(--ok)', review: 'var(--accent)', mention: 'var(--violet)',
  expiring: 'var(--warn)', version: 'var(--ink-3)', share: 'var(--accent)',
  validated: 'var(--ok)', lock: 'var(--warn)', qualiopi: 'var(--accent)',
};

const NotificationsScreen = ({ onOpenDoc }) => {
  const [items, setItems] = useState(NOTIFS);
  const [filterTab, setFilterTab] = useState('all');
  const [preferences, setPreferences] = useState(false);

  const unread = items.filter(n => !n.read);
  const shown = filterTab === 'unread' ? unread : items;

  const markAllRead = () => setItems(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id) => setItems(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id) => setItems(ns => ns.filter(n => n.id !== id));

  return (
    <div className="page" style={{ paddingTop: 22, maxWidth: 900 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Notifications</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {unread.length} non lues · {items.length} au total
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {unread.length > 0 && (
            <button className="btn sm" onClick={markAllRead}><Icon name="check" size={13} /> Tout marquer comme lu</button>
          )}
          <button className="btn sm" onClick={() => setPreferences(v => !v)}>
            <Icon name="settings" size={13} /> Préférences
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: preferences ? '1fr 320px' : '1fr', gap: 18 }}>
        <div>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 14 }}>
            <span className={`tab ${filterTab === 'all' ? 'active' : ''}`} onClick={() => setFilterTab('all')}>
              Toutes <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 4 }}>{items.length}</span>
            </span>
            <span className={`tab ${filterTab === 'unread' ? 'active' : ''}`} onClick={() => setFilterTab('unread')}>
              Non lues <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 4 }}>{unread.length}</span>
            </span>
          </div>

          {shown.length === 0 ? (
            <div className="card"><EmptyState icon="check" title="Tout est lu !" sub="Vous êtes à jour. Les nouvelles notifications apparaîtront ici." /></div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              {shown.map((n, i) => (
                <div key={n.id}
                  onClick={() => { markRead(n.id); if (n.docId) onOpenDoc(n.docId); }}
                  style={{
                    display: 'flex', gap: 14, padding: '14px 18px',
                    borderBottom: i < shown.length - 1 ? '1px solid var(--line)' : 0,
                    cursor: 'pointer', background: !n.read ? 'rgba(30,78,216,.02)' : 'transparent',
                    borderLeft: !n.read ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(30,78,216,.02)' : 'transparent'}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${NOTIF_COLORS[n.type]}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={n.icon} size={16} style={{ color: NOTIF_COLORS[n.type] }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: !n.read ? 600 : 500, fontSize: 13.5 }}>{n.title}</span>
                      {!n.read && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 4 }}>{n.body}</div>
                    <div className="row" style={{ gap: 8 }}>
                      {n.who && <Avatar user={USERS[n.who]} size="xs" />}
                      <span className="micro mono">{n.when}</span>
                      {n.docId && <span className="micro" style={{ color: 'var(--accent)' }}>→ Voir le document</span>}
                    </div>
                  </div>
                  <div className="col" style={{ gap: 4, flexShrink: 0 }}>
                    {!n.read && (
                      <button className="btn ghost sm" style={{ padding: 4 }} title="Marquer comme lu"
                        onClick={e => { e.stopPropagation(); markRead(n.id); }}>
                        <Icon name="check" size={13} />
                      </button>
                    )}
                    <button className="btn ghost sm" style={{ padding: 4 }} title="Supprimer"
                      onClick={e => { e.stopPropagation(); dismiss(n.id); }}>
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferences panel */}
        {preferences && (
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 76 }}>
            <div className="card-hd"><h3>Préférences de notification</h3></div>
            <div style={{ padding: '8px 0' }}>
              {[
                { label: 'Document verrouillé / libéré', icon: 'lock',    defaultOn: true },
                { label: 'Demande de validation',         icon: 'checkCircle', defaultOn: true },
                { label: 'Nouvelle version publiée',      icon: 'upload',  defaultOn: true },
                { label: 'Mention dans un commentaire',   icon: 'msg',     defaultOn: true },
                { label: 'Document expire bientôt',       icon: 'clock',   defaultOn: true },
                { label: 'Partage de document',           icon: 'share',   defaultOn: false },
                { label: 'Alerte Qualiopi',               icon: 'shield',  defaultOn: true },
                { label: 'Connexion d\'un auditeur',      icon: 'user',    defaultOn: false },
              ].map((p, i) => {
                const [on, setOn] = useState(p.defaultOn);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--line)' }}>
                    <Icon name={p.icon} size={14} style={{ color: 'var(--ink-3)' }} />
                    <span style={{ flex: 1, fontSize: 13 }}>{p.label}</span>
                    <button onClick={() => setOn(v => !v)} style={{
                      width: 34, height: 20, borderRadius: 999, cursor: 'pointer', border: 'none',
                      background: on ? 'var(--accent)' : 'var(--surface-3)', position: 'relative', transition: 'background .2s'
                    }}>
                      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="card-ft">
              <span className="micro">Notifications e-mail aussi disponibles</span>
              <button className="btn sm">Enregistrer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

window.NotificationsScreen = NotificationsScreen;
