'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Avatar, Badge } from '@/components/ui/Atoms';
import { USERS } from '@/lib/data';
import { useToast } from '@/lib/context/ToastContext';

const ROLE_PERMS = {
  'Super admin':          { read: 1, download: 1, edit: 1, validate: 1, sign: 1, delete: 1, share: 1, confidential: 1 },
  'Direction':            { read: 1, download: 1, edit: 1, validate: 1, sign: 1, delete: 1, share: 1, confidential: 1 },
  'Responsable admin':    { read: 1, download: 1, edit: 1, validate: 1, sign: 1, delete: 0, share: 1, confidential: 1 },
  'Responsable pédago':   { read: 1, download: 1, edit: 1, validate: 1, sign: 0, delete: 0, share: 1, confidential: 0 },
  'Assistant admin':      { read: 1, download: 1, edit: 0, validate: 0, sign: 0, delete: 0, share: 0, confidential: 0 },
  'Formateur':            { read: 1, download: 1, edit: 0, validate: 0, sign: 0, delete: 0, share: 0, confidential: 0 },
  'Référent Qualiopi':    { read: 1, download: 1, edit: 1, validate: 1, sign: 0, delete: 0, share: 1, confidential: 0 },
  'Auditeur Qualiopi':    { read: 1, download: 0, edit: 0, validate: 0, sign: 0, delete: 0, share: 0, confidential: 0 },
  'Apprenant':            { read: 0, download: 0, edit: 0, validate: 0, sign: 0, delete: 0, share: 0, confidential: 0 },
  'Entreprise partenaire':{ read: 0, download: 0, edit: 0, validate: 0, sign: 0, delete: 0, share: 0, confidential: 0 },
};

const ALL_USERS = [
  { id: 'sylvie',  name: 'Sylvie Hoarau',          role: 'Responsable admin', email: 'sylvie.hoarau@cfa-horizon.re',    active: true,  lastLogin: "aujourd'hui · 14:30", color: '#0ea5e9', twofa: true },
  { id: 'anne',    name: 'Anne Payet',              role: 'Assistant admin',   email: 'anne.payet@cfa-horizon.re',       active: true,  lastLogin: "aujourd'hui · 11:50", color: '#f59e0b', twofa: true },
  { id: 'jb',      name: 'Jean-Baptiste Fontaine',  role: 'Direction',         email: 'jb.fontaine@cfa-horizon.re',      active: true,  lastLogin: 'hier · 17:08',        color: '#10b981', twofa: true },
  { id: 'melanie', name: 'Mélanie Grondin',         role: 'Responsable pédago',email: 'melanie.grondin@cfa-horizon.re', active: true,  lastLogin: 'hier · 16:20',        color: '#ef4444', twofa: false },
  { id: 'thierry', name: 'Thierry Bègue',           role: 'Référent Qualiopi', email: 'thierry.begue@cfa-horizon.re',   active: true,  lastLogin: 'il y a 2 j',          color: '#8b5cf6', twofa: true },
  { id: 'marie',   name: 'Marie Técher',            role: 'Formateur',         email: 'marie.techer@cfa-horizon.re',    active: true,  lastLogin: 'il y a 3 j',          color: '#ec4899', twofa: false },
  { id: 'audit',   name: 'Auditeur AFNOR',          role: 'Auditeur Qualiopi', email: 'auditeur@afnor.org',             active: false, lastLogin: '10 mars · 09:12',     color: '#64748b', twofa: false },
];

const PERM_COLS = ['read', 'download', 'edit', 'validate', 'sign', 'delete', 'share', 'confidential'];
const PERM_LABELS = { read: 'Lecture', download: 'Téléch.', edit: 'Modifier', validate: 'Valider', sign: 'Signer', delete: 'Supprimer', share: 'Partager', confidential: 'Conf.' };

