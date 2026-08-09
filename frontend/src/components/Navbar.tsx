'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import NotificationBell from './NotificationBell';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Colaborador',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Visão geral' },
    { href: '/dashboard/tasks', label: 'Tarefas' },
  ];

  if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
    links.push({ href: '/dashboard/crm', label: 'CRM' });
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-brand-700">FlowDesk</span>
          <div className="hidden gap-4 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname === link.href
                    ? 'text-brand-700'
                    : 'text-slate-500 hover:text-brand-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          {user && (
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.name} · {ROLE_LABELS[user.role] ?? user.role}
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
