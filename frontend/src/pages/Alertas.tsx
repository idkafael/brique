import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isMockMode } from '../lib/mockMode';
import type { Watchlist, WatchlistInsert, OpportunityRow } from '../types/marketplace';

type Tab = 'watchlists' | 'oportunidades' | 'alertas';

interface MarketplaceAlertRow {
  id: string;
  user_id: string;
  watchlist_id: string;
  listing_id: string;
  title: string;
  message: string | null;
  is_read: boolean;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

interface ListingRow {
  id: string;
  title: string;
  price: number | null;
  location_text: string | null;
  city: string | null;
  state: string | null;
  external_url: string;
}

function formatPrice(n: number | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatDate(s: string): string {
  return new Date(s).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const tabStyle = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';
const contentStyle = { fontFamily: 'var(--font-body)' as const };

export default function Alertas() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('alertas');

  if (isMockMode) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          Alertas
        </h1>
        <div
          className="rounded-lg border p-6"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>
            Conecte o Supabase para usar Watchlists, Oportunidades e Alertas do Marketplace.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          Alertas
        </h1>
        <p style={{ color: 'var(--text-muted)', ...contentStyle }}>Faça login para acessar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
        Alertas
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('watchlists')}
          className={tabStyle}
          style={{
            background: tab === 'watchlists' ? 'var(--surface-200)' : 'transparent',
            color: tab === 'watchlists' ? 'var(--text)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Watchlists
        </button>
        <button
          type="button"
          onClick={() => setTab('oportunidades')}
          className={tabStyle}
          style={{
            background: tab === 'oportunidades' ? 'var(--surface-200)' : 'transparent',
            color: tab === 'oportunidades' ? 'var(--text)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Oportunidades
        </button>
        <button
          type="button"
          onClick={() => setTab('alertas')}
          className={tabStyle}
          style={{
            background: tab === 'alertas' ? 'var(--surface-200)' : 'transparent',
            color: tab === 'alertas' ? 'var(--text)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Notificações
        </button>
      </div>

      {tab === 'watchlists' && <TabWatchlists userId={user.id} />}
      {tab === 'oportunidades' && <TabOportunidades userId={user.id} />}
      {tab === 'alertas' && <TabNotificacoes userId={user.id} />}
    </div>
  );
}

function TabWatchlists({ userId }: { userId: string }) {
  const [list, setList] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    supabase
      .from('marketplace_watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        setError(err?.message ?? null);
        setList(Array.isArray(data) ? (data as Watchlist[]) : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchList();
  }, [userId]);

  if (loading && list.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>
          Listas de monitoramento do Marketplace.
        </p>
        {!showForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: 'var(--brand-500)', color: 'var(--text)', ...contentStyle }}
          >
            Nova watchlist
          </button>
        )}
      </div>

      {(showForm || editingId) && (
        <WatchlistFormInline
          userId={userId}
          editId={editingId}
          onSuccess={() => {
            setShowForm(false);
            setEditingId(null);
            fetchList();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger-500)', ...contentStyle }}>{error}</p>
      )}

      {!showForm && !editingId && list.length === 0 && (
        <div
          className="rounded-lg border p-8 text-center"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>
            Nenhuma watchlist. Clique em Nova watchlist para criar.
          </p>
        </div>
      )}

      {!showForm && !editingId && list.length > 0 && (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Termo</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Preço</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Local</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Ativa</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(list ?? []).map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--text)', ...contentStyle }}>{w.name}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>{w.search_term}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>
                    {w.min_price != null || w.max_price != null ? `${w.min_price ?? '—'} - ${w.max_price ?? '—'}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>
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
                    <button
                      type="button"
                      onClick={() => setEditingId(w.id)}
                      className="text-sm"
                      style={{ color: 'var(--brand-400)', ...contentStyle }}
                    >
                      Editar
                    </button>
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

function WatchlistFormInline({
  userId,
  editId,
  onSuccess,
  onCancel,
}: {
  userId: string;
  editId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!editId) {
      setLoading(false);
      return;
    }
    supabase
      .from('marketplace_watchlists')
      .select('*')
      .eq('id', editId)
      .eq('user_id', userId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setLoading(false);
          return;
        }
        const w = data as Watchlist;
        setName(w.name);
        setSearchTerm(w.search_term);
        setMinPrice(w.min_price != null ? String(w.min_price) : '');
        setMaxPrice(w.max_price != null ? String(w.max_price) : '');
        setState(w.state ?? '');
        setCity(w.city ?? '');
        setIsActive(w.is_active);
        setLoading(false);
      });
  }, [editId, userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload: WatchlistInsert = {
      name,
      search_term: searchTerm,
      min_price: minPrice === '' ? null : Number(minPrice),
      max_price: maxPrice === '' ? null : Number(maxPrice),
      state: state || null,
      city: city || null,
      is_active: isActive,
    };
    if (editId) {
      const { error: err } = await supabase
        .from('marketplace_watchlists')
        .update(payload)
        .eq('id', editId)
        .eq('user_id', userId);
      if (err) setError(err.message);
      else onSuccess();
    } else {
      const { error: err } = await supabase.from('marketplace_watchlists').insert({ user_id: userId, ...payload });
      if (err) setError(err.message);
      else onSuccess();
    }
    setSaving(false);
  }

  const inputClass = 'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]';
  const inputStyle = { background: 'var(--surface-100)', borderColor: 'var(--border)', color: 'var(--text)', ...contentStyle };

  if (loading) return <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>Carregando...</p>;

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4" style={{ background: 'var(--surface-200)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-medium" style={{ color: 'var(--text)', fontFamily: 'var(--font-header)' }}>
        {editId ? 'Editar watchlist' : 'Nova watchlist'}
      </h3>
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', ...contentStyle }}>Nome</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', ...contentStyle }}>Termo de busca</label>
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} required className={inputClass} style={inputStyle} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', ...contentStyle }}>Preço mín.</label>
          <input type="number" step="0.01" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', ...contentStyle }}>Preço máx.</label>
          <input type="number" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', ...contentStyle }}>Estado</label>
          <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', ...contentStyle }}>Cidade</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="wl-active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
        <label htmlFor="wl-active" className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>Ativa</label>
      </div>
      {error && <p className="text-sm" style={{ color: 'var(--danger-500)', ...contentStyle }}>{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--brand-500)', color: 'var(--text)', ...contentStyle }}>
          {saving ? 'Salvando...' : editId ? 'Salvar' : 'Criar'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--text)', ...contentStyle }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function TabOportunidades({ userId }: { userId: string }) {
  const [items, setItems] = useState<OpportunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: watchlists, error: errW } = await supabase.from('marketplace_watchlists').select('id, name').eq('user_id', userId);
        if (errW) throw errW;
        const wMap = new Map((watchlists ?? []).map((w: { id: string; name: string }) => [w.id, w.name]));
        const watchlistIds = [...wMap.keys()];
        if (watchlistIds.length === 0) {
          if (!cancelled) setItems([]);
          if (!cancelled) setLoading(false);
          return;
        }
        const { data: matches, error: errM } = await supabase
          .from('marketplace_matches')
          .select('id, watchlist_id, listing_id, matched_at')
          .in('watchlist_id', watchlistIds)
          .order('matched_at', { ascending: false });
        if (errM) throw errM;
        if (!Array.isArray(matches) || matches.length === 0) {
          if (!cancelled) setItems([]);
          if (!cancelled) setLoading(false);
          return;
        }
        const listingIds = [...new Set((matches as { listing_id: string }[]).map((m) => m.listing_id))];
        const { data: listings, error: errL } = await supabase
          .from('marketplace_listings')
          .select('id, title, price, location_text, city, state, external_url')
          .in('id', listingIds);
        if (errL) throw errL;
        type ListingRow = { id: string; title: string; price: number | null; location_text: string | null; city: string | null; state: string | null; external_url: string | null };
        const lMap = new Map((listings ?? []).map((l: ListingRow) => [l.id, l]));
        const rows: OpportunityRow[] = (Array.isArray(matches) ? matches : []).map((m: { id: string; watchlist_id: string; listing_id: string; matched_at: string }) => {
          const listing = lMap.get(m.listing_id);
          return {
            matchId: m.id,
            watchlistName: wMap.get(m.watchlist_id) ?? '',
            matchedAt: m.matched_at,
            listing: listing
              ? { id: listing.id, title: listing.title, price: listing.price, location_text: listing.location_text, city: listing.city, state: listing.state, external_url: listing.external_url ?? '#' }
              : { id: '', title: '—', price: null, location_text: null, city: null, state: null, external_url: '#' },
          };
        });
        if (!cancelled) setItems(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>Carregando...</p>;
  if (error) return <p className="text-sm" style={{ color: 'var(--danger-500)', ...contentStyle }}>{error}</p>;
  if (items.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>Nenhuma oportunidade ainda.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Produto</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Preço</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Localização</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Watchlist</th>
            <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)', ...contentStyle }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((row) => (
            <tr key={row.matchId} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="py-3 px-4 font-medium" style={{ color: 'var(--text)', ...contentStyle }}>{row.listing.title}</td>
              <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>{formatPrice(row.listing.price)}</td>
              <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>
                {row.listing.location_text || [row.listing.city, row.listing.state].filter(Boolean).join(', ') || '—'}
              </td>
              <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>{row.watchlistName}</td>
              <td className="py-3 px-4 text-right">
                <a href={row.listing.external_url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--brand-400)', ...contentStyle }}>Abrir anúncio</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabNotificacoes({ userId }: { userId: string }) {
  const [items, setItems] = useState<(MarketplaceAlertRow & { listing?: ListingRow | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: alerts, error: errAlerts } = await supabase
          .from('marketplace_alerts')
          .select('*')
          .eq('user_id', userId)
          .is('dismissed_at', null)
          .order('created_at', { ascending: false });
        if (errAlerts) throw errAlerts;
        if (!Array.isArray(alerts) || alerts.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
        const listingIds = [...new Set((alerts as MarketplaceAlertRow[]).map((a) => a.listing_id))];
        const { data: listings } = await supabase
          .from('marketplace_listings')
          .select('id, title, price, location_text, city, state, external_url')
          .in('id', listingIds);
        const lMap = new Map((listings ?? []).map((l: ListingRow) => [l.id, l]));
        const merged = Array.isArray(alerts) ? (alerts as MarketplaceAlertRow[]).map((a) => ({ ...a, listing: lMap.get(a.listing_id) ?? null })) : [];
        if (!cancelled) setItems(merged);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  async function markRead(id: string) {
    await supabase.from('marketplace_alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
    setItems((prev) => (prev ?? []).map((a) => (a.id === id ? { ...a, is_read: true, read_at: new Date().toISOString() } : a)));
  }

  async function dismiss(id: string) {
    await supabase.from('marketplace_alerts').update({ dismissed_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
    setItems((prev) => (prev ?? []).filter((a) => a.id !== id));
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>Carregando...</p>;
  if (error) return <p className="text-sm" style={{ color: 'var(--danger-500)', ...contentStyle }}>{error}</p>;
  if (items.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)', ...contentStyle }}>Nenhum alerta no momento.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {(items ?? []).map((a) => (
        <li
          key={a.id}
          className="rounded-lg border p-4"
          style={{
            background: 'var(--surface-200)',
            borderColor: 'var(--border)',
            borderRadius: '8px',
            borderLeftWidth: a.is_read ? 1 : 4,
            borderLeftColor: a.is_read ? 'var(--border)' : 'var(--brand-500)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>{a.title}</p>
              {a.message && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', ...contentStyle }}>{a.message}</p>}
              {a.listing && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)', ...contentStyle }}>
                  {formatPrice(a.listing.price)} · {a.listing.location_text || [a.listing.city, a.listing.state].filter(Boolean).join(', ') || '—'}
                </p>
              )}
              {a.listing?.external_url && (
                <a href={a.listing.external_url} target="_blank" rel="noopener noreferrer" className="text-sm mt-1 inline-block" style={{ color: 'var(--brand-400)', ...contentStyle }}>Ver anúncio →</a>
              )}
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)', ...contentStyle }}>{formatDate(a.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!a.is_read && (
                <button type="button" onClick={() => markRead(a.id)} className="text-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface-100)', color: 'var(--text)', ...contentStyle }}>Marcar lido</button>
              )}
              <button type="button" onClick={() => dismiss(a.id)} className="text-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface-100)', color: 'var(--text-muted)', ...contentStyle }}>Dispensar</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
