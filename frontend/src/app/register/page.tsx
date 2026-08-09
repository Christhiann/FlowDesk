'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message[0] : message ?? 'Não foi possível criar a conta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-brand-700">Criar conta</h1>
        <p className="mb-6 text-sm text-slate-500">
          Novas contas entram sempre como Colaborador. Promoção a Gerente/Admin é feita direto no banco.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              placeholder="voce@empresa.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
