'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function WatchlistForm({ initial }: { initial?: Record<string, unknown> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState((initial?.name as string) ?? '');
  const [searchTerm, setSearchTerm] = useState((initial?.searchTerm as string) ?? '');
  const [minPrice, setMinPrice] = useState((initial?.minPrice as number) ?? '');
  const [maxPrice, setMaxPrice] = useState((initial?.maxPrice as number) ?? '');
  const [state, setState] = useState((initial?.state as string) ?? '');
  const [city, setCity] = useState((initial?.city as string) ?? '');
  const [isActive, setIsActive] = useState((initial?.isActive as boolean) ?? true);
  const isEdit = !!initial?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = isEdit ? `/api/watchlists/${(initial as { id: string }).id}` : '/api/watchlists';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = {
        name,
        searchTerm,
        minPrice: minPrice === '' ? null : Number(minPrice),
        maxPrice: maxPrice === '' ? null : Number(maxPrice),
        state: state || null,
        city: city || null,
        isActive,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Erro ao salvar');
        return;
      }
      router.push('/watchlists');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Termo de busca</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Preço mínimo</label>
          <input
            type="number"
            step="0.01"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Preço máximo</label>
          <input
            type="number"
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="ex: SP"
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Cidade</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-gray-600 bg-gray-800 text-blue-600"
        />
        <label htmlFor="isActive" className="text-sm text-gray-400">Watchlist ativa</label>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
      </button>
    </form>
  );
}
