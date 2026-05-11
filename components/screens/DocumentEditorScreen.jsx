'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useDocs } from '@/lib/context/DocsContext';
import { useToast } from '@/lib/context/ToastContext';
import Icon from '@/components/ui/Icon';
import { StatusBadge, Avatar } from '@/components/ui/Atoms';
import { USERS, ME } from '@/lib/data';

/* ─── Word-like editor ─── */
function RichEditorToolbar({ editor }) {
  if (!editor) return null;
  const Btn = ({ active, onClick, children, title }) => (
    <button title={title} onClick={onClick}
      style={{
        padding: '4px 7px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, lineHeight: 1,
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--ink-2)',
        fontWeight: active ? 600 : 400,
      }}
      onMouseDown={(e) => e.preventDefault()}>
      {children}
    </button>
  );
  const Sep = () => <div style={{ width: 1, height: 18, background: 'var(--line)', margin: '0 4px' }} />;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2,
      padding: '8px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface)',
      position: 'sticky', top: 56, zIndex: 10,
    }}>
      {/* Undo / Redo */}
      <Btn onClick={() => editor.chain().focus().undo().run()} title="Annuler"><Icon name="chevL" size={13} /></Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} title="Rétablir"><Icon name="chevR" size={13} /></Btn>
      <Sep />
      {/* Headings */}
      <Btn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Titre 1">H1</Btn>
      <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre 2">H2</Btn>
      <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titre 3">H3</Btn>
      <Btn active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraphe">¶</Btn>
      <Sep />
      {/* Formatting */}
      <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras"><strong>G</strong></Btn>
      <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique"><em>I</em></Btn>
      <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné"><u>S</u></Btn>
      <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré"><s>R</s></Btn>
      <Btn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Surligner">ab</Btn>
      <Sep />
      {/* Alignment */}
      <Btn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Aligner à gauche">≡L</Btn>
      <Btn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centrer">≡C</Btn>
      <Btn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Aligner à droite">≡R</Btn>
      <Btn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justifier">≡J</Btn>
      <Sep />
      {/* Lists */}
      <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">• —</Btn>
      <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">1. —</Btn>
      <Sep />
      {/* Blockquote / code */}
      <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation">"</Btn>
      <Btn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code inline">{`</>`}</Btn>
      <Sep />
      {/* Table */}
      <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insérer tableau">⊞</Btn>
      <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Ajouter colonne">+col</Btn>
      <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Ajouter ligne">+lig</Btn>
      <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Supprimer tableau">✕⊞</Btn>
      <Sep />
      {/* HR */}
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne de séparation">─</Btn>
    </div>
  );
}

