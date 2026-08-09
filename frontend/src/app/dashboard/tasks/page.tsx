'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import CreateTaskModal from '@/components/CreateTaskModal';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Task, User } from '@/types';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const isManagement = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    api.get<Task[]>('/tasks').then((res) => setTasks(res.data)).finally(() => setLoading(false));
    if (isManagement) {
      api.get<User[]>('/users').then((res) => setUsers(res.data));
    }
  }, [isManagement]);

  function canDrag(task: Task) {
    if (isManagement) return true;
    return task.assignee?.id === user?.id;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quadro de tarefas</h1>
            <p className="text-sm text-slate-500">
              {isManagement
                ? 'Arraste os cards entre colunas para atualizar o status da equipe.'
                : 'Você só pode mover as tarefas atribuídas a você.'}
            </p>
          </div>

          {isManagement && (
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Nova tarefa
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-slate-500">Carregando tarefas...</p>
        ) : (
          <KanbanBoard
            tasks={tasks}
            setTasks={setTasks}
            canDrag={canDrag}
            canDelete={isManagement}
          />
        )}

        {modalOpen && (
          <CreateTaskModal
            users={users}
            onCreated={(task) => setTasks((prev) => [task, ...prev])}
            onClose={() => setModalOpen(false)}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
