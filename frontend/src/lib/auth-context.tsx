'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { api, setAccessToken } from './api';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ao carregar a aplicação, tenta renovar a sessão usando o cookie
    // httpOnly de refresh token (o usuário continua logado após dar F5).
    async function tryRestoreSession() {
      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    tryRestoreSession();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    router.push('/dashboard');
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post('/auth/register', { name, email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    router.push('/dashboard');
  }

  async function logout() {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}
