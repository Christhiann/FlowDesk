'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Customer } from '@/types';

export default function CrmPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Customer[]>('/customers')
      .then((res) => setCustomers(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">CRM</h1>
            <p className="text-sm text-slate-500">Gerencie clientes, contatos, interações e oportunidades.</p>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Carregando clientes...</p>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <article key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{customer.name}</h2>
                    <p className="text-sm text-slate-500">{customer.company ?? 'Empresa não informada'}</p>
                    <p className="mt-2 text-sm text-slate-500">{customer.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>{customer.contacts.length} contato(s)</span>
                    <span>{customer.interactions.length} interação(ões)</span>
                    <span>{customer.sales.length} venda(s)</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`/dashboard/crm/${customer.id}`}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Ver detalhes
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
