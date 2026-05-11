import React, { useState } from 'react';
import Icon from '../icons.jsx';
import { Badge } from '../atoms.jsx';

const SettingsScreen = ({ onShowToast }) => {
  const [tab, setTab] = useState('security');
  const save = () => { onShowToast({ message: 'Paramètres enregistrés', icon: 'check' }); };

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ marginBottom: 4 }}>Paramètres</h1>
        <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>Configuration de l'espace CFA Horizon Réunion</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        <aside>
          {[
            { id: 'security',      label: 'Sécurité',         icon: 'shield' },
            { id: 'organization',  label: 'Organisation',      icon: 'users' },
            { id: 'storage',       label: 'Stockage & backup', icon: 'layers' },
            { id: 'integrations',  label: 'Intégrations',      icon: 'link' },
            { id: 'notifications', label: 'Notifications',     icon: 'bell' },
            { id: 'billing',       label: 'Abonnement',        icon: 'star' },
          ].map(s => (
            <div key={s.id}
              onClick={() => setTab(s.id)}
              className={`nav-item ${tab === s.id ? 'active' : ''}`}
              style={{ marginBottom: 2 }}>
              <Icon name={s.icon} size={14} className="ic" />
              {s.label}
            </div>
          ))}
        </aside>

        <div>
          {tab === 'security'      && <SecurityTab onSave={save} />}
          {tab === 'organization'  && <OrgTab onSave={save} />}
          {tab === 'storage'       && <StorageTab />}
          {tab === 'integrations'  && <IntegrationsTab onShowToast={onShowToast} />}
          {tab === 'notifications' && <NotifsSettingsTab onSave={save} />}
          {tab === 'billing'       && <BillingTab />}
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ label, sub, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--line)', gap: 24 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</div>
      {sub && <div className="micro" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const Toggle = ({ defaultOn }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(v => !v)} style={{
      width: 38, height: 22, borderRadius: 999, cursor: 'pointer', border: 'none',
      background: on ? 'var(--accent)' : 'var(--surface-3)', position: 'relative', transition: 'background .2s', padding: 0
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 18 : 3, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  );
};

const SecurityTab = ({ onSave }) => (
  <div className="card">
    <div className="card-hd"><h2>Sécurité</h2></div>
    <div style={{ padding: '0 22px' }}>
      <SettingRow label="Authentification à deux facteurs (2FA)" sub="Exiger la 2FA pour tous les utilisateurs de l'organisation">
        <Toggle defaultOn={true} />
      </SettingRow>
      <SettingRow label="Durée de session" sub="Déconnexion automatique après inactivité">
        <select className="input" defaultValue="4 heures" style={{ width: 160, height: 34, fontSize: 13, padding: '0 10px' }}>
          <option>30 minutes</option>
          <option>1 heure</option>
          <option>4 heures</option>
          <option>8 heures</option>
          <option>1 journée</option>
        </select>
      </SettingRow>
      <SettingRow label="Timeout verrouillage document" sub="Libère automatiquement un document si l'utilisateur est inactif">
        <select className="input" defaultValue="30 minutes" style={{ width: 160, height: 34, fontSize: 13, padding: '0 10px' }}>
          <option>15 minutes</option>
          <option>30 minutes</option>
          <option>1 heure</option>
        </select>
      </SettingRow>
      <SettingRow label="Partage externe sécurisé" sub="Autoriser la génération de liens de partage temporaires">
        <Toggle defaultOn={true} />
      </SettingRow>
      <SettingRow label="Expiration automatique des liens" sub="Durée maximale d'un lien de partage externe">
        <select className="input" defaultValue="7 jours" style={{ width: 160, height: 34, fontSize: 13, padding: '0 10px' }}>
          <option>24 heures</option>
          <option>7 jours</option>
          <option>30 jours</option>
        </select>
      </SettingRow>
      <SettingRow label="Journalisation renforcée" sub="Conserver les logs d'accès pendant 5 ans (conformité Qualiopi)">
        <Toggle defaultOn={true} />
      </SettingRow>
      <SettingRow label="Restriction IP" sub="Limiter l'accès à des plages d'adresses IP spécifiques">
        <Toggle defaultOn={false} />
      </SettingRow>
      <SettingRow label="Filigrane automatique" sub="Ajouter un filigrane nom+date sur les PDF téléchargés">
        <Toggle defaultOn={false} />
      </SettingRow>
    </div>
    <div className="card-ft">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="shield" size={13} style={{ color: 'var(--ok)' }} />
        <span className="micro">Hébergement OVHcloud France · ISO 27001 · RGPD</span>
      </div>
      <button className="btn primary sm" onClick={onSave}>Enregistrer</button>
    </div>
  </div>
);

const OrgTab = ({ onSave }) => (
  <div className="card">
    <div className="card-hd"><h2>Organisation</h2></div>
    <div style={{ padding: '0 22px' }}>
      <SettingRow label="Nom de l'organisation">
        <input className="input" defaultValue="CFA Horizon Réunion" style={{ width: 260 }} />
      </SettingRow>
      <SettingRow label="N° de déclaration d'activité">
        <input className="input mono" defaultValue="974-OF-001234" style={{ width: 200 }} />
      </SettingRow>
      <SettingRow label="Domaine e-mail autorisé" sub="Seules les adresses de ce domaine peuvent être invitées">
        <input className="input" defaultValue="cfa-horizon.re" style={{ width: 200 }} />
      </SettingRow>
      <SettingRow label="Certification Qualiopi" sub="Affiche le badge Qualiopi dans l'interface">
        <Toggle defaultOn={true} />
      </SettingRow>
      <SettingRow label="Langue de l'interface">
        <select className="input" defaultValue="Français" style={{ width: 160, height: 34, fontSize: 13, padding: '0 10px' }}>
          <option>Français</option>
          <option>English</option>
          <option>Réunionnais créole</option>
        </select>
      </SettingRow>
    </div>
    <div className="card-ft"><span /><button className="btn primary sm" onClick={onSave}>Enregistrer</button></div>
  </div>
);

const StorageTab = () => (
  <div className="col" style={{ gap: 18 }}>
    <div className="card">
      <div className="card-hd"><h2>Stockage</h2></div>
      <div style={{ padding: '16px 22px' }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 500 }}>Espace utilisé</span>
          <span className="mono" style={{ fontSize: 13 }}>4,2 Go / 50 Go</span>
        </div>
        <div style={{ height: 10, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ width: '8.4%', height: '100%', background: 'var(--accent)', borderRadius: 999 }} />
        </div>
        <div className="micro">Il vous reste 45,8 Go disponibles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 18 }}>
          {[
            { l: 'Documents PDF',  v: '2,1 Go', pct: 50, c: '#ef4444' },
            { l: 'Documents Word', v: '1,4 Go', pct: 33, c: '#2563eb' },
            { l: 'Tableurs',       v: '0,4 Go', pct: 9,  c: '#16a34a' },
            { l: 'Autres',         v: '0,3 Go', pct: 8,  c: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="kpi">
              <div className="label"><span>{s.l}</span><span style={{ width: 8, height: 8, borderRadius: 2, background: s.c }} /></div>
              <div className="value" style={{ fontSize: 18 }}>{s.v}</div>
              <div className="delta">{s.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="card">
      <div className="card-hd"><h2>Sauvegardes automatiques</h2><Badge kind="ok" dot>Actives</Badge></div>
      <div style={{ padding: '0 22px' }}>
        <SettingRow label="Fréquence des sauvegardes">
          <select className="input" defaultValue="Quotidienne" style={{ width: 160, height: 34, fontSize: 13, padding: '0 10px' }}>
            <option>Quotidienne</option>
            <option>Hebdomadaire</option>
          </select>
        </SettingRow>
        <SettingRow label="Rétention" sub="Durée de conservation des sauvegardes">
          <select className="input" defaultValue="90 jours" style={{ width: 160, height: 34, fontSize: 13, padding: '0 10px' }}>
            <option>30 jours</option>
            <option>90 jours</option>
            <option>1 an</option>
          </select>
        </SettingRow>
        <SettingRow label="Dernière sauvegarde" sub="Sauvegarde complète réussie">
          <span className="mono" style={{ fontSize: 13, color: 'var(--ok)' }}>15 mars 2026 · 03:00</span>
        </SettingRow>
      </div>
      <div className="card-ft"><span className="micro">Hébergé en France · OVHcloud SBG3</span><button className="btn sm">Télécharger une sauvegarde</button></div>
    </div>
  </div>
);

const IntegrationsTab = ({ onShowToast }) => (
  <div className="card">
    <div className="card-hd"><h2>Intégrations</h2></div>
    <div>
      {[
        { name: 'Google Workspace',           desc: 'Connexion SSO et import de fichiers Google Drive',                      active: true,  logo: 'G' },
        { name: 'Microsoft 365 / SharePoint', desc: 'Authentification Azure AD, import OneDrive',                            active: false, logo: 'M' },
        { name: 'OPCO Akto — API financement',desc: 'Récupération automatique des dossiers de financement',                  active: true,  logo: 'A' },
        { name: 'DocuSign / Yousign',         desc: 'Signature électronique qualifiée intégrée (eIDAS)',                     active: false, logo: 'D' },
        { name: 'Mon Compte Formation (CPF)', desc: 'Synchronisation des dossiers CPF apprenants',                           active: false, logo: 'C' },
        { name: 'Sylae — DDFIP Réunion',      desc: 'Transmission automatique des justificatifs de formation',               active: false, logo: 'S' },
      ].map((intg, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: intg.active ? 'var(--accent-soft)' : 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: intg.active ? 'var(--accent)' : 'var(--ink-3)', flexShrink: 0 }}>
            {intg.logo}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{intg.name}</div>
            <div className="micro" style={{ marginTop: 2 }}>{intg.desc}</div>
          </div>
          <Badge kind={intg.active ? 'ok' : 'neutral'} dot>{intg.active ? 'Connecté' : 'Disponible'}</Badge>
          <button className="btn sm" onClick={() => onShowToast({ message: intg.active ? `${intg.name} déconnecté` : `Connexion à ${intg.name} initialisée`, icon: intg.active ? 'x' : 'check' })}>
            {intg.active ? 'Configurer' : 'Connecter'}
          </button>
        </div>
      ))}
    </div>
  </div>
);

const NotifsSettingsTab = ({ onSave }) => (
  <div className="card">
    <div className="card-hd"><h2>Notifications</h2></div>
    <div style={{ padding: '0 22px' }}>
      {[
        { l: 'Notifications in-app',                        sub: "Alertes dans l'interface",                       on: true },
        { l: 'E-mail récapitulatif quotidien',              sub: 'Envoyé chaque matin à 08h00',                    on: true },
        { l: 'E-mail immédiat pour validations urgentes',   sub: "Dès qu'une validation vous est demandée",        on: true },
        { l: "Alertes d'expiration (30 jours avant)",       sub: "Documents, pièces d'identité, assurances",       on: true },
        { l: 'Alertes Qualiopi',                            sub: 'Pièces manquantes, préparation audit',           on: true },
        { l: 'Notifications de connexion externe',          sub: "Lorsqu'un auditeur accède à un lien partagé",    on: false },
      ].map((r, i) => (
        <SettingRow key={i} label={r.l} sub={r.sub}><Toggle defaultOn={r.on} /></SettingRow>
      ))}
    </div>
    <div className="card-ft"><span /><button className="btn primary sm" onClick={onSave}>Enregistrer</button></div>
  </div>
);

const BillingTab = () => (
  <div className="col" style={{ gap: 18 }}>
    <div className="card">
      <div style={{ padding: '22px 24px', background: 'linear-gradient(135deg, #0b0f1a 0%, #1e2d5a 100%)', borderRadius: '14px 14px 0 0', color: '#fff' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="micro" style={{ color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>PLAN ACTUEL</div>
            <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 4 }}>Mar'my GED Pro</h2>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.7)' }}>50 Go · utilisateurs illimités · Qualiopi inclus</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>149 €</div>
            <div className="micro" style={{ color: 'rgba(255,255,255,.5)' }}>/ mois HT</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 22px' }}>
        <SettingRow label="Prochain renouvellement"><span className="mono" style={{ fontSize: 13 }}>01/04/2026</span></SettingRow>
        <SettingRow label="Utilisateurs actifs"><span className="mono" style={{ fontSize: 13 }}>7 / illimités</span></SettingRow>
        <SettingRow label="Stockage utilisé"><span className="mono" style={{ fontSize: 13 }}>4,2 Go / 50 Go</span></SettingRow>
        <SettingRow label="Facturation"><span className="mono" style={{ fontSize: 13 }}>Mensuelle · prélèvement</span></SettingRow>
      </div>
      <div className="card-ft">
        <button className="btn sm">Voir les factures</button>
        <button className="btn sm primary">Passer à Enterprise</button>
      </div>
    </div>
  </div>
);

export default SettingsScreen;
