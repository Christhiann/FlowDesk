'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { Task, STATUS_COLUMNS, SalesStats } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Task[]>('/tasks')
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false));

    api.get<SalesStats>('/sales/stats').then((res) => setSalesStats(res.data));
  }, []);

  const counts = STATUS_COLUMNS.map((col) => ({
    ...col,
    count: tasks.filter((t) => t.status === col.key).length,
  }));

  const highPriorityOpen = tasks.filter(
    (t) => t.status !== 'DONE' && (t.priority === 'HIGH' || t.priority === 'URGENT'),
  ).length;

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">Olá, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="mb-8 text-slate-500">
          Aqui está um resumo das tarefas {user?.role === 'EMPLOYEE' ? 'atribuídas a você' : 'da equipe'}.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {counts.map((col) => (
            <div
              key={col.key}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{col.label}</p>
              <p className="mt-1 text-3xl font-bold text-brand-700">{col.count}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">
            {highPriorityOpen} tarefa(s) de prioridade alta/urgente ainda em aberto.
          </p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Faturamento dos últimos 6 meses</h2>
                <p className="text-sm text-slate-500">Receita mensal estimada por vendas fechadas.</p>
              </div>
            </div>
            {salesStats ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesStats.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#2563eb" name="Receita" />
                    <Line type="monotone" dataKey="count" stroke="#f97316" name="Novos negócios" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500">Carregando métricas de vendas...</p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Status de vendas</h2>
              <p className="text-sm text-slate-500">Contagem e total por etapa do pipeline.</p>
            </div>
            {salesStats ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesStats.statusSummary} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="status" type="category" width={120} />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))} />
                    <Legend />
                    <Bar dataKey="total" fill="#22c55e" name="Total" />
                    <Bar dataKey="count" fill="#0284c7" name="Contagem" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500">Carregando status de vendas...</p>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
