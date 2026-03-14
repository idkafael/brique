import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isMockMode } from '../lib/mockMode';
import type { Watchlist } from '../types/marketplace';

export default function Watchlists() {
  const { user } = useAuth();
  const [list, setList] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMockMode || !user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('marketplace_watchlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
          setList([]);
        } else {
          setList((data as Watchlist[]) ?? []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (isMockMode) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          Watchlists
        </h1>
        <div
          className="rounded-lg border p-6"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Conecte o Supabase para criar e gerenciar watchlists do Marketplace.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          Watchlists
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Faça login para acessar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          Watchlists
        </h1>
        <Link
          to="/watchlists/nova"
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--brand-500)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}
        >
          Nova watchlist
        </Link>
      </div>

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger-500)', fontFamily: 'var(--font-body)' }}>{error}</p>
      )}

      {loading && (
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Carregando...</p>
      )}

      {!loading && list.length === 0 && (
        <div
          className="rounded-lg border p-8 text-center"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Nenhuma watchlist. Crie uma para monitorar anúncios do Marketplace.
          </p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Termo</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Preço</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Local</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Ativa</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{w.name}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{w.search_term}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    {w.min_price != null || w.max_price != null ? `${w.min_price ?? '—'} - ${w.max_price ?? '—'}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    {[w.city, w.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-flex rounded px-2 py-0.5 text-xs"
                      style={w.is_active ? { background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-500)' } : { background: 'var(--surface-300)', color: 'var(--text-muted)' }}
                    >
                      {w.is_active ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/watchlists/${w.id}/editar`} className="text-sm" style={{ color: 'var(--brand-400)', fontFamily: 'var(--font-body)' }}>
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
