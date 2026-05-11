export const USERS = {
  sylvie:   { id: 'sylvie',   name: 'Sylvie Hoarau',          role: 'Responsable administrative', color: '#0ea5e9' },
  anne:     { id: 'anne',     name: 'Anne Payet',             role: 'Assistante administrative',  color: '#f59e0b' },
  jb:       { id: 'jb',       name: 'Jean-Baptiste Fontaine', role: 'Directeur',                  color: '#10b981' },
  melanie:  { id: 'melanie',  name: 'Mélanie Grondin',        role: 'Responsable pédagogique',    color: '#ef4444' },
  thierry:  { id: 'thierry',  name: 'Thierry Bègue',          role: 'Référent Qualiopi',          color: '#8b5cf6' },
  marie:    { id: 'marie',    name: 'Marie Técher',           role: 'Formatrice',                 color: '#ec4899' },
  audit:    { id: 'audit',    name: 'Auditeur AFNOR',         role: 'Auditeur externe',           color: '#64748b' },
};

export const ME = USERS.anne;

export const DOCS = [
  { id: 'd1', name: 'Convention TP Secrétaire Assistant 2026.docx', type: 'doc', folder: 'Sessions / TP Secrétaire Assistant 2026', size: '142 Ko', version: '2.3', status: 'review', owner: 'sylvie', updatedBy: 'sylvie', updatedAt: 'il y a 8 min', tags: ['convention', 'session-2026'], confidential: 'Interne', expires: '15/03/2026', lockedBy: 'sylvie', lockedSince: '14:32' },
  { id: 'd2', name: 'Feuille émargement — 12 mars 2026.pdf',         type: 'pdf', folder: 'Sessions / TP Secrétaire Assistant 2026 / Émargements', size: '88 Ko',  version: '1.0', status: 'validated', owner: 'anne',   updatedBy: 'anne',   updatedAt: 'il y a 1 h',   tags: ['émargement', 'qualiopi'], confidential: 'Interne', expires: null },
  { id: 'd3', name: 'Attestation formation — Jean Payet.pdf',        type: 'pdf', folder: 'Apprenants / Jean Payet',                 size: '54 Ko',  version: '1.1', status: 'validated', owner: 'melanie',updatedBy: 'melanie',updatedAt: 'hier 17:42',  tags: ['attestation'], confidential: 'Confidentiel', expires: null },
  { id: 'd4', name: 'Bilan pédagogique session SDS — Q1 2026.xlsx',  type: 'xls', folder: 'Sessions / Saint-Denis Q1',               size: '312 Ko', version: '0.4', status: 'draft',     owner: 'melanie',updatedBy: 'melanie',updatedAt: 'il y a 2 j',  tags: ['bilan'], confidential: 'Interne', expires: null },
  { id: 'd5', name: 'Pièce identité — Jean Payet.pdf',               type: 'pdf', folder: 'Apprenants / Jean Payet',                 size: '1.8 Mo', version: '1.0', status: 'validated', owner: 'anne',   updatedBy: 'anne',   updatedAt: 'il y a 5 j',  tags: ['identité', 'qualiopi'], confidential: 'Confidentiel', expires: '12/06/2027' },
  { id: 'd6', name: 'Contrat de professionnalisation — OPCO Akto.pdf',type:'pdf', folder: 'Financeurs / OPCO Akto',                  size: '226 Ko', version: '3.0', status: 'pending',   owner: 'sylvie', updatedBy: 'sylvie', updatedAt: 'il y a 3 j',  tags: ['contrat', 'financement'], confidential: 'Confidentiel', expires: '01/09/2026' },
  { id: 'd7', name: 'Indicateur 11 — Suivi apprenants 2026.docx',    type: 'doc', folder: 'Qualiopi / Audit 2026',                   size: '64 Ko',  version: '1.4', status: 'review',    owner: 'thierry',updatedBy: 'thierry',updatedAt: 'il y a 12 h', tags: ['qualiopi', 'indicateur-11'], confidential: 'Interne', expires: null },
  { id: 'd8', name: 'Convocation session Saint-Pierre — 18 mars.pdf',type: 'pdf', folder: 'Sessions / Saint-Pierre',                 size: '92 Ko',  version: '1.0', status: 'validated', owner: 'anne',   updatedBy: 'anne',   updatedAt: 'il y a 4 j',  tags: ['convocation'], confidential: 'Interne', expires: '18/03/2026' },
  { id: 'd9', name: 'Assurance RC professionnelle 2025-2026.pdf',    type: 'pdf', folder: 'Administratif / Assurances',              size: '410 Ko', version: '1.0', status: 'expiring',  owner: 'jb',     updatedBy: 'jb',     updatedAt: 'il y a 2 mois',tags: ['assurance'], confidential: 'Confidentiel', expires: '01/06/2026' },
  { id: 'd10', name: 'Fiche formateur — Marie Técher.docx',          type: 'doc', folder: 'RH / Formateurs',                         size: '76 Ko',  version: '2.1', status: 'validated', owner: 'sylvie', updatedBy: 'sylvie', updatedAt: 'il y a 1 sem', tags: ['rh'], confidential: 'Confidentiel', expires: null },
];

