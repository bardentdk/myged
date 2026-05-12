'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const UserCtx = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser]       = useState(null);   // Supabase auth user
  const [profile, setProfile] = useState(null);   // profiles row
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    async function loadProfile(authUser) {
      if (!authUser) { setProfile(null); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      setProfile(data ?? null);
    }

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      loadProfile(u).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserCtx.Provider value={{ user, profile, loading }}>
      {children}
    </UserCtx.Provider>
  );
}

export function useUser() {
  return useContext(UserCtx);
}
