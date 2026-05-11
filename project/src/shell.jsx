// Shell: Sidebar + Topbar
const { useState } = React;

const NAV = [
  { section: 'PRINCIPAL', items: [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'home' },
    { id: 'explorer',  label: 'Documents',       icon: 'folder', count: 247 },
    { id: 'search',    label: 'Recherche',       icon: 'search' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', count: 6 },
  ]},
  { section: 'TRAVAIL', items: [
    { id: 'qualiopi', label: 'Qualiopi 2026', icon: 'shield' },
    { id: 'versions', label: 'Versions & historique', icon: 'history' },
    { id: 'activity', label: 'Journal d\'activité', icon: 'clock' },
    { id: 'templates', label: 'Modèles', icon: 'book' },
  ]},
  { section: 'ADMINISTRATION', items: [
    { id: 'users',    label: 'Utilisateurs',  icon: 'users' },
    { id: 'settings', label: 'Paramètres',    icon: 'settings' },
  ]},
];

const Sidebar = ({ active, onNavigate, productName }) => (
  <aside className="sidebar">
    <div className="brand">
      <span className="dot-mark" />
      <span className="word">{productName}</span>
      <span style={{ marginLeft: 'auto' }}>
        <button className="btn ghost sm" title="Replier" style={{ padding: 4 }}>
          <Icon name="chevL" size={14} />
        </button>
      </span>
    </div>
    <div style={{ padding: '0 10px 10px' }}>
      <div className="row" style={{
        background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px',
        boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
      }}>
        <span className="av lg" style={{ background: '#0a0a0a' }}>HR</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }} className="truncate">CFA Horizon Réunion</div>
          <div className="micro">Centre formation · Saint-Denis</div>
        </div>
        <Icon name="chevD" size={14} style={{ color: 'var(--ink-4)' }} />
      </div>
    </div>

    <nav className="nav">
      {NAV.map((sect, si) => (
        <div key={si}>
          <div className="nav-section">{sect.section}</div>
          {sect.items.map(item => (
            <div key={item.id}
              className={`nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}>
              <Icon name={item.icon} size={15} className="ic" />
              <span>{item.label}</span>
              {item.count != null && <span className="count">{item.count}</span>}
            </div>
          ))}
        </div>
      ))}
    </nav>

    <div className="sidebar-foot">
      <div className="row" style={{ padding: '6px 8px', gap: 10 }}>
        <Avatar user={ME} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }} className="truncate">{ME.name}</div>
          <div className="micro truncate">{ME.role}</div>
        </div>
        <button className="btn ghost sm" style={{ padding: 4 }}><Icon name="settings" size={14} /></button>
      </div>
    </div>
  </aside>
);

const Topbar = ({ crumb, onSearch, onOpenAi, aiEnabled, onNotifications }) => {
  return (
    <header className="topbar">
      <div className="crumb">
        {crumb.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep"><Icon name="chevR" size={12} /></span>}
            <span className={i === crumb.length - 1 ? 'current' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="search" onClick={onSearch} style={{ marginLeft: 24, cursor: 'pointer' }}>
        <Icon name="search" size={14} />
        <input placeholder="Rechercher un document, un apprenant, une session…" readOnly style={{ cursor: 'pointer' }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>⌘K</span>
      </div>
      <div className="row" style={{ marginLeft: 'auto', gap: 8 }}>
        {aiEnabled && (
          <button className="btn sm" onClick={onOpenAi}>
            <Icon name="sparkles" size={13} style={{ color: 'var(--accent)' }} />
            Assistant
          </button>
        )}
        <button className="btn sm ghost" title="Notifications" style={{ position: 'relative' }} onClick={onNotifications}>
          <Icon name="bell" size={15} />
          <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: 999, background: 'var(--err)' }} />
        </button>
        <Avatar user={ME} size="md" />
      </div>
    </header>
  );
};

Object.assign(window, { Sidebar, Topbar });
