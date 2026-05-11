'use client';

import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Atoms';
import { ME } from '@/lib/data';

const CRUMBS = {
  '/':              ['CFA Horizon Réunion', 'Tableau de bord'],
  '/documents':     ['CFA Horizon Réunion', 'Documents'],
  '/qualiopi':      ['CFA Horizon Réunion', 'Qualiopi', 'Audit 2026'],
  '/search':        ['CFA Horizon Réunion', 'Recherche'],
  '/notifications': ['CFA Horizon Réunion', 'Notifications'],
  '/activity':      ['CFA Horizon Réunion', "Journal d'activité"],
  '/templates':     ['CFA Horizon Réunion', 'Modèles'],
  '/users':         ['CFA Horizon Réunion', 'Utilisateurs'],
  '/settings':      ['CFA Horizon Réunion', 'Paramètres'],
  '/versions':      ['CFA Horizon Réunion', 'Versions'],
};

export default function Topbar({ aiEnabled = true, onOpenAi }) {
  const pathname = usePathname();
  const router = useRouter();

  const crumb = CRUMBS[pathname] ||
    (pathname.startsWith('/documents/') ? ['CFA Horizon Réunion', 'Documents', 'Document'] : CRUMBS['/']);

  return (
    <header className="topbar">
      <div className="crumb">
        {crumb.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span className="sep"><Icon name="chevR" size={12} /></span>}
            <span className={i === crumb.length - 1 ? 'current' : ''}>{c}</span>
          </span>
        ))}
      </div>

      <div className="search" onClick={() => router.push('/search')} style={{ marginLeft: 24, cursor: 'pointer' }}>
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
        <button className="btn sm ghost" title="Notifications" style={{ position: 'relative' }}
          onClick={() => router.push('/notifications')}>
          <Icon name="bell" size={15} />
          <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: 999, background: 'var(--err)' }} />
        </button>
        <Avatar user={ME} size="md" />
      </div>
    </header>
  );
}
