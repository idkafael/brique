import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isMockMode } from '../lib/mockMode';
import type { OpportunityRow } from '../types/marketplace';

function formatPrice(n: number | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Oportunidades() {
  const { user } = useAuth();
  const [items, setItems] = useState<OpportunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMockMode || !user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchData() {
      try {
        const { data: watchlists, error: errW } = await supabase
          .from('marketplace_watchlists')
          .select('id, name')
          .eq('user_id', user.id);
        if (errW) throw errW;
        const wMap = new Map((watchlists ?? []).map((w: { id: string; name: string }) => [w.id, w.name]));
        const watchlistIds = [...wMap.keys()];
        if (watchlistIds.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const { data: matches, error: errM } = await supabase
          .from('marketplace_matches')
          .select('id, watchlist_id, listing_id, matched_at')
          .in('watchlist_id', watchlistIds)
          .order('matched_at', { ascending: false });
        if (errM) throw errM;
        if (!matches?.length) {
          setItems([]);
          setLoading(false);
          return;
        }

        const listingIds = [...new Set((matches as { listing_id: string }[]).map((m) => m.listing_id))];
        const { data: listings, error: errL } = await supabase
          .from('marketplace_listings')
          .select('id, title, price, location_text, city, state, external_url')
          .in('id', listingIds);
        if (errL) throw errL;
        const lMap = new Map((listings ?? []).map((l: { id: string }) => [l.id, l]));

        const rows: OpportunityRow[] = (matches as { id: string; watchlist_id: string; listing_id: string; matched_at: string }[]).map((m) => {
          const listing = lMap.get(m.listing_id);
          return {
            matchId: m.id,
            watchlistName: wMap.get(m.watchlist_id) ?? '',
            matchedAt: m.matched_at,
            listing: listing
              ? {
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  location_text: listing.location_text,
                  city: listing.city,
                  state: listing.state,
                  external_url: listing.external_url,
                }
              : { id: '', title: '—', price: null, location_text: null, city: null, state: null, external_url: '#' },
          };
        });
        if (!cancelled) setItems(rows);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro ao carregar');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (isMockMode) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          Oportunidades
        </h1>
        <div
          className="rounded-lg border p-6"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Conecte o Supabase para ver oportunidades do Marketplace.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          Oportunidades
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Faça login para acessar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
        Oportunidades
      </h1>
      <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        Anúncios que bateram nas suas watchlists.
      </p>

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger-500)', fontFamily: 'var(--font-body)' }}>{error}</p>
      )}

      {loading && (
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Carregando...</p>
      )}

      {!loading && items.length === 0 && (
        <div
          className="rounded-lg border p-8 text-center"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Nenhuma oportunidade ainda.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Produto</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Preço</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Localização</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Watchlist</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.matchId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{row.listing.title}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{formatPrice(row.listing.price)}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    {row.listing.location_text || [row.listing.city, row.listing.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{row.watchlistName}</td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={row.listing.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm"
                      style={{ color: 'var(--brand-400)', fontFamily: 'var(--font-body)' }}
                    >
                      Abrir anúncio
                    </a>
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
