'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Avatar, EmptyState } from '@/components/ui/Atoms';
import { useToast } from '@/lib/context/ToastContext';
import { createClient } from '@/lib/supabase/client';

const ACTION_LABELS = { lock: 'Verrouillage', download: 'Téléchargement', comment: 'Commentaire', eye: 'Consultation', check: 'Validation', share: 'Partage', upload: 'Importation', history: 'Restauration', x: 'Suppression', sig: 'Signature', link: 'Accès externe' };
const ACTION_VERB   = { lock: 'a verrouillé', download: 'a téléchargé', comment: 'a commenté', eye: 'a consulté', check: 'a validé', share: 'a partagé', upload: 'a importé', history: 'a restauré', x: 'a supprimé', sig: 'a signé', link: 'a consulté (lien externe)' };
const ACTION_COLOR  = { lock: 'var(--warn)', download: 'var(--ink-3)', comment: 'var(--accent)', eye: 'var(--ink-4)', check: 'var(--ok)', share: 'var(--accent)', upload: 'var(--ok)', history: 'var(--violet)', x: 'var(--err)', sig: 'var(--violet)', link: 'var(--accent)' };

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function mapEntry(row) {
  const p = row.profiles;
  return {
    id: row.id,
    who: row.user_id,
    profile: p
      ? { id: p.id, name: p.full_name || p.email || 'Utilisateur', role: p.role || '', avatar_url: p.avatar_url || null }
      : { id: row.user_id, name: 'Utilisateur', role: '', avatar_url: null },
    verb: ACTION_VERB[row.action] || row.action,
    what: row.document_name || '—',
    doc: row.document_id || null,
    when: formatDate(row.created_at),
    ip: row.ip_address || '—',
    type: row.action || 'eye',
  };
}

