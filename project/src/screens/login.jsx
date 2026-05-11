// Login screen — split layout, sober, premium
const LoginScreen = ({ onLogin, productName }) => {
  const [email, setEmail] = useState('anne.payet@cfa-horizon.re');
  const [pwd, setPwd] = useState('••••••••••••');
  const [step, setStep] = useState('credentials'); // credentials | mfa
  const [code, setCode] = useState('');

  const handleSubmit = (e) => { e.preventDefault(); setStep('mfa'); };
  const handleMfa = (e) => { e.preventDefault(); onLogin(); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', minHeight: '100vh', background: 'var(--bg)' }}>
      <section style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 60px' }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="dot-mark" style={{ width: 11, height: 11 }} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>{productName}</span>
        </div>

        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          {step === 'credentials' && (
            <form onSubmit={handleSubmit}>
              <h1 style={{ fontSize: 28, marginBottom: 6, letterSpacing: '-0.025em' }}>Connexion</h1>
              <p className="muted" style={{ marginTop: 0, marginBottom: 26 }}>
                Accédez à la GED de votre centre de formation.
              </p>

              <div style={{ marginBottom: 14 }}>
                <label className="label">Adresse e-mail professionnelle</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mot de passe</span>
                  <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Oublié ?</a>
                </label>
                <input className="input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
              </div>
              <label className="row" style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Se souvenir de cet appareil pendant 30 jours
              </label>
              <button type="submit" className="btn primary lg" style={{ width: '100%', justifyContent: 'center', marginTop: 22, padding: '11px 16px' }}>
                Continuer <Icon name="arrowR" size={14} />
              </button>

              <div className="row" style={{ margin: '22px 0', gap: 10 }}>
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                <span className="micro">ou</span>
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>
              <button type="button" className="btn lg" style={{ width: '100%', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12c0-.7-.06-1.4-.18-2H12v3.83h5.6c-.24 1.3-.97 2.4-2.07 3.13v2.6h3.35c1.96-1.8 3.12-4.46 3.12-7.56Z"/><path fill="#34A853" d="M12 22c2.8 0 5.16-.93 6.88-2.53l-3.35-2.6c-.93.62-2.12.99-3.53.99-2.7 0-5-1.83-5.82-4.28H2.74v2.69A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.18 13.58A6 6 0 0 1 5.86 12c0-.55.1-1.08.27-1.58V7.73H2.74A9.96 9.96 0 0 0 2 12c0 1.6.38 3.13 1.05 4.47l3.13-2.89Z"/><path fill="#EA4335" d="M12 6.16c1.52 0 2.89.53 3.96 1.55l2.97-2.97C17.16 3.13 14.8 2 12 2 8.06 2 4.65 4.27 2.74 7.73l3.4 2.69C7.02 7.99 9.31 6.16 12 6.16Z"/></svg>
                Se connecter avec Google Workspace
              </button>
              <p className="micro" style={{ textAlign: 'center', marginTop: 18 }}>
                Pas encore de compte ? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Contactez votre administrateur</a>
              </p>
            </form>
          )}

          {step === 'mfa' && (
            <form onSubmit={handleMfa}>
              <button type="button" className="btn ghost sm" style={{ marginBottom: 14, color: 'var(--ink-3)' }} onClick={() => setStep('credentials')}>
                <Icon name="chevL" size={12} /> Retour
              </button>
              <h1 style={{ fontSize: 26, marginBottom: 6, letterSpacing: '-0.025em' }}>Vérification en 2 étapes</h1>
              <p className="muted" style={{ marginTop: 0, marginBottom: 26 }}>
                Entrez le code à 6 chiffres généré par votre application d'authentification.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[0,1,2,3,4,5].map(i => (
                  <input key={i} className="input mono" maxLength={1}
                    style={{ flex: 1, textAlign: 'center', fontSize: 22, height: 56, padding: 0, fontWeight: 600 }}
                    autoFocus={i === 0} />
                ))}
              </div>
              <button type="submit" className="btn primary lg" style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}>
                Vérifier et se connecter
              </button>
              <p className="micro" style={{ textAlign: 'center', marginTop: 16 }}>
                Pas reçu de code ? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Renvoyer</a>
              </p>
            </form>
          )}
        </div>

        <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-4)' }}>
          <span>© 2026 {productName}. Hébergement souverain · Saint-Denis, La Réunion.</span>
          <div className="row" style={{ gap: 14 }}>
            <a href="#" style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>Confidentialité</a>
            <a href="#" style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>CGU</a>
            <a href="#" style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>Aide</a>
          </div>
        </div>
      </section>

      <section style={{ background: '#0b0f1a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* subtle gradient blob */}
        <div style={{
          position: 'absolute', top: -200, right: -200, width: 600, height: 600,
          background: `radial-gradient(circle, var(--accent) 0%, transparent 60%)`, opacity: .35, filter: 'blur(40px)'
        }} />
        <div style={{ position: 'relative' }}>
          <Badge kind="accent">
            <Icon name="shield" size={11} /> Conforme RGPD · ISO 27001
          </Badge>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 18, color: '#fff' }}>
            La GED pensée<br />pour les centres<br />de formation.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 420, lineHeight: 1.55, marginBottom: 28 }}>
            Versionning, verrouillage collaboratif et préparation d'audit Qualiopi.
            Vos documents apprenants, sessions et financeurs, enfin réunis à un seul endroit.
          </p>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 18, maxWidth: 460, backdropFilter: 'blur(20px)' }}>
            <div className="row" style={{ gap: 10, marginBottom: 10 }}>
              <Avatar user={USERS.sylvie} size="md" />
              <div style={{ fontSize: 13, lineHeight: 1.3 }}>
                <div style={{ fontWeight: 500 }}>Sylvie modifie ce document</div>
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>Convention TP Secrétaire · depuis 14:32</div>
              </div>
              <span className="badge b-warn" style={{ marginLeft: 'auto' }}><span className="dot" /> Verrouillé</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', margin: '10px 0 0' }}>
              Plus jamais d'écrasement de version. Mar'my GED verrouille intelligemment les documents en cours d'édition et vous notifie dès qu'ils se libèrent.
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
          « Depuis Mar'my GED, on a divisé par 3 le temps de préparation d'un audit Qualiopi. »<br />
          <span style={{ color: 'rgba(255,255,255,.65)' }}>— Jean-Baptiste Fontaine, Directeur · CFA Horizon Réunion</span>
        </div>
      </section>
    </div>
  );
};

window.LoginScreen = LoginScreen;
