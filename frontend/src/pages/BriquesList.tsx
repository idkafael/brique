import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Brique, BriqueStatus } from '../types/brique';
import { ORIGIN_OPTIONS } from '../types/brique';

const ICON_EDIT = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const ICON_CHECK = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ICON_X = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DIAS_PARADO = 7;

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function isParada(updatedAt: string) {
  const d = new Date(updatedAt);
  const limit = new Date();
  limit.setDate(limit.getDate() - DIAS_PARADO);
  return d < limit;
}

const btnAction =
  'inline-flex items-center justify-center p-1.5 rounded transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--surface-200)]';

export default function BriquesList() {
  const [briques, setBriques] = useState<Brique[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BriqueStatus | ''>('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchBriques = useCallback(() => {
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    if (filterOrigin) params.origin = filterOrigin;
    api.get<Brique[]>('/briques', { params }).then((res) => {
      setBriques(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterStatus, filterOrigin]);

  useEffect(() => {
    setLoading(true);
    fetchBriques();
  }, [fetchBriques]);

  const handleMarcarVendido = (b: Brique) => {
    if (b.status === 'vendido') return;
    setActingId(b.id);
    api.patch(`/briques/${b.id}`, { status: 'vendido' as BriqueStatus }).then(() => {
      setBriques((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, status: 'vendido' as BriqueStatus, updatedAt: new Date().toISOString() } : x))
      );
      setActingId(null);
    }).catch(() => setActingId(null));
  };

  const handleRemover = (b: Brique) => {
    const msg = `Remover a brique "${b.title}"? Esta ação não pode ser desfeita.`;
    if (!window.confirm(msg)) return;
    setActingId(b.id);
    api.delete(`/briques/${b.id}`).then(() => {
      setBriques((prev) => prev.filter((x) => x.id !== b.id));
      setActingId(null);
    }).catch(() => setActingId(null));
  };

  if (loading) {
    return <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}
        >
          Briques
        </h1>
        <Link
          to="/briques/nova"
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: 'var(--brand-500)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Nova brique
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus((e.target.value || '') as BriqueStatus | '')}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--surface-200)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <option value="">Todos</option>
            <option value="à venda">À venda</option>
            <option value="vendido">Vendido</option>
          </select>
        </div>
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Origem
          </label>
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--surface-200)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <option value="">Todas</option>
            {ORIGIN_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{
          background: 'var(--surface-200)',
          borderColor: 'var(--border)',
          borderRadius: '8px',
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Título</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Valor venda</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Origem</th>
              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Atualizado</th>
              <th className="text-right py-3 px-4 text-sm font-medium w-40" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {briques.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  Nenhuma brique cadastrada.
                </td>
              </tr>
            ) : (
              briques.map((b) => (
                <tr
                  key={b.id}
                  className="hover:opacity-90"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{b.title}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{formatMoney(Number(b.saleValue))}</td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                      style={
                        b.status === 'vendido'
                          ? { background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-500)' }
                          : { background: 'var(--gradient-brand-subtle)', color: 'var(--brand-500)' }
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{b.origin || '—'}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    {new Date(b.updatedAt).toLocaleDateString('pt-BR')}
                    {b.status === 'à venda' && isParada(b.updatedAt) && (
                      <span
                        className="ml-2 inline-flex rounded px-1.5 py-0.5 text-xs"
                        style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning-500)' }}
                      >
                        Parada
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === 'à venda' && (
                        <button
                          type="button"
                          title="Marcar como vendido"
                          className={btnAction}
                          style={{ color: 'var(--success-500)' }}
                          disabled={actingId === b.id}
                          onClick={() => handleMarcarVendido(b)}
                        >
                          {ICON_CHECK}
                        </button>
                      )}
                      <Link
                        to={`/briques/${b.id}/editar`}
                        className={btnAction}
                        title="Editar"
                        style={{ color: 'var(--brand-400)' }}
                      >
                        {ICON_EDIT}
                      </Link>
                      <button
                        type="button"
                        title="Remover"
                        className={btnAction}
                        style={{ color: 'var(--danger-500)' }}
                        disabled={actingId === b.id}
                        onClick={() => handleRemover(b)}
                      >
                        {ICON_X}
                      </button>
                      <Link
                        to={`/briques/${b.id}`}
                        className="text-sm hover:underline ml-1"
                        style={{ color: 'var(--brand-400)', fontFamily: 'var(--font-body)' }}
                      >
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