export default function UsersScreen() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('users');
  const [selectedRole, setSelectedRole] = useState('Responsable admin');
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');

  const shown = ALL_USERS.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Utilisateurs & permissions</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>{ALL_USERS.filter(u => u.active).length} utilisateurs actifs · {ALL_USERS.length} au total</p>
        </div>
        <button className="btn primary" onClick={() => setShowInvite(true)}>
          <Icon name="plus" size={13} /> Inviter un utilisateur
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: 18 }}>
        <span className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Utilisateurs</span>
        <span className={`tab ${tab === 'roles' ? 'active' : ''}`} onClick={() => setTab('roles')}>Rôles & permissions</span>
      </div>

      {tab === 'users' && (
        <div>
          <div className="card" style={{ padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, height: 34 }}>
              <Icon name="search" size={14} style={{ color: 'var(--ink-3)' }} />
              <input placeholder="Nom, e-mail, rôle…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <select className="input" style={{ width: 'auto', height: 34, fontSize: 13, padding: '0 10px' }}>
              <option value="">Tous les rôles</option>
              {Object.keys(ROLE_PERMS).map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="input" style={{ width: 'auto', height: 34, fontSize: 13, padding: '0 10px' }}>
              <option>Tous les statuts</option>
              <option>Actifs</option>
              <option>Inactifs</option>
            </select>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="t">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th>Utilisateur</th>
                  <th style={{ width: 180 }}>Rôle</th>
                  <th style={{ width: 240 }}>E-mail</th>
                  <th style={{ width: 80, textAlign: 'center' }}>2FA</th>
                  <th style={{ width: 90, textAlign: 'center' }}>Statut</th>
                  <th style={{ width: 160 }}>Dernière connexion</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {shown.map(u => (
                  <tr key={u.id}>
                    <td><Avatar user={u} size="md" /></td>
                    <td className="col-name">{u.name}</td>
                    <td><Badge kind="neutral">{u.role}</Badge></td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{u.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      {u.twofa
                        ? <Icon name="shield" size={14} style={{ color: 'var(--ok)' }} />
                        : <Icon name="warn" size={14} style={{ color: 'var(--warn)' }} />}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {u.active
                        ? <Badge kind="ok" dot>Actif</Badge>
                        : <Badge kind="neutral" dot>Inactif</Badge>}
                    </td>
                    <td className="micro mono">{u.lastLogin}</td>
                    <td>
                      <div className="row" style={{ gap: 4 }}>
                        <button className="btn ghost sm" style={{ padding: 4 }}><Icon name="edit" size={13} /></button>
                        <button className="btn ghost sm" style={{ padding: 4 }}><Icon name="more" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 18 }}>
          <div className="card" style={{ padding: '8px 0', height: 'fit-content' }}>
            {Object.keys(ROLE_PERMS).map(r => (
              <div key={r}
                onClick={() => setSelectedRole(r)}
                style={{
                  padding: '10px 16px', cursor: 'pointer', fontSize: 13,
                  background: selectedRole === r ? 'var(--surface-2)' : 'transparent',
                  fontWeight: selectedRole === r ? 500 : 400,
                  borderLeft: selectedRole === r ? '3px solid var(--accent)' : '3px solid transparent',
                  color: selectedRole === r ? 'var(--ink)' : 'var(--ink-2)',
                }}>
                {r}
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-hd">
              <h2>{selectedRole}</h2>
              <button className="btn sm primary"><Icon name="edit" size={12} /> Modifier le rôle</button>
            </div>
            <div style={{ padding: 22 }}>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '0 0 18px' }}>
                Membres avec ce rôle : <strong>{ALL_USERS.filter(u => u.role.includes(selectedRole.split(' ')[0])).length}</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {PERM_COLS.map(p => {
                  const on = ROLE_PERMS[selectedRole]?.[p];
                  return (
                    <div key={p} style={{
                      padding: '14px 16px', borderRadius: 10,
                      background: on ? 'var(--ok-soft)' : 'var(--surface-2)',
                      border: `1px solid ${on ? '#9fd3b5' : 'var(--line)'}`,
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: on ? 'var(--ok)' : 'var(--surface-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name={on ? 'check' : 'x'} size={14} style={{ color: on ? '#fff' : 'var(--ink-4)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{PERM_LABELS[p]}</div>
                        <div className="micro">{on ? 'Autorisé' : 'Refusé'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                  <Icon name="users" size={14} style={{ color: 'var(--ink-3)' }} />
                  <span style={{ fontWeight: 500, fontSize: 13 }}>Utilisateurs avec ce rôle</span>
                </div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  {ALL_USERS.filter(u => u.role.toLowerCase().includes(selectedRole.split(' ')[0].toLowerCase())).map(u => (
                    <div key={u.id} className="row" style={{ gap: 6, padding: '4px 10px', background: '#fff', border: '1px solid var(--line)', borderRadius: 999, fontSize: 13 }}>
                      <Avatar user={u} size="xs" />
                      <span>{u.name.split(' ')[0]}</span>
                    </div>
                  ))}
                  {ALL_USERS.filter(u => u.role.toLowerCase().includes(selectedRole.split(' ')[0].toLowerCase())).length === 0 && (
                    <span className="muted" style={{ fontSize: 13 }}>Aucun utilisateur pour ce rôle</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="modal-bg" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}><h2>Inviter un utilisateur</h2></div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="label">Adresse e-mail *</label><input className="input" type="email" placeholder="prenom.nom@cfa-horizon.re" /></div>
              <div><label className="label">Prénom et nom</label><input className="input" placeholder="Prénom Nom" /></div>
              <div>
                <label className="label">Rôle *</label>
                <select className="input">
                  {Object.keys(ROLE_PERMS).map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ padding: 12, background: 'var(--accent-soft)', borderRadius: 8, fontSize: 13, color: 'var(--accent-ink)' }}>
                <Icon name="info" size={13} /> Un e-mail d'invitation sera envoyé avec un lien de connexion sécurisé (expire sous 48 h).
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowInvite(false)}>Annuler</button>
              <button className="btn primary" onClick={() => { setShowInvite(false); showToast({ message: 'Invitation envoyée avec succès', icon: 'send' }); }}>
                <Icon name="send" size={13} /> Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
