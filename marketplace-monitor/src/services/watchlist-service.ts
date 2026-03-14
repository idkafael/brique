import { getSupabaseServer } from '@/lib/supabase/server';
import * as watchlistsRepo from '@/repositories/watchlists';
import type { Watchlist, WatchlistInsert, WatchlistUpdate } from '@/types';

export async function getWatchlists(userId: string): Promise<Watchlist[]> {
  const supabase = getSupabaseServer();
  return watchlistsRepo.getWatchlistsByUserId(supabase, userId);
}

export async function getWatchlist(id: string, userId: string): Promise<Watchlist | null> {
  const supabase = getSupabaseServer();
  return watchlistsRepo.getWatchlistById(supabase, id, userId);
}

export async function createWatchlist(userId: string, input: WatchlistInsert): Promise<Watchlist> {
  const supabase = getSupabaseServer();
  return watchlistsRepo.createWatchlist(supabase, userId, input);
}

export async function updateWatchlist(
  id: string,
  userId: string,
  input: WatchlistUpdate
): Promise<Watchlist> {
  const supabase = getSupabaseServer();
  return watchlistsRepo.updateWatchlist(supabase, id, userId, input);
}

export async function deleteWatchlist(id: string, userId: string): Promise<void> {
  const supabase = getSupabaseServer();
  return watchlistsRepo.deleteWatchlist(supabase, id, userId);
}
