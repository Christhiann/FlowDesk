export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  createdBy?: { id: string; name: string; email: string };
}

export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  customerId: string;
}

export interface Interaction {
  id: string;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE';
  note: string;
  occurredAt: string;
  createdBy: { id: string; name: string; email: string };
}

export interface Sale {
  id: string;
  title: string;
  amount: number;
  status: 'PROSPECT' | 'QUALIFIED' | 'NEGOTIATION' | 'WON' | 'LOST';
  customer: { id: string; name: string; email: string };
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  contacts: Contact[];
  interactions: Interaction[];
  sales: Sale[];
}

export interface SalesStats {
  monthlyRevenue: Array<{ month: string; count: number; total: number }>;
  statusSummary: Array<{ status: string; count: number; total: number }>;
}

export const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'TODO', label: 'A fazer' },
  { key: 'IN_PROGRESS', label: 'Em andamento' },
  { key: 'REVIEW', label: 'Revisão' },
  { key: 'DONE', label: 'Concluído' },
];
