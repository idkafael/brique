import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isMockMode } from '../lib/mockMode';
import type { Watchlist, WatchlistInsert } from '../types/marketplace';

const inputClass =
  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]';
const inputStyle = {
  background: 'var(--surface-100)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
};

export default function WatchlistForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isEdit || !user?.id || isMockMode) {
      if (isEdit && !isMockMode && user?.id) setLoading(false);
      return;
    }
    supabase
      .from('marketplace_watchlists')
      .select('*')
      .eq('id', id!)
      .eq('user_id', user.id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('Watchlist não encontrada');
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
  }, [id, user?.id, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || isMockMode) return;
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

    if (isEdit) {
      const { error: err } = await supabase
        .from('marketplace_watchlists')
        .update({
          name: payload.name,
          search_term: payload.search_term,
          min_price: payload.min_price,
          max_price: payload.max_price,
          state: payload.state,
          city: payload.city,
          is_active: payload.is_active,
        })
        .eq('id', id!)
        .eq('user_id', user.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from('marketplace_watchlists').insert({
        user_id: user.id,
        ...payload,
      });
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    navigate('/watchlists');
  }

  if (isMockMode || !user) {
    return (
      <div className="space-y-6">
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Conecte o Supabase para criar ou editar watchlists.
        </p>
        <Link to="/watchlists" className="text-sm" style={{ color: 'var(--brand-400)' }}>
          ← Voltar
        </Link>
      </div>
    );
  }

  if (isEdit && loading) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        Carregando...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/watchlists" className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          ← Voltar
        </Link>
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>
          {isEdit ? 'Editar watchlist' : 'Nova watchlist'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Termo de busca
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Preço mínimo
            </label>
            <input
              type="number"
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Preço máximo
            </label>
            <input
              type="number"
              step="0.01"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Estado
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="ex: SP"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Cidade
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-gray-600"
          />
          <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Watchlist ativa
          </label>
        </div>
        {error && (
          <p className="text-sm" style={{ color: 'var(--danger-500)', fontFamily: 'var(--font-body)' }}>
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--brand-500)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </button>
          <Link
            to="/watchlists"
            className="rounded-lg px-4 py-2 text-sm font-medium border"
            style={{
              background: 'var(--surface-100)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
