'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Customer } from '@/types';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params?.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    api
      .get<Customer>(`/customers/${customerId}`)
      .then((res) => setCustomer(res.data))
      .finally(() => setLoading(false));
  }, [customerId]);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <p className="text-slate-500">Carregando cliente...</p>
        ) : customer ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold">{customer.name}</h1>
              <p className="mt-2 text-sm text-slate-500">{customer.company ?? 'Empresa não informada'}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                  <p className="mt-1 text-sm text-slate-700">{customer.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Telefone</p>
                  <p className="mt-1 text-sm text-slate-700">{customer.phone ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Criado por</p>
                  <p className="mt-1 text-sm text-slate-700">{customer.createdBy.name}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Contatos</h2>
                <div className="mt-4 space-y-3">
                  {customer.contacts.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum contato cadastrado.</p>
                  ) : (
                    customer.contacts.map((contact) => (
                      <div key={contact.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-slate-500">{contact.email ?? 'Email não informado'}</p>
                        <p className="text-sm text-slate-500">{contact.phone ?? 'Telefone não informado'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Vendas</h2>
                <div className="mt-4 space-y-3">
                  {customer.sales.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhuma venda registrada.</p>
                  ) : (
                    customer.sales.map((sale) => (
                      <div key={sale.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-medium">{sale.title}</p>
                        <p className="text-sm text-slate-500">Status: {sale.status}</p>
                        <p className="text-sm text-slate-500">
                          Valor: {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(sale.amount)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Interações</h2>
              <div className="mt-4 space-y-3">
                {customer.interactions.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhuma interação registrada.</p>
                ) : (
                  customer.interactions.map((interaction) => (
                    <div key={interaction.id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-medium">{interaction.type}</p>
                      <p className="text-sm text-slate-500">{interaction.note}</p>
                      <p className="mt-2 text-xs text-slate-400">{new Date(interaction.occurredAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          <p className="text-slate-500">Cliente não encontrado.</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
