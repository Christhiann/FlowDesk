'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/auth-context';
import { getAccessToken } from '@/lib/api';

interface Notification {
  taskId: string;
  title: string;
  message: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return undefined;

    const token = getAccessToken();
    const client = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    client.on('connect_error', () => {
      client.disconnect();
    });

    client.on('task:reassigned', (payload: Notification) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 5));
    });

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
        aria-label="Notificações"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-400">Novas notificações</p>
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.taskId + notification.message} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold">{notification.title}</p>
                <p className="text-slate-500">{notification.message}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