export const VERSIONS = [
  { v: '2.3', author: 'sylvie', date: '15 mars 2026 · 14:32', note: 'Mise à jour clauses financement OPCO Akto', current: true, locked: true, size: '142 Ko' },
  { v: '2.2', author: 'sylvie', date: '12 mars 2026 · 09:14', note: 'Correction adresse siège du centre', current: false, size: '141 Ko' },
  { v: '2.1', author: 'anne',   date: '03 mars 2026 · 16:48', note: 'Ajout annexe pédagogique mise à jour', current: false, size: '139 Ko' },
  { v: '2.0', author: 'jb',     date: '01 mars 2026 · 10:22', note: 'Version annuelle 2026 — validée direction', current: false, milestone: true, size: '135 Ko' },
  { v: '1.4', author: 'melanie',date: '18 fév. 2026 · 11:30', note: 'Relecture pédagogique', current: false, size: '128 Ko' },
  { v: '1.3', author: 'anne',   date: '12 fév. 2026 · 14:05', note: 'Première rédaction', current: false, size: '120 Ko' },
];

export const ACTIVITY = [
  { id: 'a1', who: 'sylvie',  verb: 'verrouille',     what: 'Convention TP Secrétaire Assistant 2026',   when: 'il y a 8 min',  type: 'lock' },
  { id: 'a2', who: 'anne',    verb: 'téléverse',      what: 'Feuille émargement — 12 mars 2026',         when: 'il y a 1 h',    type: 'upload' },
  { id: 'a3', who: 'thierry', verb: 'commente',       what: 'Indicateur 11 — Suivi apprenants 2026',     when: 'il y a 12 h',   type: 'comment' },
  { id: 'a4', who: 'jb',      verb: 'valide',         what: 'Bilan pédagogique Q4 2025',                 when: 'hier · 17:08',  type: 'validate' },
  { id: 'a5', who: 'melanie', verb: 'partage avec',   target: 'auditeur AFNOR', what: 'Audit Qualiopi 2026 — checklist', when: 'hier · 14:20', type: 'share' },
  { id: 'a6', who: 'anne',    verb: 'restaure v1.2',  what: 'Convention TP Secrétaire Assistant 2026',   when: 'il y a 2 j',    type: 'restore' },
  { id: 'a7', who: 'sylvie',  verb: 'signe',          what: 'Contrat de professionnalisation — OPCO Akto', when: 'il y a 3 j',  type: 'sign' },
];

export const QUALIOPI = [
  { num: 1,  label: "Information du public sur les prestations",       status: 'ok',      docs: 8,  total: 8,  resp: 'thierry', updated: '08/03/2026' },
  { num: 2,  label: "Identification précise des objectifs",            status: 'ok',      docs: 6,  total: 6,  resp: 'melanie', updated: '07/03/2026' },
  { num: 4,  label: "Adéquation des moyens pédagogiques",              status: 'warn',    docs: 4,  total: 6,  resp: 'melanie', updated: '02/03/2026' },
  { num: 8,  label: "Coordination des intervenants",                   status: 'ok',      docs: 5,  total: 5,  resp: 'thierry', updated: '10/03/2026' },
  { num: 11, label: "Suivi des apprenants — assiduité, évaluations",   status: 'review',  docs: 7,  total: 9,  resp: 'thierry', updated: "aujourd'hui" },
  { num: 19, label: "Veille légale et réglementaire",                  status: 'err',     docs: 1,  total: 3,  resp: 'jb',      updated: '14/01/2026' },
  { num: 22, label: "Recueil et traitement des appréciations",         status: 'ok',      docs: 6,  total: 6,  resp: 'melanie', updated: '11/03/2026' },
  { num: 32, label: "Amélioration continue",                           status: 'warn',    docs: 3,  total: 5,  resp: 'thierry', updated: '28/02/2026' },
];

export const FOLDERS = [
  { id: 'sessions', name: 'Sessions de formation', count: 24, kind: 'session' },
  { id: 'apprenants', name: 'Apprenants', count: 187, kind: 'apprenant' },
  { id: 'entreprises', name: 'Entreprises partenaires', count: 32, kind: 'entreprise' },
  { id: 'financeurs', name: 'Financeurs', count: 9, kind: 'financeur' },
  { id: 'qualiopi', name: 'Qualiopi', count: 56, kind: 'qualiopi' },
  { id: 'rh', name: 'RH & Formateurs', count: 18, kind: 'rh' },
  { id: 'admin', name: 'Administratif', count: 41, kind: 'admin' },
  { id: 'modeles', name: 'Modèles', count: 14, kind: 'modele' },
];

export const STATUS_MAP = {
  draft:     { label: 'Brouillon',         cls: 'b-neutral', dotColor: '#a1a1aa' },
  review:    { label: 'En validation',     cls: 'b-warn',    dotColor: '#b45309' },
  pending:   { label: 'En attente',        cls: 'b-warn',    dotColor: '#b45309' },
  validated: { label: 'Validé',            cls: 'b-ok',      dotColor: '#15803d' },
  rejected:  { label: 'Refusé',            cls: 'b-err',     dotColor: '#b91c1c' },
  archived:  { label: 'Archivé',           cls: 'b-neutral', dotColor: '#a1a1aa' },
  expiring:  { label: 'Expire bientôt',    cls: 'b-warn',    dotColor: '#b45309' },
  expired:   { label: 'Expiré',            cls: 'b-err',     dotColor: '#b91c1c' },
};
