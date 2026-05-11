'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Atoms';
import { ME } from '@/lib/data';
import { useNotifications } from '@/lib/context/NotificationsContext';

const NAV = [
  { section: 'PRINCIPAL', items: [
    { id: 'dashboard',     href: '/',               label: 'Tableau de bord',      icon: 'home' },
    { id: 'explorer',      href: '/documents',      label: 'Documents',             icon: 'folder' },
    { id: 'search',        href: '/search',         label: 'Recherche',             icon: 'search' },
    { id: 'notifications', href: '/notifications',  label: 'Notifications',         icon: 'bell' },
  ]},
  { section: 'TRAVAIL', items: [
    { id: 'qualiopi',  href: '/qualiopi',   label: 'Qualiopi 2026',         icon: 'shield' },
    { id: 'versions',  href: '/versions',   label: 'Versions & historique', icon: 'history' },
    { id: 'activity',  href: '/activity',   label: "Journal d'activité",    icon: 'clock' },
    { id: 'templates', href: '/templates',  label: 'Modèles',                icon: 'book' },
    { id: 'reporting', href: '/reporting',  label: 'Reporting',              icon: 'layers' },
  ]},
  { section: 'ADMIN', items: [
    { id: 'users',    href: '/users',    label: 'Utilisateurs', icon: 'users' },
    { id: 'settings', href: '/settings', label: 'Paramètres',   icon: 'settings' },
  ]},
];

export default function Sidebar({ productName = "Mar'my GED", collapsed = false, onToggle }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      className="sidebar"
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ overflow: 'hidden', flexShrink: 0 }}>

      {/* Brand */}
      <div className="brand" style={{ padding: collapsed ? '0 12px' : undefined, justifyContent: collapsed ? 'center' : undefined }}>
        <span className="dot-mark" style={{ flexShrink: 0 }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span className="word" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {productName}
            </motion.span>
          )}
        </AnimatePresence>
        <button className="btn ghost sm" title={collapsed ? 'Déplier' : 'Replier'} onClick={onToggle}
          style={{ padding: 4, marginLeft: collapsed ? 0 : 'auto', flexShrink: 0 }}>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <Icon name="chevL" size={14} />
          </motion.div>
        </button>
      </div>

      {/* Org card */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '0 10px 10px' }}>
            <div className="row" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
              <span className="av lg" style={{ background: '#0a0a0a', flexShrink: 0 }}>HR</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }} className="truncate">CFA Horizon Réunion</div>
                <div className="micro">Centre formation · Saint-Denis</div>
              </div>
              <Icon name="chevD" size={14} style={{ color: 'var(--ink-4)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map((sect, si) => (
          <div key={si}>
            <AnimatePresence>
              {!collapsed && (
                <motion.div className="nav-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {sect.section}
                </motion.div>
              )}
            </AnimatePresence>
            {collapsed && si > 0 && <div style={{ height: 1, background: 'var(--line)', margin: '6px 8px' }} />}
            {sect.items.map((item) => {
              const active = isActive(item.href);
              const badge = item.id === 'notifications' && unreadCount > 0 ? unreadCount : null;
              return (
                <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }} title={collapsed ? item.label : undefined}>
                  <motion.div
                    className={`nav-item ${active ? 'active' : ''}`}
                    whileHover={{ x: collapsed ? 0 : 2 }}
                    transition={{ duration: 0.1 }}
                    style={{ justifyContent: collapsed ? 'center' : undefined, padding: collapsed ? '8px 0' : undefined, position: 'relative' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Icon name={item.icon} size={15} className="ic" />
                      {collapsed && badge ? (
                        <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {badge}
                        </span>
                      ) : null}
                    </div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                          style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && badge ? (
                      <span className="count" style={{ background: 'var(--accent)', color: '#fff', flexShrink: 0 }}>{badge}</span>
                    ) : null}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-foot">
        <div className="row" style={{ padding: '6px 8px', gap: 10, justifyContent: collapsed ? 'center' : undefined }}>
          <Avatar user={ME} size="lg" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }} className="truncate">{ME.name}</div>
                <div className="micro truncate">{ME.role}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <Link href="/settings">
              <button className="btn ghost sm" style={{ padding: 4 }}>
                <Icon name="settings" size={14} />
              </button>
            </Link>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
