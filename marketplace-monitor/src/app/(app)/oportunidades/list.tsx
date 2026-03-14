'use client';

import { useState } from 'react';
import type { OpportunityRow } from '@/services/opportunities-service';

function formatPrice(n: number | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function OpportunitiesList({ initial }: { initial: OpportunityRow[] }) {
  const [items, setItems] = useState(initial);

  async function markRead(alertId: string) {
    await fetch(`/api/alerts/${alertId}/read`, { method: 'POST' });
    setItems((prev) =>
      prev.map((o) => (o.alertId === alertId ? { ...o, isRead: true } : o))
    );
  }

  if (items.length === 0) {
    return <p className="text-gray-400">Nenhuma oportunidade encontrada.</p>;
  }

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-900/50">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Produto</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Preço</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Localização</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Watchlist</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.matchId} className="border-b border-gray-800 hover:bg-gray-900/30">
              <td className="py-3 px-4 text-white font-medium">{row.listing.title}</td>
              <td className="py-3 px-4 text-gray-300">{formatPrice(row.listing.price)}</td>
              <td className="py-3 px-4 text-gray-300">
                {row.listing.locationText || [row.listing.city, row.listing.state].filter(Boolean).join(', ') || '—'}
              </td>
              <td className="py-3 px-4 text-gray-300">{row.watchlistName}</td>
              <td className="py-3 px-4">
                <span className="inline-flex gap-1">
                  {!row.isRead && (
                    <span className="rounded bg-blue-900/50 px-2 py-0.5 text-xs text-blue-400">
                      Não lido
                    </span>
                  )}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <a
                  href={row.listing.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline mr-3"
                >
                  Abrir anúncio
                </a>
                {row.alertId && !row.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(row.alertId!)}
                    className="text-sm text-gray-400 hover:text-white mr-3"
                  >
                    Marcar visto
                  </button>
                )}
                <span className="text-sm text-gray-500">Converter em brique (em breve)</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
