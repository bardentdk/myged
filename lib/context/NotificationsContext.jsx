'use client';

import { createContext, useContext, useReducer } from 'react';

const INITIAL = [
  { id: 'n1',  type: 'unlock',   icon: 'unlock',      title: 'Document libéré',                       body: 'Sylvie Hoarau a libéré « Convention TP SA 2026 ». Vous pouvez maintenant le modifier.',                                    who: 'sylvie',  when: 'il y a 2 min',        read: false, docId: 'd1' },
  { id: 'n2',  type: 'review',   icon: 'checkCircle', title: 'Validation demandée',                   body: 'Anne Payet vous demande de valider « Feuille émargement — 12 mars 2026 ».',                                               who: 'anne',    when: 'il y a 1 h',          read: false, docId: 'd2' },
  { id: 'n3',  type: 'mention',  icon: 'msg',         title: 'Mention dans un commentaire',           body: 'Thierry Bègue vous a mentionné dans « Indicateur 11 » : "@Anne merci de vérifier l\'assiduité de Jean Payet."',           who: 'thierry', when: 'il y a 3 h',          read: false, docId: 'd7' },
  { id: 'n4',  type: 'expiring', icon: 'clock',       title: 'Document expire dans 21 jours',         body: '« Assurance RC professionnelle 2025-2026 » expire le 01/06/2026. Pensez à le renouveler.',                               who: null,      when: "aujourd'hui · 09:00",  read: false, docId: 'd9' },
  { id: 'n5',  type: 'version',  icon: 'upload',      title: 'Nouvelle version disponible',           body: 'Sylvie Hoarau a publié la version 2.3 de « Convention TP SA 2026 ».',                                                    who: 'sylvie',  when: "aujourd'hui · 14:32",  read: false, docId: 'd1' },
  { id: 'n6',  type: 'share',    icon: 'share',       title: 'Document partagé avec vous',            body: 'Jean-Baptiste Fontaine vous a partagé « Plan de formation 2026 — Direction » en lecture seule.',                          who: 'jb',      when: 'hier · 16:44',         read: true,  docId: null },
  { id: 'n7',  type: 'validated',icon: 'check',       title: 'Document validé',                       body: 'Jean-Baptiste Fontaine a validé « Bilan pédagogique Q4 2025 ».',                                                         who: 'jb',      when: 'hier · 17:08',         read: true,  docId: null },
  { id: 'n8',  type: 'expiring', icon: 'warn',        title: "Pièce d'identité arrive à expiration",  body: '« Pièce identité — Jean Payet » expire le 12/06/2027. Demandez le renouvellement.',                                      who: null,      when: 'il y a 2 j',           read: true,  docId: 'd5' },
  { id: 'n9',  type: 'lock',     icon: 'lock',        title: 'Document verrouillé',                   body: 'Mélanie Grondin a verrouillé « Bilan pédagogique Q1 — Saint-Pierre ».',                                                  who: 'melanie', when: 'il y a 2 j',           read: true,  docId: null },
  { id: 'n10', type: 'qualiopi', icon: 'shield',      title: 'Alerte Qualiopi',                       body: 'Indicateur 19 bloqué : 2 pièces manquantes. Audit dans 14 jours.',                                                       who: null,      when: 'il y a 3 j',           read: true,  docId: null },
];

function reducer(state, action) {
  switch (action.type) {
    case 'MARK_READ':
      return state.map((n) => n.id === action.id ? { ...n, read: true } : n);
    case 'MARK_ALL_READ':
      return state.map((n) => ({ ...n, read: true }));
    case 'DISMISS':
      return state.filter((n) => n.id !== action.id);
    case 'ADD':
      return [action.notification, ...state];
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, dispatch] = useReducer(reducer, INITIAL);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Ctx.Provider value={{
      notifications,
      unreadCount,
      markRead:    (id)  => dispatch({ type: 'MARK_READ', id }),
      markAllRead: ()    => dispatch({ type: 'MARK_ALL_READ' }),
      dismiss:     (id)  => dispatch({ type: 'DISMISS', id }),
      add:         (n)   => dispatch({ type: 'ADD', notification: { ...n, id: `n${Date.now()}`, read: false } }),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
