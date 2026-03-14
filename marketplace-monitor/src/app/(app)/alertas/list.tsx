'use client';

import { useState } from 'react';
import type { AlertWithListing } from '@/types';

function formatPrice(n: number | null | undefined): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function AlertsList({ initial }: { initial: AlertWithListing[] }) {
  const [items, setItems] = useState(initial);

  async function markRead(id: string) {
    await fetch(`/api/alerts/${id}/read`, { method: 'POST' });
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  }

  async function dismiss(id: string) {
    await fetch(`/api/alerts/${id}/dismiss`, { method: 'POST' });
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  if (items.length === 0) {
    return <p className="text-gray-400">Nenhum alerta.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li
          key={a.id}
          className={`rounded-lg border p-4 ${
            a.isRead ? 'border-gray-700 bg-gray-900/30' : 'border-gray-600 bg-gray-900'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{a.title}</p>
              {a.message && <p className="text-sm text-gray-400 mt-1">{a.message}</p>}
              {a.listing && (
                <p className="text-sm text-gray-500 mt-2">
                  {formatPrice(a.listing.price)} · {a.listing.locationText || a.listing.city || '—'}
                </p>
              )}
              {a.listing?.externalUrl && (
                <a
                  href={a.listing.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline mt-1 inline-block"
                >
                  Ver anúncio
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!a.isRead && (
                <button
                  type="button"
                  onClick={() => markRead(a.id)}
                  className="text-sm text-blue-400 hover:underline"
                >
                  Marcar lido
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(a.id)}
                className="text-sm text-gray-500 hover:text-white"
              >
                Dispensar
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
