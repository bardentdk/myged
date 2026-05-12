'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

function mapNotif(n) {
  const diff = (Date.now() - new Date(n.created_at)) / 1000;
  const when = diff < 60 ? "à l'instant"
    : diff < 3600 ? `il y a ${Math.floor(diff / 60)} min`
    : diff < 86400 ? `il y a ${Math.floor(diff / 3600)} h`
    : diff < 172800 ? 'hier'
    : new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return {
    id: n.id, type: n.type, icon: n.icon || 'bell',
    title: n.title, body: n.body || '',
    who: n.from_user, docId: n.document_id,
    read: n.read ?? false, when,
  };
}

const Ctx = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setNotifications(data.map(mapNotif));
      setLoading(false);

      // Real-time: new notifications for this user
      const channel = supabase
        .channel('notifs-realtime')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => { setNotifications(ns => [mapNotif(payload.new), ...ns]); }
        )
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => { setNotifications(ns => ns.map(n => n.id === payload.new.id ? mapNotif(payload.new) : n)); }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }

    init();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback(async (id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    const supabase = createClient();
    if (supabase) await supabase.from('notifications').update({ read: true }).eq('id', id);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
  }, []);

  const dismiss = useCallback(async (id) => {
    setNotifications(ns => ns.filter(n => n.id !== id));
    const supabase = createClient();
    if (supabase) await supabase.from('notifications').delete().eq('id', id);
  }, []);

  const add = useCallback(async (notif) => {
    const supabase = createClient();
    if (!supabase) {
      setNotifications(ns => [{ ...notif, id: `local-${Date.now()}`, read: false, when: "à l'instant" }, ...ns]);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').insert({
      user_id: user.id, type: notif.type || 'info', icon: notif.icon,
      title: notif.title, body: notif.body, from_user: notif.from_user ?? null, document_id: notif.document_id ?? null,
    });
  }, []);

  return (
    <Ctx.Provider value={{ notifications, loading, unreadCount, markRead, markAllRead, dismiss, add }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
