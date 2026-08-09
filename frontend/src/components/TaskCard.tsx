'use client';

import { Task } from '@/types';

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

interface Props {
  task: Task;
  draggable: boolean;
  onDragStart: (task: Task) => void;
  onDelete?: (task: Task) => void;
  canDelete: boolean;
}

export default function TaskCard({ task, draggable, onDragStart, onDelete, canDelete }: Props) {
  return (
    <div
      draggable={draggable}
      onDragStart={() => onDragStart(task)}
      className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(task)}
            className="shrink-0 text-xs text-slate-400 hover:text-red-600"
            title="Excluir tarefa"
          >
            ✕
          </button>
        )}
      </div>

      {task.description && (
        <p className="mb-2 line-clamp-2 text-xs text-slate-500">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[task.priority]}`}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.assignee && (
          <span className="text-[11px] text-slate-400" title={task.assignee.email}>
            {task.assignee.name}
          </span>
        )}
      </div>
    </div>
  );
}
