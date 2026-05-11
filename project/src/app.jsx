// Root app — orchestrates routing, tweaks, toasts, AI drawer
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 220,
  "aiEnabled": true,
  "explorerView": "list"
}/*EDITMODE-END*/;

// Hue → accent triplet (h, s/l in oklch); we keep chroma+lightness fixed for harmony.
const accentFromHue = (hue) => {
  // hue 0..360 — produces an oklch-ish accent + soft + ink
  const main = `oklch(0.48 0.18 ${hue})`;
  const soft = `oklch(0.96 0.04 ${hue})`;
  const ink  = `oklch(0.30 0.14 ${hue})`;
  return { main, soft, ink };
};

const HUE_OPTIONS = [
  { hue: 220, label: 'Bleu profond' },
  { hue: 200, label: 'Cyan' },
  { hue: 170, label: 'Sarcelle' },
  { hue: 25,  label: 'Brique' },
  { hue: 280, label: 'Indigo' },
  { hue: 340, label: 'Magenta' },
];

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [auth, setAuth] = useState(false);
  const [route, setRoute] = useState('dashboard'); // dashboard | explorer | document | versions | qualiopi
  const [docId, setDocId] = useState('d1');
  const [aiOpen, setAiOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lockScenario, setLockScenario] = useState('locked'); // locked | released
  const productName = "Mar'my GED";

  // Inject accent colors as CSS vars
  React.useEffect(() => {
    const { main, soft, ink } = accentFromHue(t.accentHue);
    const r = document.documentElement.style;
    r.setProperty('--accent', main);
    r.setProperty('--accent-soft', soft);
    r.setProperty('--accent-ink', ink);
  }, [t.accentHue]);

  const showToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, ...toast }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3600);
  };

  const navigate = (r) => { setRoute(r); window.scrollTo(0, 0); };
  const openDoc = (id) => { setDocId(id); setRoute('document'); setLockScenario('locked'); window.scrollTo(0, 0); };

  const crumbs = {
    dashboard:     ['CFA Horizon Réunion', 'Tableau de bord'],
    explorer:      ['CFA Horizon Réunion', 'Documents'],
    document:      ['CFA Horizon Réunion', 'Documents', 'Sessions', 'TP SA 2026', DOCS.find(d => d.id === docId)?.name || ''],
    versions:      ['CFA Horizon Réunion', 'Documents', 'Convention TP SA 2026', 'Historique'],
    qualiopi:      ['CFA Horizon Réunion', 'Qualiopi', 'Audit 2026'],
    search:        ['CFA Horizon Réunion', 'Recherche'],
    notifications: ['CFA Horizon Réunion', 'Notifications'],
    activity:      ['CFA Horizon Réunion', 'Journal d\'activité'],
    templates:     ['CFA Horizon Réunion', 'Modèles'],
    users:         ['CFA Horizon Réunion', 'Utilisateurs'],
    settings:      ['CFA Horizon Réunion', 'Paramètres'],
  };

  if (!auth) return (
    <>
      <LoginScreen onLogin={() => setAuth(true)} productName={productName} />
      <TweaksUi t={t} setTweak={setTweak} />
    </>
  );

  return (
    <div className="app">
      <Sidebar active={route} onNavigate={navigate} productName={productName} />
      <main className="main">
        <Topbar crumb={crumbs[route] || crumbs.dashboard}
          onSearch={() => navigate('search')}
          onNotifications={() => navigate('notifications')}
          onOpenAi={() => setAiOpen(true)}
          aiEnabled={t.aiEnabled} />
        {route === 'dashboard' && <Dashboard onNavigate={navigate} onOpenDoc={openDoc} productName={productName} />}
        {route === 'explorer' && <Explorer onOpenDoc={openDoc} view={t.explorerView} onViewChange={(v) => setTweak('explorerView', v)} />}
        {route === 'document' && <DocumentScreen docId={docId} onNavigate={navigate} onShowToast={showToast} scenario={lockScenario} onScenarioChange={setLockScenario} />}
        {route === 'versions' && <VersionsScreen onNavigate={navigate} onOpenDoc={openDoc} />}
        {route === 'qualiopi' && <QualiopiScreen />}
        {route === 'search' && <SearchScreen onOpenDoc={openDoc} />}
        {route === 'notifications' && <NotificationsScreen onOpenDoc={openDoc} />}
        {route === 'activity' && <ActivityScreen onOpenDoc={openDoc} />}
        {route === 'templates' && <TemplatesScreen onShowToast={showToast} />}
        {route === 'users' && <UsersScreen onShowToast={showToast} />}
        {route === 'settings' && <SettingsScreen onShowToast={showToast} />}
      </main>

      {/* AI fab when topbar button absent */}
      {t.aiEnabled && !aiOpen && (
        <div className="ai-fab" onClick={() => setAiOpen(true)} title="Assistant Mar'my">
          <Icon name="sparkles" size={20} />
        </div>
      )}
      {aiOpen && t.aiEnabled && <AiPanel onClose={() => setAiOpen(false)} onShowToast={showToast} />}

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.icon && <Icon name={t.icon} size={14} style={{ color: '#a3e5b8' }} />}
            <span>{t.message}</span>
            <span className="toast-x" onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>×</span>
          </div>
        ))}
      </div>

      <TweaksUi t={t} setTweak={setTweak} />
    </div>
  );
};

const TweaksUi = ({ t, setTweak }) => (
  <TweaksPanel>
    <TweakSection label="Apparence" />
    <div className="twk-row">
      <div className="twk-lbl"><span>Couleur d'accent</span></div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {HUE_OPTIONS.map(o => (
          <button key={o.hue}
            onClick={() => setTweak('accentHue', o.hue)}
            title={o.label}
            style={{
              width: 24, height: 24, borderRadius: 999, cursor: 'pointer',
              background: `oklch(0.48 0.18 ${o.hue})`,
              border: t.accentHue === o.hue ? '2px solid #29261b' : '1px solid rgba(0,0,0,.15)',
              boxShadow: t.accentHue === o.hue ? '0 0 0 2px #fff inset' : 'none',
              padding: 0,
            }} />
        ))}
      </div>
    </div>

    <TweakSection label="Documents" />
    <TweakRadio label="Affichage par défaut" value={t.explorerView}
      options={['list', 'grid']}
      onChange={(v) => setTweak('explorerView', v)} />

    <TweakSection label="Assistant IA" />
    <TweakToggle label="Activer l'assistant" value={t.aiEnabled}
      onChange={(v) => setTweak('aiEnabled', v)} />
  </TweaksPanel>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
