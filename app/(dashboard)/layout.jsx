'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PageTransition from '@/components/animations/PageTransition';
import AiPanel from '@/components/screens/AiPanel';

export default function DashboardLayout({ children }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app" style={{ '--sidebar-w': collapsed ? '60px' : '220px' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <main className="main">
        <Topbar aiEnabled={true} onOpenAi={() => setAiOpen(true)} />
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      <AnimatePresence>
        {!aiOpen && (
          <div className="ai-fab" onClick={() => setAiOpen(true)} title="Assistant Mar'my">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/>
              <path d="m6 6 2.5 2.5"/><path d="m15.5 15.5 2.5 2.5"/><path d="m6 18 2.5-2.5"/><path d="m15.5 8.5 2.5-2.5"/>
            </svg>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiOpen && <AiPanel onClose={() => setAiOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