function RowMenu({ a, onClose }) {
  const router = useRouter();
  const { showToast } = useToast();
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 100, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,.12)', padding: '4px 0', minWidth: 180 }}>
      {a.doc && (
        <div onClick={() => { router.push(`/documents/${a.doc}`); onClose(); }}
          style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 8 }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon name="eye" size={14} /> Voir le document
        </div>
      )}
      {a.ip !== '—' && (
        <div onClick={() => { navigator.clipboard?.writeText(a.ip); showToast({ type: 'success', message: `IP ${a.ip} copiée` }); onClose(); }}
          style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 8 }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon name="copy" size={14} /> Copier l'IP
        </div>
      )}
    </div>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterWho, setFilterWho]   = useState('all');
  const [search, setSearch]         = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [openMenu, setOpenMenu]     = useState(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    const load = () =>
      supabase.from('activity_log')
        .select('*, profiles(id, full_name, email, avatar_url, role)')
        .order('created_at', { ascending: false })
        .limit(500)
        .then(({ data }) => { if (data) setActivity(data.map(mapEntry)); });

    load().finally(() => setLoading(false));

    const channel = supabase.channel('activity-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const profilesInActivity = [...new Map(activity.map(a => [a.who, a.profile])).values()];

  const shown = activity.filter((a) => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterWho !== 'all' && a.who !== filterWho) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.what.toLowerCase().includes(q) && !a.profile.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const downloadFile = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement('a');
    el.href = url; el.download = filename; el.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = 'Date,Utilisateur,Rôle,Action,Document,IP\n';
    const rows   = shown.map((a) =>
      [a.when, a.profile.name, a.profile.role, ACTION_LABELS[a.type] || a.type, a.what, a.ip].map((v) => `"${v}"`).join(',')
    ).join('\n');
    downloadFile(header + rows, 'journal-activite.csv', 'text/csv');
    showToast({ type: 'success', message: 'Export CSV téléchargé' });
    setExportOpen(false);
  };

  const exportJSON = () => {
    const data = shown.map((a) => ({ date: a.when, user: a.profile.name, action: ACTION_LABELS[a.type] || a.type, document: a.what, ip: a.ip }));
    downloadFile(JSON.stringify(data, null, 2), 'journal-activite.json', 'application/json');
    showToast({ type: 'success', message: 'Export JSON téléchargé' });
    setExportOpen(false);
  };

  const kpiTypes = ['lock', 'upload', 'comment', 'check', 'share'];

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: 14 }}>Chargement du journal…</p>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 22 }} onClick={() => setOpenMenu(null)}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Journal d'activité</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {shown.length} événement{shown.length !== 1 ? 's' : ''} · {profilesInActivity.length} utilisateur{profilesInActivity.length !== 1 ? 's' : ''} actif{profilesInActivity.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn primary" onClick={(e) => { e.stopPropagation(); setExportOpen((v) => !v); }}>
            <Icon name="download" size={13} /> Exporter
          </button>
          {exportOpen && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.15)', padding: '6px 0', minWidth: 180, zIndex: 50 }}>
              {[
                { label: 'Exporter en CSV',  icon: 'list', action: exportCSV },
                { label: 'Exporter en JSON', icon: 'code', action: exportJSON },
                { label: 'Export PDF',       icon: 'file', action: () => { showToast({ type: 'info', message: 'Export PDF en préparation…' }); setExportOpen(false); } },
              ].map((item) => (
                <div key={item.label} onClick={item.action} style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Icon name={item.icon} size={14} /> {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI pills */}
      <div className="row" style={{ gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {kpiTypes.map((t) => {
          const count = activity.filter((a) => a.type === t).length;
          return (
            <button key={t} onClick={() => setFilterType((f) => f === t ? 'all' : t)}
              className={`btn sm ${filterType === t ? '' : 'ghost'}`}
              style={{ borderLeftColor: ACTION_COLOR[t], borderLeftWidth: 3, borderLeftStyle: 'solid' }}>
              <Icon name={t === 'lock' ? 'lock' : t === 'check' ? 'check' : t === 'comment' ? 'msg' : t === 'upload' ? 'upload' : 'share'} size={12} style={{ color: ACTION_COLOR[t] }} />
              {ACTION_LABELS[t]}
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 2 }}>{count}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)', alignSelf: 'center' }}>{shown.length} résultat{shown.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 32, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 7, flex: 1, minWidth: 160 }}>
          <Icon name="search" size={13} style={{ color: 'var(--ink-3)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, document…"
            style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13, fontFamily: 'inherit', flex: 1 }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-3)' }}>×</button>}
        </div>
        <select className="input" style={{ height: 32, fontSize: 13, padding: '0 10px', width: 'auto' }} value={filterWho} onChange={(e) => setFilterWho(e.target.value)}>
          <option value="all">Tous les utilisateurs</option>
          {profilesInActivity.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input" style={{ height: 32, fontSize: 13, padding: '0 10px', width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(search || filterWho !== 'all' || filterType !== 'all') && (
          <button className="btn sm ghost" onClick={() => { setSearch(''); setFilterWho('all'); setFilterType('all'); }}>
            <Icon name="x" size={12} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {activity.length === 0 ? (
          <EmptyState icon="activity" title="Aucune activité enregistrée" sub="Les actions sur les documents (imports, validations, commentaires…) apparaîtront ici." />
        ) : shown.length === 0 ? (
          <EmptyState icon="search" title="Aucun événement" sub="Modifiez les filtres pour voir des résultats." />
        ) : (
          <table className="t">
            <thead>
              <tr>
                <th style={{ width: 150 }}>Date</th>
                <th style={{ width: 180 }}>Utilisateur</th>
                <th style={{ width: 140 }}>Action</th>
                <th>Document</th>
                <th style={{ width: 130 }}>IP</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.when}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar user={a.profile} size="xs" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{a.profile.name}</div>
                        <div className="micro truncate">{a.profile.role}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <Icon name={a.type === 'lock' ? 'lock' : a.type === 'check' ? 'check' : a.type === 'comment' ? 'msg' : a.type === 'upload' ? 'upload' : a.type === 'share' ? 'share' : a.type === 'history' ? 'history' : a.type === 'x' ? 'trash' : a.type === 'sig' ? 'sig' : a.type === 'link' ? 'link' : 'eye'} size={13} style={{ color: ACTION_COLOR[a.type] || 'var(--ink-3)' }} />
                      <span style={{ fontSize: 12.5 }}>{ACTION_LABELS[a.type] || a.type}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{a.what}</div>
                    {a.doc && (
                      <div className="micro" style={{ marginTop: 1 }}>
                        <button onClick={() => router.push(`/documents/${a.doc}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 11, padding: 0 }}>
                          Ouvrir →
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-4)' }}>{a.ip}</td>
                  <td style={{ position: 'relative' }}>
                    <button className="btn ghost sm" style={{ padding: 4 }} onClick={(e) => { e.stopPropagation(); setOpenMenu((v) => v === a.id ? null : a.id); }}>
                      <Icon name="more" size={14} />
                    </button>
                    {openMenu === a.id && <RowMenu a={a} onClose={() => setOpenMenu(null)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
