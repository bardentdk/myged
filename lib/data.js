// ─── Display helpers (legacy fallback for any hardcoded IDs) ───────────────
// Real user data comes from Supabase `profiles` table via DocsContext.profiles
export const USERS = {
  sylvie:  { id: 'sylvie',  name: 'Sylvie Hoarau',          role: 'Responsable administrative', color: '#0ea5e9' },
  anne:    { id: 'anne',    name: 'Anne Payet',              role: 'Assistante administrative',  color: '#f59e0b' },
  jb:      { id: 'jb',      name: 'Jean-Baptiste Fontaine',  role: 'Directeur',                  color: '#10b981' },
  melanie: { id: 'melanie', name: 'Mélanie Grondin',         role: 'Responsable pédagogique',    color: '#ef4444' },
  thierry: { id: 'thierry', name: 'Thierry Bègue',           role: 'Référent Qualiopi',          color: '#8b5cf6' },
  marie:   { id: 'marie',   name: 'Marie Técher',            role: 'Formatrice',                 color: '#ec4899' },
  audit:   { id: 'audit',   name: 'Auditeur AFNOR',          role: 'Auditeur externe',           color: '#64748b' },
};

// ME is used as a display fallback. Use useUser() for the real authenticated user.
export const ME = USERS.anne;

// ─── Document status display ─────────────────────────────────────────────────
export const STATUS_MAP = {
  draft:     { label: 'Brouillon',     kind: 'neutral' },
  review:    { label: 'En validation', kind: 'warn'    },
  pending:   { label: 'En attente',    kind: 'warn'    },
  validated: { label: 'Validé',        kind: 'ok'      },
  rejected:  { label: 'Refusé',        kind: 'err'     },
  archived:  { label: 'Archivé',       kind: 'neutral' },
  expiring:  { label: 'Expire bientôt',kind: 'warn'    },
  expired:   { label: 'Expiré',        kind: 'err'     },
};

// ─── Folder display structure ─────────────────────────────────────────────────
export const FOLDERS = [
  { id: 'f1', name: 'Sessions',       kind: 'folder', children: [
    { id: 'f2', name: 'TP Secrétaire Assistant 2026', kind: 'folder' },
    { id: 'f3', name: 'Saint-Pierre',                 kind: 'folder' },
  ]},
  { id: 'f4', name: 'Apprenants',     kind: 'folder' },
  { id: 'f5', name: 'Financeurs',     kind: 'folder', children: [
    { id: 'f6', name: 'OPCO Akto',    kind: 'folder' },
  ]},
  { id: 'f7', name: 'Qualiopi',       kind: 'folder', children: [
    { id: 'f8', name: 'Audit 2026',   kind: 'folder' },
  ]},
  { id: 'f9', name: 'Administratif',  kind: 'folder' },
  { id: 'f10', name: 'RH',            kind: 'folder' },
  { id: 'f11', name: 'Modèles',       kind: 'folder' },
];

// ─── Qualiopi standard indicators (static reference, not user data) ──────────
export const QUALIOPI = [
  { num: 1,  label: 'Information du public sur les prestations',                 status: 'warn', docs: 0, total: 8,  resp: 'thierry', updated: '—' },
  { num: 2,  label: 'Identification précise des objectifs de la prestation',     status: 'warn', docs: 0, total: 6,  resp: 'melanie', updated: '—' },
  { num: 4,  label: 'Adéquation des moyens pédagogiques, techniques et humains', status: 'warn', docs: 0, total: 6,  resp: 'melanie', updated: '—' },
  { num: 8,  label: 'Coordination des intervenants et des partenaires',          status: 'warn', docs: 0, total: 5,  resp: 'thierry', updated: '—' },
  { num: 11, label: 'Suivi des apprenants — assiduité, évaluations',             status: 'warn', docs: 0, total: 9,  resp: 'thierry', updated: '—' },
  { num: 19, label: 'Veille légale et réglementaire',                            status: 'warn', docs: 0, total: 3,  resp: 'thierry', updated: '—' },
  { num: 22, label: 'Recueil et traitement des réclamations',                    status: 'warn', docs: 0, total: 3,  resp: 'sylvie',  updated: '—' },
  { num: 32, label: 'Amélioration continue de la prestation',                    status: 'warn', docs: 0, total: 4,  resp: 'jb',      updated: '—' },
];

// ─── These were removed (now live in Supabase) — kept as empty fallbacks ────
export const ACTIVITY = [];
export const DOCS     = [];
export const VERSIONS = [];

// ─── Document templates (static catalogue) ──────────────────────────────────
export const TEMPLATES = [
  { id: 't1', name: 'Convention de formation', category: 'Contrats & Conventions', type: 'doc', version: '2.1', uses: 0, desc: 'Convention type pour formations qualifiantes et certifiantes', tags: ['convention', 'qualiopi'] },
  { id: 't2', name: "Feuille d'émargement",   category: 'Sessions & Présences',   type: 'pdf', version: '1.3', uses: 0, desc: 'Émargement quotidien conforme aux exigences Qualiopi indicateur 11', tags: ['émargement', 'qualiopi'] },
  { id: 't3', name: 'Attestation de formation', category: 'Attestations',           type: 'doc', version: '1.0', uses: 0, desc: "Attestation de suivi de formation remise à l'apprenant en fin de parcours", tags: ['attestation'] },
  { id: 't4', name: 'Bilan pédagogique',       category: 'Bilans & Rapports',      type: 'xls', version: '1.4', uses: 0, desc: 'Tableau de bord pédagogique trimestriel', tags: ['bilan'] },
  { id: 't5', name: 'Fiche de positionnement', category: 'Évaluation',             type: 'doc', version: '1.1', uses: 0, desc: "Positionnement initial de l'apprenant", tags: ['qualiopi', 'évaluation'] },
  { id: 't6', name: 'Programme de formation',  category: 'Pédagogie',              type: 'doc', version: '3.0', uses: 0, desc: 'Programme détaillé par module et par session', tags: ['programme', 'qualiopi'] },
];
