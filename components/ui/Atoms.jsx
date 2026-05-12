import Icon from './Icon';
import { STATUS_MAP } from '@/lib/data';

export const initials = (name) => {
  if (!name) return '?';
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
};

export const Avatar = ({ user, size = 'md', ring = false }) => {
  if (!user) return null;
  const name  = user.name || user.full_name || user.email || '?';
  const color = user.color || '#6366f1';
  const cls   = `av ${size === 'md' ? '' : size}`;
  return (
    <span
      className={cls}
      style={{ background: color, boxShadow: ring ? '0 0 0 2px #fff' : 'none' }}
      title={name}
    >
      {initials(name)}
    </span>
  );
};

export const AvatarStack = ({ users, size = 'md' }) => (
  <span className="av-stack">
    {users.map((u, i) => <Avatar key={u.id + i} user={u} size={size} />)}
  </span>
);

export const Badge = ({ children, kind = 'neutral', dot = false }) => (
  <span className={`badge b-${kind}`}>
    {dot && <span className="dot" />}
    {children}
  </span>
);

export const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.draft;
  return <Badge kind={s.kind} dot>{s.label}</Badge>;
};

export const FileIcon = ({ type, size = 28 }) => {
  const labels = { pdf: 'PDF', doc: 'DOC', xls: 'XLS', img: 'IMG', zip: 'ZIP', sig: 'SIG' };
  return (
    <span
      className={`file-ico ${type}`}
      style={size !== 28 ? { width: size, height: size * 1.14 } : {}}
    >
      {labels[type] || 'FIL'}
    </span>
  );
};

export const Spinner = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.9s linear infinite' }}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none"
      strokeDasharray="42 18" strokeLinecap="round" opacity="0.85" />
  </svg>
);

export const EmptyState = ({ icon, title, sub, action }) => (
  <div style={{ padding: '60px 24px', textAlign: 'center' }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14, background: 'var(--surface-2)',
      border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', marginBottom: 14,
    }}>
      <Icon name={icon} size={20} style={{ color: 'var(--ink-3)' }} />
    </div>
    <h3 style={{ marginBottom: 4 }}>{title}</h3>
    <p className="muted" style={{ margin: '0 auto', maxWidth: 320, fontSize: 13.5 }}>{sub}</p>
    {action && <div style={{ marginTop: 14 }}>{action}</div>}
  </div>
);
