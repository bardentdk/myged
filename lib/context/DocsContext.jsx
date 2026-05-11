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

const INITIAL_CONTENT = {
  d1: `<h1>Convention de Formation Professionnelle</h1><h2>TP Secrétaire Assistant — Session 2026</h2><p><strong>Entre les soussignés :</strong></p><p><strong>CFA Horizon Réunion</strong>, organisme de formation enregistré sous le n° 98974021898, dont le siège est situé au 12 rue de la Victoire, 97400 Saint-Denis de La Réunion, représenté par M. Jean-Baptiste Fontaine, Directeur, ci-après dénommé <em>« l'Organisme »</em>,</p><p><strong>Et :</strong></p><p>L'entreprise partenaire, ci-après dénommée <em>« l'Employeur »</em>,</p><h2>Article 1 — Objet de la convention</h2><p>La présente convention a pour objet de définir les conditions dans lesquelles l'Organisme assure la formation professionnelle du salarié dans le cadre du Titre Professionnel Secrétaire Assistant (RNCP 37873), session 2026.</p><h2>Article 2 — Nature et durée de la formation</h2><p>La formation se déroule du <strong>6 janvier 2026</strong> au <strong>30 juin 2026</strong>, soit une durée totale de <strong>840 heures</strong> réparties comme suit :</p><ul><li>560 heures de formation en centre</li><li>280 heures de mise en situation professionnelle (MSPC)</li></ul><h2>Article 3 — Financement</h2><p>La prise en charge financière est assurée par <strong>OPCO Akto</strong>, conformément aux dispositions relatives aux conventions de formation passées avec l'OPCO Akto (barème 2026 mis à jour). Le n° d'enregistrement Qualiopi est le <strong>2024/97974/R</strong>.</p><h2>Article 4 — Obligations des parties</h2><p>L'Organisme s'engage à :</p><ol><li>Assurer les enseignements conformément au référentiel du TP Secrétaire Assistant</li><li>Tenir les feuilles d'émargement à disposition de l'OPCO</li><li>Délivrer les attestations de formation dans les délais prévus</li></ol><h2>Article 5 — Clauses diverses</h2><p>Toute modification à la présente convention devra faire l'objet d'un avenant signé par les deux parties. La présente convention est établie en deux exemplaires originaux.</p><p>Fait à Saint-Denis de La Réunion, le 15 janvier 2026.</p>`,
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
    case 'UPDATE_CONTENT':
      return { ...state, contents: { ...state.contents, [action.docId]: action.content } };
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
    contents: INITIAL_CONTENT,
  });

  return (
    <DocsContext.Provider value={{
      docs: state.docs,
      comments: state.comments,
      versions: state.versions,
      contents: state.contents,
      updateDoc:     (id, changes)         => dispatch({ type: 'UPDATE_DOC', id, changes }),
      addDoc:        (doc)                  => dispatch({ type: 'ADD_DOC', doc }),
      deleteDoc:     (id)                   => dispatch({ type: 'DELETE_DOC', id }),
      addComment:    (docId, comment)       => dispatch({ type: 'ADD_COMMENT', docId, comment }),
      deleteComment: (docId, commentId)     => dispatch({ type: 'DELETE_COMMENT', docId, commentId }),
      addVersion:    (docId, version)       => dispatch({ type: 'ADD_VERSION', docId, version }),
      updateContent: (docId, content)       => dispatch({ type: 'UPDATE_CONTENT', docId, content }),
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
