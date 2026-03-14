import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isMockMode } from '../lib/mockMode';

const MOCK_USER_KEY = 'crm-mock-user';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  loginMockUser?: (email: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      try {
        const stored = sessionStorage.getItem(MOCK_USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          setUser(parsed);
        }
      } catch {
        // ignore
      }
      setLoading(false);
      return;
    }

    function userFromSession(s: typeof session) {
      if (!s?.user) return null;
      const meta = s.user.user_metadata;
      const name = meta?.full_name ?? meta?.name ?? (s.user.email ? s.user.email.split('@')[0] : undefined);
      return {
        id: s.user.id,
        email: s.user.email ?? undefined,
        name: name ? String(name).trim() || undefined : undefined,
      };
    }

    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(userFromSession(s));
      })
      .catch(() => {
        setSession(null);
        setUser(null);
      })
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      setUser(userFromSession(s));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isMockMode) {
      sessionStorage.removeItem(MOCK_USER_KEY);
      setUser(null);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const loginMockUser = (email: string) => {
    const prefix = email.split('@')[0] || '';
    const name = prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() : undefined;
    const u: AuthUser = { id: 'mock-user-1', email, name };
    sessionStorage.setItem(MOCK_USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        ...(isMockMode ? { loginMockUser } : {}),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
