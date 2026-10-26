import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, getToken, setToken, setUnauthorizedHandler } from '../api/client';
import type { User } from '../api/types';

interface SignupInput { fullName: string; email: string; password: string; targetRole?: string; experienceLevel?: string }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    qc.clear();
  }, [qc]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return;
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [logout]);

  const authenticate = async (path: string, body: unknown) => {
    const r = await api<{ token: string; user: User }>(path, { method: 'POST', body });
    setToken(r.token);
    qc.clear();
    setUser(r.user);
  };

  return (
    <Ctx.Provider
      value={{
        user, loading, logout,
        login: (email, password) => authenticate('/auth/login', { email, password }),
        signup: (input) => authenticate('/auth/signup', input),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
}
