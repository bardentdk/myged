'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Atoms';
import { ME } from '@/lib/data';
import { useNotifications } from '@/lib/context/NotificationsContext';

const NAV = [
  { section: 'PRINCIPAL', items: [
    { id: 'dashboard',     href: '/',               label: 'Tableau de bord',      icon: 'home' },
    { id: 'explorer',      href: '/documents',      label: 'Documents',             icon: 'folder', count: 247 },
    { id: 'search',        href: '/search',         label: 'Recherche',             icon: 'search' },
    { id: 'notifications', href: '/notifications',  label: 'Notifications',         icon: 'bell', count: 6 },
  ]},
  { section: 'TRAVAIL', items: [
    { id: 'qualiopi',  href: '/qualiopi',   label: 'Qualiopi 2026',        icon: 'shield' },
    { id: 'versions',  href: '/versions',   label: 'Versions & historique',icon: 'history' },
    { id: 'activity',  href: '/activity',   label: "Journal d'activité",   icon: 'clock' },
    { id: 'templates', href: '/templates',  label: 'Modèles',               icon: 'book' },
  ]},
  { section: 'ADMINISTRATION', items: [
    { id: 'users',    href: '/users',    label: 'Utilisateurs', icon: 'users' },
    { id: 'settings', href: '/settings', label: 'Paramètres',   icon: 'settings' },
  ]},
];

export default function Sidebar({ productName = "Mar'my GED" }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
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
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8,
          padding: '6px 8px', boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
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
            {sect.items.map((item) => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.1 }}
                >
                  <Icon name={item.icon} size={15} className="ic" />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0
                    ? <span className="count" style={{ background: 'var(--accent)', color: '#fff' }}>{unreadCount}</span>
                    : item.count != null && <span className="count">{item.count}</span>}
                </motion.div>
              </Link>
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
          <Link href="/settings">
            <button className="btn ghost sm" style={{ padding: 4 }}>
              <Icon name="settings" size={14} />
            </button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
