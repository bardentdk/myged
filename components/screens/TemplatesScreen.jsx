'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Badge, FileIcon } from '@/components/ui/Atoms';
import { useToast } from '@/lib/context/ToastContext';

const TEMPLATES = [
  { id: 't1',  name: 'Convention de formation professionnelle',  category: 'Administratif',  type: 'doc', uses: 34, updated: '01 mars 2026',  version: '3.2', desc: 'Convention type conforme Code du travail art. L.6353-1, pré-remplie avec les champs du centre.' },
  { id: 't2',  name: 'Convocation apprenant',                    category: 'Administratif',  type: 'doc', uses: 58, updated: '15 fév. 2026',  version: '1.4', desc: 'Convocation individuelle avec champs : session, dates, lieu, formateur référent.' },
  { id: 't3',  name: "Feuille d'émargement hebdomadaire",        category: 'Pédagogie',      type: 'pdf', uses: 92, updated: '20 janv. 2026', version: '2.1', desc: 'Feuille de présence conforme Qualiopi avec signature individuelle par demi-journée.' },
  { id: 't4',  name: 'Attestation de formation',                 category: 'Administratif',  type: 'doc', uses: 41, updated: '01 fév. 2026',  version: '2.0', desc: 'Attestation de suivi de formation avec mention des heures et objectifs atteints.' },
  { id: 't5',  name: 'Bilan pédagogique de fin de session',      category: 'Pédagogie',      type: 'doc', uses: 18, updated: '10 mars 2026',  version: '1.3', desc: 'Synthèse qualitative et quantitative de session : taux de présence, résultats, commentaires.' },
  { id: 't6',  name: 'Contrat de professionnalisation',          category: 'RH & Contrats',  type: 'doc', uses: 12, updated: '15 janv. 2026', version: '4.1', desc: 'Contrat pro type avec grilles OPCO Akto intégrées, clauses financement région.' },
  { id: 't7',  name: 'Fiche de positionnement apprenant',        category: 'Pédagogie',      type: 'doc', uses: 29, updated: '05 fév. 2026',  version: '1.6', desc: "Évaluation d'entrée : compétences actuelles, objectifs, plan personnalisé." },
  { id: 't8',  name: 'Courrier de relance financeur',            category: 'Administratif',  type: 'doc', uses: 8,  updated: '12 fév. 2026',  version: '1.0', desc: 'Relance dossier financement auprès OPCO / Région Réunion avec récapitulatif pièces manquantes.' },
  { id: 't9',  name: 'Checklist audit Qualiopi',                 category: 'Qualiopi',       type: 'xls', uses: 4,  updated: '01 mars 2026',  version: '2.3', desc: "Grille de préparation audit : 32 indicateurs, colonnes statut / pièces / responsable." },
  { id: 't10', name: 'Programme de formation détaillé',          category: 'Pédagogie',      type: 'doc', uses: 22, updated: '08 mars 2026',  version: '1.2', desc: "Programme jour par jour, séquences pédagogiques, modalités d'évaluation." },
  { id: 't11', name: "Rapport d'enquête satisfaction",           category: 'Qualiopi',       type: 'doc', uses: 16, updated: '20 fév. 2026',  version: '1.1', desc: "Formulaire de satisfaction apprenant + grille d'analyse résultats pour Qualiopi indicateur 22." },
  { id: 't12', name: 'Fiche de poste formateur',                 category: 'RH & Contrats',  type: 'doc', uses: 7,  updated: '18 jan. 2026',  version: '1.0', desc: 'Profil de poste formateur avec compétences requises, missions, rattachement hiérarchique.' },
];

const CATEGORIES = ['Tous', 'Administratif', 'Pédagogie', 'RH & Contrats', 'Qualiopi'];

