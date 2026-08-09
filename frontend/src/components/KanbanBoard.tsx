'use client';

import { useState } from 'react';
import { Task, TaskStatus, STATUS_COLUMNS } from '@/types';
import { api } from '@/lib/api';
import TaskCard from './TaskCard';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  canDrag: (task: Task) => boolean;
  canDelete: boolean;
}

export default function KanbanBoard({ tasks, setTasks, canDrag, canDelete }: Props) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  async function handleDrop(status: TaskStatus) {
    setDragOverColumn(null);
    if (!draggedTask || draggedTask.status === status) return;

    const previousTasks = tasks;
    // Atualização otimista: move o card na hora, sem esperar a API responder.
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTask.id ? { ...t, status } : t)),
    );

    try {
      await api.patch(`/tasks/${draggedTask.id}/status`, { status });
    } catch {
      // Se a API rejeitar (ex: sem permissão), desfaz a mudança visual.
      setTasks(previousTasks);
    } finally {
      setDraggedTask(null);
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Excluir a tarefa "${task.title}"?`)) return;
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.delete(`/tasks/${task.id}`);
    } catch {
      setTasks(previousTasks);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATUS_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.key);
        const isDragOver = dragOverColumn === column.key;

        return (
          <div
            key={column.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(column.key);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => handleDrop(column.key)}
            className={`flex min-h-[300px] flex-col gap-3 rounded-xl border-2 border-dashed p-3 transition-colors ${
              isDragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700">{column.label}</h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {columnTasks.length}
              </span>
            </div>

            {columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                draggable={canDrag(task)}
                onDragStart={setDraggedTask}
                onDelete={canDelete ? handleDelete : undefined}
                canDelete={canDelete}
              />
            ))}

            {columnTasks.length === 0 && (
              <p className="px-1 text-xs text-slate-400">Nenhuma tarefa aqui</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
