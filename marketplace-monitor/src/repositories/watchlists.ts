import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Watchlist, WatchlistInsert, WatchlistUpdate } from '@/types';

type Row = Database['public']['Tables']['marketplace_watchlists']['Row'];

function rowToWatchlist(r: Row): Watchlist {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    searchTerm: r.search_term,
    minPrice: r.min_price != null ? Number(r.min_price) : null,
    maxPrice: r.max_price != null ? Number(r.max_price) : null,
    state: r.state,
    city: r.city,
    isActive: r.is_active,
    lastRunAt: r.last_run_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getWatchlistsByUserId(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from('marketplace_watchlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToWatchlist);
}

export async function getWatchlistById(supabase: SupabaseClient<Database>, id: string, userId: string) {
  const { data, error } = await supabase
    .from('marketplace_watchlists')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return rowToWatchlist(data);
}

export async function createWatchlist(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: WatchlistInsert
) {
  const { data, error } = await supabase
    .from('marketplace_watchlists')
    .insert({
      user_id: userId,
      name: input.name,
      search_term: input.searchTerm,
      min_price: input.minPrice ?? null,
      max_price: input.maxPrice ?? null,
      state: input.state ?? null,
      city: input.city ?? null,
      is_active: input.isActive ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToWatchlist(data);
}

export async function updateWatchlist(
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string,
  input: WatchlistUpdate
) {
  const payload: Record<string, unknown> = {};
  if (input.name != null) payload.name = input.name;
  if (input.searchTerm != null) payload.search_term = input.searchTerm;
  if (input.minPrice != null) payload.min_price = input.minPrice;
  if (input.maxPrice != null) payload.max_price = input.maxPrice;
  if (input.state != null) payload.state = input.state;
  if (input.city != null) payload.city = input.city;
  if (input.isActive != null) payload.is_active = input.isActive;
  const { data, error } = await supabase
    .from('marketplace_watchlists')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return rowToWatchlist(data);
}

export async function deleteWatchlist(supabase: SupabaseClient<Database>, id: string, userId: string) {
  const { error } = await supabase
    .from('marketplace_watchlists')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function getActiveWatchlists(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('marketplace_watchlists')
    .select('*')
    .eq('is_active', true)
    .order('last_run_at', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []).map(rowToWatchlist);
}

export async function setWatchlistLastRun(supabase: SupabaseClient<Database>, id: string, at: Date) {
  await supabase
    .from('marketplace_watchlists')
    .update({ last_run_at: at.toISOString() })
    .eq('id', id);
}