function WordEditor({ docId, initialContent, onSave }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: initialContent || '<p>Commencez à rédiger votre document…</p>',
    editorProps: {
      attributes: {
        style: 'outline:none; min-height: 600px; font-family: Georgia, serif; font-size: 14px; line-height: 1.7; color: #1a1a1a;',
      },
    },
    onUpdate({ editor }) {
      onSave(editor.getHTML());
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <RichEditorToolbar editor={editor} />
      <div style={{
        flex: 1, overflowY: 'auto', background: '#f0f0ee',
        display: 'flex', justifyContent: 'center', padding: '40px 24px',
      }}>
        <div style={{
          width: '100%', maxWidth: 800, background: '#fff',
          boxShadow: '0 2px 24px rgba(0,0,0,.12)', borderRadius: 4,
          padding: '72px 96px', minHeight: 1000,
        }}>
          <style>{`
            .tiptap h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
            .tiptap h2 { font-size: 17px; font-weight: 600; margin: 20px 0 8px; }
            .tiptap h3 { font-size: 15px; font-weight: 600; margin: 16px 0 6px; }
            .tiptap p  { margin: 0 0 10px; }
            .tiptap ul, .tiptap ol { padding-left: 24px; margin: 8px 0; }
            .tiptap li { margin: 3px 0; }
            .tiptap blockquote { border-left: 3px solid #d1d5db; padding-left: 14px; color: #6b7280; margin: 12px 0; }
            .tiptap code { background: #f3f4f6; padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 13px; }
            .tiptap hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            .tiptap mark { background: #fef08a; padding: 0 2px; border-radius: 2px; }
            .tiptap table { border-collapse: collapse; width: 100%; margin: 12px 0; }
            .tiptap th { background: #f9fafb; font-weight: 600; }
            .tiptap th, .tiptap td { border: 1px solid #e5e7eb; padding: 8px 12px; font-size: 13px; }
            .tiptap .selectedCell { background: var(--accent-soft); }
            .tiptap [style*="text-align: center"] { text-align: center; }
            .tiptap [style*="text-align: right"] { text-align: right; }
            .tiptap [style*="text-align: justify"] { text-align: justify; }
          `}</style>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

/* ─── Spreadsheet editor ─── */
const COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 16);
const ROWS = Array.from({ length: 30 }, (_, i) => i + 1);

const SAMPLE_DATA = {
  A1: 'Apprenant', B1: 'Session', C1: 'Présence J1', D1: 'Présence J2', E1: 'Présence J3', F1: 'Total heures', G1: 'Observation',
  A2: 'Jean Payet', B2: 'TP Secrétaire 2026', C2: '✓', D2: '✓', E2: '✓', F2: '=21', G2: 'RAS',
  A3: 'Marie Grondin', B3: 'TP Secrétaire 2026', C3: '✓', D3: 'Abs', E3: '✓', F3: '=14', G3: 'Absence justifiée J2',
  A4: 'Thomas Rivière', B4: 'TP Secrétaire 2026', C4: '✓', D4: '✓', E4: '✓', F4: '=21', G4: 'RAS',
  A5: 'Sophie Lauret', B5: 'TP Secrétaire 2026', C5: '✓', D5: '✓', E5: 'Abs', F5: '=14', G5: '',
  A6: 'Kevin Moutou', B6: 'TP Secrétaire 2026', C6: 'Abs', D6: '✓', E6: '✓', F6: '=14', G6: 'Retard signalé',
};

function SpreadsheetEditor({ onSave }) {
  const [cells, setCells] = useState(SAMPLE_DATA);
  const [selected, setSelected] = useState('A1');
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const inputRef = useRef(null);

  const colIdx = (col) => COLS.indexOf(col);
  const cellKey = (col, row) => `${col}${row}`;

  const startEdit = (key, val) => {
    setEditing(key);
    setEditVal(val || '');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (!editing) return;
    setCells((c) => ({ ...c, [editing]: editVal }));
    onSave({ ...cells, [editing]: editVal });
    setEditing(null);
  };

  const handleKeyDown = (e, col, row) => {
    if (e.key === 'Enter') { commitEdit(); setSelected(cellKey(col, Math.min(row + 1, 30))); }
    else if (e.key === 'Tab') { e.preventDefault(); commitEdit(); setSelected(cellKey(COLS[Math.min(colIdx(col) + 1, COLS.length - 1)], row)); }
    else if (e.key === 'Escape') { setEditing(null); }
  };

  const isHeader = (row) => row === 1;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
      {/* Formula bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ padding: '4px 10px', background: 'var(--surface-2)', borderRadius: 4, fontSize: 12, fontFamily: 'monospace', minWidth: 50, textAlign: 'center', border: '1px solid var(--line)' }}>{selected}</div>
        <div style={{ width: 1, height: 16, background: 'var(--line)' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{cells[selected] || ''}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 40 }} />
            {COLS.map((c) => <col key={c} style={{ width: c === 'A' || c === 'B' ? 160 : c === 'G' ? 200 : 90 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={{ background: '#e8e8e8', border: '1px solid #ccc', width: 40 }} />
              {COLS.map((col) => (
                <th key={col} style={{ background: '#e8e8e8', border: '1px solid #ccc', padding: '4px 8px', fontWeight: 600, textAlign: 'center', fontSize: 12, color: '#333' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row}>
                <td style={{ background: '#e8e8e8', border: '1px solid #ccc', textAlign: 'center', fontSize: 11, color: '#666', padding: '2px 4px', fontFamily: 'monospace' }}>{row}</td>
                {COLS.map((col) => {
                  const key = cellKey(col, row);
                  const isSelected = selected === key;
                  const isEditing = editing === key;
                  const val = cells[key] || '';
                  return (
                    <td key={key}
                      onClick={() => { commitEdit(); setSelected(key); }}
                      onDoubleClick={() => startEdit(key, val)}
                      style={{
                        border: isSelected ? '2px solid #1a73e8' : '1px solid #d0d0d0',
                        padding: 0, position: 'relative', minHeight: 22,
                        background: isHeader(row) ? '#f0f4ff' : isSelected ? '#e8f0fe' : '#fff',
                        fontWeight: isHeader(row) ? 600 : 400,
                      }}>
                      {isEditing
                        ? <input ref={inputRef} value={editVal} onChange={(e) => setEditVal(e.target.value)}
                            onBlur={commitEdit} onKeyDown={(e) => handleKeyDown(e, col, row)}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', outline: 'none', padding: '2px 6px', fontSize: 13, fontFamily: 'inherit', background: '#fff', zIndex: 2 }} />
                        : <div style={{ padding: '2px 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: 22 }}>{val}</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── PDF viewer placeholder ─── */
function PdfViewer({ doc }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, background: '#f0f0ee', padding: 40 }}>
      <div style={{ width: 520, background: '#fff', boxShadow: '0 2px 24px rgba(0,0,0,.12)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ background: '#4a4a4a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontSize: 13 }}>
          <Icon name="file" size={14} />
          <span>{doc.name}</span>
          <div style={{ flex: 1 }} />
          <span style={{ opacity: .6, fontSize: 12 }}>v{doc.version} · {doc.size}</span>
        </div>
        <div style={{ height: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#fff' }}>
          <div style={{ width: 80, height: 80, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="file" size={36} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Visualiseur PDF</div>
            <div className="muted" style={{ fontSize: 13, maxWidth: 340, lineHeight: 1.5 }}>
              L'intégration d'un visualiseur PDF natif (PDF.js ou Adobe Embed) permet l'affichage et l'annotation inline. Activez l'intégration depuis les paramètres.
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn primary sm"><Icon name="eye" size={13} /> Ouvrir dans le navigateur</button>
            <button className="btn sm"><Icon name="download" size={13} /> Télécharger</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Metadata sidebar ─── */
const META_FIELDS = [
  { key: 'folder',       label: 'Dossier',           type: 'text' },
  { key: 'status',       label: 'Statut',             type: 'select', options: ['draft','review','validated','rejected','archived'] },
  { key: 'confidential', label: 'Confidentialité',    type: 'select', options: ['Public','Interne','Confidentiel'] },
  { key: 'expires',      label: 'Expiration',         type: 'date' },
  { key: 'description',  label: 'Description',        type: 'textarea' },
  { key: 'author',       label: 'Auteur (externe)',   type: 'text' },
  { key: 'subject',      label: 'Sujet',              type: 'text' },
  { key: 'language',     label: 'Langue',             type: 'select', options: ['Français','Anglais','Espagnol','Portugais'] },
];

const STATUS_FR = { draft: 'Brouillon', review: 'En validation', validated: 'Validé', rejected: 'Refusé', archived: 'Archivé' };

function MetadataSidebar({ doc, onUpdate }) {
  const [localMeta, setLocalMeta] = useState({
    folder: doc.folder || '',
    status: doc.status || 'draft',
    confidential: doc.confidential || 'Interne',
    expires: doc.expires || '',
    description: doc.description || '',
    author: doc.author || '',
    subject: doc.subject || '',
    language: doc.language || 'Français',
  });
  const [customFields, setCustomFields] = useState(doc.customFields || []);
  const [addingField, setAddingField] = useState(false);
  const [newField, setNewField] = useState({ label: '', value: '' });
  const [tagsInput, setTagsInput] = useState('');
  const [localTags, setLocalTags] = useState(doc.tags || []);

  const setMeta = (k, v) => setLocalMeta((m) => ({ ...m, [k]: v }));
  const saveAll = () => {
    onUpdate({ ...localMeta, tags: localTags, customFields });
  };

  const addCustomField = () => {
    if (!newField.label.trim()) return;
    setCustomFields((f) => [...f, { ...newField, id: Date.now() }]);
    setNewField({ label: '', value: '' });
    setAddingField(false);
  };

  return (
    <div style={{ width: 280, borderLeft: '1px solid var(--line)', background: 'var(--surface)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 13 }}>Propriétés du document</div>
      <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* File info */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 12, fontSize: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="muted">Type</span><span className="mono">{doc.type?.toUpperCase()}</span>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="muted">Version</span><span className="mono">v{doc.version}</span>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="muted">Taille</span><span className="mono">{doc.size}</span>
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted">Modifié</span><span>{doc.updatedAt}</span>
          </div>
        </div>

        {/* Editable meta fields */}
        {META_FIELDS.map(({ key, label, type, options }) => (
          <div key={key}>
            <label className="label">{label}</label>
            {type === 'select'
              ? <select className="input" style={{ fontSize: 12, height: 30, padding: '0 8px' }} value={localMeta[key]} onChange={(e) => setMeta(key, e.target.value)}>
                  {options.map((o) => <option key={o} value={o}>{STATUS_FR[o] || o}</option>)}
                </select>
              : type === 'textarea'
              ? <textarea className="input" style={{ fontSize: 12, resize: 'vertical', minHeight: 60, padding: '6px 8px' }} value={localMeta[key]} onChange={(e) => setMeta(key, e.target.value)} placeholder="Description…" />
              : <input className="input" type={type === 'date' ? 'date' : 'text'} style={{ fontSize: 12, height: 30, padding: '0 8px' }} value={localMeta[key]} onChange={(e) => setMeta(key, e.target.value)} />}
          </div>
        ))}

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {localTags.map((t) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 7px', borderRadius: 99, background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                {t}
                <button onClick={() => setLocalTags((ts) => ts.filter((x) => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div className="row" style={{ gap: 4 }}>
            <input className="input" style={{ fontSize: 12, height: 28, padding: '0 8px', flex: 1 }} placeholder="Ajouter un tag…" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && tagsInput.trim()) { setLocalTags((ts) => [...new Set([...ts, tagsInput.trim().toLowerCase()])]) ; setTagsInput(''); } }} />
          </div>
        </div>

        {/* Custom fields */}
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <label className="label" style={{ margin: 0 }}>Champs personnalisés</label>
            <button className="btn ghost sm" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => setAddingField(true)}>+ Ajouter</button>
          </div>
          {customFields.map((f) => (
            <div key={f.id} className="row" style={{ gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-3)', flexShrink: 0, width: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</span>
              <input className="input" style={{ fontSize: 11, height: 24, padding: '0 6px', flex: 1 }} value={f.value}
                onChange={(e) => setCustomFields((fs) => fs.map((x) => x.id === f.id ? { ...x, value: e.target.value } : x))} />
              <button onClick={() => setCustomFields((fs) => fs.filter((x) => x.id !== f.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 0 }}>×</button>
            </div>
          ))}
          {addingField && (
            <div style={{ background: 'var(--surface-2)', borderRadius: 6, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input className="input" style={{ fontSize: 12, height: 28, padding: '0 8px' }} placeholder="Nom du champ" value={newField.label} onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))} autoFocus />
              <input className="input" style={{ fontSize: 12, height: 28, padding: '0 8px' }} placeholder="Valeur" value={newField.value} onChange={(e) => setNewField((f) => ({ ...f, value: e.target.value }))} />
              <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button className="btn ghost sm" style={{ fontSize: 11 }} onClick={() => setAddingField(false)}>Annuler</button>
                <button className="btn sm" style={{ fontSize: 11 }} onClick={addCustomField}>Ajouter</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={saveAll}>
          <Icon name="check" size={13} /> Enregistrer les propriétés
        </button>
      </div>
    </div>
  );
}

/* ─── Main editor screen ─── */
export default function DocumentEditorScreen({ id }) {
  const router = useRouter();
  const { docs, contents, updateDoc, updateContent, addVersion } = useDocs();
  const { showToast } = useToast();
  const doc = docs.find((d) => d.id === id) || docs[0];
  const content = contents[doc?.id] || '';

  const [saveStatus, setSaveStatus] = useState('saved');
  const [showMeta, setShowMeta] = useState(true);
  const saveTimer = useRef(null);

  const handleContentChange = useCallback((html) => {
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateContent(doc.id, html);
      setSaveStatus('saved');
    }, 1200);
  }, [doc?.id, updateContent]);

  const handleMetaUpdate = (changes) => {
    updateDoc(doc.id, changes);
    showToast({ type: 'success', message: 'Propriétés enregistrées' });
  };

  const handlePublish = () => {
    const parts = doc.version.split('.');
    const newVersion = `${parts[0]}.${parseInt(parts[1] || 0) + 1}`;
    addVersion(doc.id, {
      v: newVersion,
      author: ME.id,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      note: 'Sauvegarde depuis l\'éditeur',
      size: doc.size,
    });
    updateDoc(doc.id, { version: newVersion });
    showToast({ type: 'success', message: `Version ${newVersion} enregistrée` });
  };

  if (!doc) return null;

  const isEditable = doc.type === 'doc' || doc.type === 'xls';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--surface)' }}>
      {/* Top bar */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', borderBottom: '1px solid var(--line)', background: 'var(--surface)', flexShrink: 0, zIndex: 20 }}>
        <button className="btn ghost sm" onClick={() => router.push(`/documents/${doc.id}`)} style={{ gap: 6 }}>
          <Icon name="chevL" size={14} /> Retour
        </button>
        <div style={{ width: 1, height: 18, background: 'var(--line)' }} />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
          <StatusBadge status={doc.status} />
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>v{doc.version}</span>
        </div>

        {/* Save status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: saveStatus === 'saved' ? 'var(--ok)' : 'var(--ink-3)' }}>
          {saveStatus === 'saving'
            ? <><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: 'var(--warn)', animation: 'pulse 1s infinite' }} />Enregistrement…</>
            : <><Icon name="check" size={12} />Enregistré</>}
        </div>

        <div style={{ width: 1, height: 18, background: 'var(--line)' }} />

        {/* Owner */}
        <div className="row" style={{ gap: 6 }}>
          <Avatar user={USERS[doc.owner]} size="xs" />
          <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{USERS[doc.owner]?.name.split(' ')[0]}</span>
        </div>

        <button className="btn ghost sm" onClick={() => setShowMeta((v) => !v)} style={{ gap: 6 }}>
          <Icon name="info" size={14} /> {showMeta ? 'Masquer' : 'Propriétés'}
        </button>
        <button className="btn sm" onClick={handlePublish} style={{ gap: 6 }}>
          <Icon name="upload" size={13} /> Publier v{(() => { const p = doc.version.split('.'); return `${p[0]}.${parseInt(p[1] || 0) + 1}`; })()}
        </button>
        <button className="btn primary sm" style={{ gap: 6 }}>
          <Icon name="share" size={13} /> Partager
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {doc.type === 'doc' && <WordEditor docId={doc.id} initialContent={content} onSave={handleContentChange} />}
        {doc.type === 'xls' && <SpreadsheetEditor onSave={() => setSaveStatus('saving')} />}
        {(doc.type === 'pdf' || doc.type === 'img') && <PdfViewer doc={doc} />}
        {!isEditable && doc.type !== 'pdf' && doc.type !== 'img' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="muted">Format non pris en charge pour l'édition en ligne</span>
          </div>
        )}
        {showMeta && <MetadataSidebar doc={doc} onUpdate={handleMetaUpdate} />}
      </div>
    </div>
  );
}
