import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Match } from '@/types';

type Row = Database['public']['Tables']['marketplace_matches']['Row'];

function rowToMatch(r: Row): Match {
  return {
    id: r.id,
    watchlistId: r.watchlist_id,
    listingId: r.listing_id,
    score: r.score != null ? Number(r.score) : null,
    matchedAt: r.matched_at,
    createdAt: r.created_at,
  };
}

export async function existsMatch(
  supabase: SupabaseClient<Database>,
  watchlistId: string,
  listingId: string
) {
  const { data } = await supabase
    .from('marketplace_matches')
    .select('id')
    .eq('watchlist_id', watchlistId)
    .eq('listing_id', listingId)
    .maybeSingle();
  return !!data;
}

export async function createMatch(
  supabase: SupabaseClient<Database>,
  watchlistId: string,
  listingId: string,
  score?: number
) {
  const { data, error } = await supabase
    .from('marketplace_matches')
    .insert({
      watchlist_id: watchlistId,
      listing_id: listingId,
      score: score ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToMatch(data);
}
