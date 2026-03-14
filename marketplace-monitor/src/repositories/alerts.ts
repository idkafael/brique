import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Alert, AlertWithListing } from '@/types';
import type { Listing } from '@/types';

type Row = Database['public']['Tables']['marketplace_alerts']['Row'];

function rowToAlert(r: Row): Alert {
  return {
    id: r.id,
    userId: r.user_id,
    watchlistId: r.watchlist_id,
    listingId: r.listing_id,
    title: r.title,
    message: r.message,
    isRead: r.is_read,
    readAt: r.read_at,
    dismissedAt: r.dismissed_at,
    createdAt: r.created_at,
  };
}

export async function createAlert(
  supabase: SupabaseClient<Database>,
  userId: string,
  watchlistId: string,
  listingId: string,
  title: string,
  message?: string | null
) {
  const { data, error } = await supabase
    .from('marketplace_alerts')
    .insert({
      user_id: userId,
      watchlist_id: watchlistId,
      listing_id: listingId,
      title,
      message: message ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToAlert(data);
}

export async function getAlertsByUserId(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: { onlyUnread?: boolean; limit?: number }
) {
  let q = supabase
    .from('marketplace_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (options?.onlyUnread) q = q.eq('is_read', false);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToAlert);
}

export async function markAlertRead(supabase: SupabaseClient<Database>, id: string, userId: string) {
  const { error } = await supabase
    .from('marketplace_alerts')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function dismissAlert(supabase: SupabaseClient<Database>, id: string, userId: string) {
  const { error } = await supabase
    .from('marketplace_alerts')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export function withListings(alerts: Alert[], listings: Listing[]): AlertWithListing[] {
  const byId = new Map(listings.map((l) => [l.id, l]));
  return alerts.map((a) => ({
    ...a,
    listing: byId.get(a.listingId) ?? null,
  }));
}
