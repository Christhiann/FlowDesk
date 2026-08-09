'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold text-brand-700">FlowDesk</h1>
      <p className="max-w-md text-slate-600">
        Gestão de tarefas em Kanban, papéis de acesso e dashboard, tudo em um só lugar.
      </p>

      {!loading && (
        <div className="flex gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
            >
              Ir para o dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-brand-600 px-5 py-2.5 font-medium text-brand-700 hover:bg-brand-50"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      )}
    </main>
  );
}
