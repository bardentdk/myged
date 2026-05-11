'use client';

import { createContext, useContext, useReducer } from 'react';
import { DOCS as INITIAL_DOCS, VERSIONS as INITIAL_VERSIONS } from '@/lib/data';

const INITIAL_COMMENTS = {
  d1: [
    { id: 'c1', who: 'thierry', text: "J'ai besoin du n° d'enregistrement Qualiopi à jour avant validation finale.", when: 'il y a 3 j', ts: 1710000000000 },
    { id: 'c2', who: 'sylvie',  text: "Bien noté. Je l'intègre dans la prochaine version cet après-midi.", when: 'il y a 3 j', ts: 1710001000000 },
    { id: 'c3', who: 'jb',      text: "Pensez à vérifier les clauses de financement OPCO — Akto a mis à jour son barème.", when: 'il y a 1 j', ts: 1710100000000 },
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DOC':
      return {
        ...state,
        docs: state.docs.map(d =>
          d.id === action.id ? { ...d, ...action.changes, updatedAt: "à l'instant", updatedBy: 'anne' } : d
        ),
      };
    case 'ADD_DOC':
      return { ...state, docs: [action.doc, ...state.docs] };
    case 'DELETE_DOC':
      return { ...state, docs: state.docs.filter(d => d.id !== action.id) };
    case 'ADD_COMMENT': {
      const prev = state.comments[action.docId] || [];
      return { ...state, comments: { ...state.comments, [action.docId]: [...prev, action.comment] } };
    }
    case 'DELETE_COMMENT': {
      const prev = state.comments[action.docId] || [];
      return { ...state, comments: { ...state.comments, [action.docId]: prev.filter(c => c.id !== action.commentId) } };
    }
    case 'ADD_VERSION': {
      const prev = (state.versions[action.docId] || []).map(v => ({ ...v, current: false }));
      return { ...state, versions: { ...state.versions, [action.docId]: [{ ...action.version, current: true }, ...prev] } };
    }
    default:
      return state;
  }
}

const DocsContext = createContext(null);

export function DocsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    docs: INITIAL_DOCS,
    comments: INITIAL_COMMENTS,
    versions: { d1: INITIAL_VERSIONS },
  });

  return (
    <DocsContext.Provider value={{
      docs: state.docs,
      comments: state.comments,
      versions: state.versions,
      updateDoc:     (id, changes)         => dispatch({ type: 'UPDATE_DOC', id, changes }),
      addDoc:        (doc)                  => dispatch({ type: 'ADD_DOC', doc }),
      deleteDoc:     (id)                   => dispatch({ type: 'DELETE_DOC', id }),
      addComment:    (docId, comment)       => dispatch({ type: 'ADD_COMMENT', docId, comment }),
      deleteComment: (docId, commentId)     => dispatch({ type: 'DELETE_COMMENT', docId, commentId }),
      addVersion:    (docId, version)       => dispatch({ type: 'ADD_VERSION', docId, version }),
    }}>
      {children}
    </DocsContext.Provider>
  );
}

export function useDocs() {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error('useDocs must be used within DocsProvider');
  return ctx;
}
