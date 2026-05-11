// Reusable atoms — Avatar, Badge, FileIcon, StatusBadge, MenuButton

const initials = (name) => name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

const Avatar = ({ user, size = 'md', ring = false }) => {
  if (!user) return null;
  const cls = `av ${size === 'md' ? '' : size}`;
  return (
    <span className={cls} style={{ background: user.color, boxShadow: ring ? '0 0 0 2px #fff' : 'none' }} title={user.name}>
      {initials(user.name)}
    </span>
  );
};

const AvatarStack = ({ users, size = 'md' }) => (
  <span className="av-stack">
    {users.map((u, i) => <Avatar key={u.id + i} user={u} size={size} />)}
  </span>
);

const Badge = ({ children, kind = 'neutral', dot = false }) => (
  <span className={`badge b-${kind}`}>{dot && <span className="dot" />}{children}</span>
);

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.draft;
  return <Badge kind={s.cls.replace('b-', '')} dot>{s.label}</Badge>;
};

const FileIcon = ({ type, size = 28 }) => {
  const labels = { pdf: 'PDF', doc: 'DOC', xls: 'XLS', img: 'IMG', zip: 'ZIP', sig: 'SIG' };
  return (
    <span className={`file-ico ${type}`} style={size !== 28 ? { width: size, height: size * 1.14 } : {}}>
      {labels[type] || 'FIL'}
    </span>
  );
};

const Spinner = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.9s linear infinite' }}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="42 18" strokeLinecap="round" opacity="0.85" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

Object.assign(window, { Avatar, AvatarStack, Badge, StatusBadge, FileIcon, Spinner, initials });