export default function TemplatesScreen() {
  const { showToast } = useToast();
  const [cat, setCat] = useState('Tous');
  const [searchQ, setSearchQ] = useState('');
  const [view, setView] = useState('grid');
  const [previewTpl, setPreviewTpl] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const shown = TEMPLATES.filter(t => {
    if (cat !== 'Tous' && t.category !== cat) return false;
    if (searchQ && !t.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const useTemplate = (tpl) => {
    showToast({ message: `Nouveau document créé depuis "${tpl.name}"`, icon: 'file' });
    setPreviewTpl(null);
  };

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Modèles de documents</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>{TEMPLATES.length} modèles disponibles · versionnés et maintenus par l'équipe</p>
        </div>
        <button className="btn primary" onClick={() => setShowNewModal(true)}>
          <Icon name="plus" size={13} /> Nouveau modèle
        </button>
      </div>

      <div className="row" style={{ gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ width: 300, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, height: 36 }}>
          <Icon name="search" size={14} style={{ color: 'var(--ink-3)' }} />
          <input placeholder="Rechercher un modèle…" value={searchQ} onChange={e => setSearchQ(e.target.value)}
            style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} />
        </div>
        <div className="row" style={{ gap: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`btn sm ${cat === c ? '' : 'ghost'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="row" style={{ marginLeft: 'auto', gap: 2, padding: 2, background: 'var(--surface-2)', borderRadius: 6 }}>
          <button onClick={() => setView('grid')} className={`btn sm ${view === 'grid' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="grid" size={13} /></button>
          <button onClick={() => setView('list')} className={`btn sm ${view === 'list' ? '' : 'ghost'}`} style={{ padding: '4px 8px', boxShadow: 'none' }}><Icon name="list" size={13} /></button>
        </div>
      </div>

      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {shown.map(tpl => (
            <div key={tpl.id} className="card" style={{ padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
              onClick={() => setPreviewTpl(tpl)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <FileIcon type={tpl.type} size={32} />
                <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Badge kind="neutral">{tpl.category}</Badge>
                  <span className="micro mono">v{tpl.version}</span>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>{tpl.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.45, height: 38, overflow: 'hidden' }}>{tpl.desc}</div>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--line)', fontSize: 12 }}>
                <span className="muted"><Icon name="file" size={11} /> utilisé {tpl.uses}×</span>
                <span className="muted">mis à jour {tpl.updated}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'list' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="t">
            <thead>
              <tr>
                <th>Nom du modèle</th>
                <th style={{ width: 130 }}>Catégorie</th>
                <th style={{ width: 80 }}>Version</th>
                <th style={{ width: 80 }}>Utilisé</th>
                <th style={{ width: 150 }}>Mis à jour</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(tpl => (
                <tr key={tpl.id} onClick={() => setPreviewTpl(tpl)}>
                  <td className="col-name">
                    <div className="row" style={{ gap: 10 }}>
                      <FileIcon type={tpl.type} size={24} />
                      <div>
                        <div>{tpl.name}</div>
                        <div className="micro" style={{ marginTop: 2 }}>{tpl.desc.slice(0, 60)}…</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge kind="neutral">{tpl.category}</Badge></td>
                  <td className="mono" style={{ fontSize: 12 }}>v{tpl.version}</td>
                  <td style={{ fontSize: 13, color: 'var(--ink-2)' }}>{tpl.uses}×</td>
                  <td className="micro">{tpl.updated}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn sm primary" onClick={() => useTemplate(tpl)}>Utiliser</button>
                      <button className="btn ghost sm" style={{ padding: 4 }}><Icon name="more" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewTpl && (
        <div className="modal-bg" onClick={() => setPreviewTpl(null)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <FileIcon type={previewTpl.type} size={40} />
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                  <h2>{previewTpl.name}</h2>
                  <Badge kind="neutral">{previewTpl.category}</Badge>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{previewTpl.desc}</div>
              </div>
              <button className="btn ghost sm" style={{ padding: 4 }} onClick={() => setPreviewTpl(null)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18, fontSize: 13 }}>
                {[
                  { l: 'Version',              v: `v${previewTpl.version}` },
                  { l: 'Utilisé',              v: `${previewTpl.uses} fois` },
                  { l: 'Dernière mise à jour', v: previewTpl.updated },
                  { l: 'Format',               v: previewTpl.type.toUpperCase() },
                ].map((r, i) => (
                  <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <span className="muted">{r.l}</span>
                    <span className="mono" style={{ fontWeight: 500 }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--line-strong)', flexDirection: 'column', gap: 8 }}>
                <Icon name="eye" size={28} style={{ color: 'var(--ink-3)' }} />
                <span className="muted" style={{ fontSize: 13 }}>Aperçu du modèle</span>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setPreviewTpl(null)}>Fermer</button>
              <button className="btn"><Icon name="download" size={13} /> Télécharger</button>
              <button className="btn primary" onClick={() => useTemplate(previewTpl)}>
                <Icon name="file" size={13} /> Créer depuis ce modèle
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="modal-bg" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
              <h2>Nouveau modèle</h2>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="label">Nom du modèle *</label><input className="input" placeholder="ex. Attestation de présence 2026" /></div>
              <div>
                <label className="label">Catégorie</label>
                <select className="input">
                  {CATEGORIES.filter(c => c !== 'Tous').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Fichier modèle (Word, PDF, Excel)</label>
                <div style={{ padding: '24px 18px', border: '1.5px dashed var(--line-strong)', borderRadius: 8, textAlign: 'center', cursor: 'pointer', background: 'var(--surface-2)' }}>
                  <Icon name="upload" size={22} style={{ color: 'var(--ink-3)', marginBottom: 8 }} />
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>Glissez ou cliquez pour importer</div>
                  <div className="micro" style={{ marginTop: 4 }}>DOC, DOCX, PDF, XLS, XLSX — max 20 Mo</div>
                </div>
              </div>
              <div><label className="label">Description</label><textarea className="input" rows={3} placeholder="Décrivez l'usage de ce modèle…" /></div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowNewModal(false)}>Annuler</button>
              <button className="btn primary" onClick={() => { setShowNewModal(false); showToast({ message: 'Modèle créé et ajouté à la bibliothèque', icon: 'check' }); }}>
                <Icon name="check" size={13} /> Enregistrer le modèle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
