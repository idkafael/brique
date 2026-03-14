import { getSupabaseServer } from '@/lib/supabase/server';
import type { Listing } from '@/types';

export interface OpportunityRow {
  listing: Listing;
  watchlistId: string;
  watchlistName: string;
  matchId: string;
  matchedAt: string;
  alertId: string | null;
  isRead: boolean;
}

export async function getOpportunities(userId: string): Promise<OpportunityRow[]> {
  const supabase = getSupabaseServer();

  const { data: watchlists } = await supabase
    .from('marketplace_watchlists')
    .select('id, name')
    .eq('user_id', userId);
  const wMap = new Map((watchlists ?? []).map((w: { id: string; name: string }) => [w.id, w.name]));

  const { data: matches } = await supabase
    .from('marketplace_matches')
    .select('id, watchlist_id, listing_id, matched_at')
    .in('watchlist_id', [...wMap.keys()])
    .order('matched_at', { ascending: false });

  if (!matches?.length) return [];

  const listingIds = [...new Set((matches as { listing_id: string }[]).map((m) => m.listing_id))];
  const { data: listingsData } = await supabase
    .from('marketplace_listings')
    .select('*')
    .in('id', listingIds);
  const listingsMap = new Map(
    (listingsData ?? []).map((r: Record<string, unknown>) => [r.id as string, r])
  );

  const { data: alerts } = await supabase
    .from('marketplace_alerts')
    .select('id, listing_id, watchlist_id, is_read')
    .eq('user_id', userId);
  const alertByListing = new Map(
    (alerts ?? []).map((a: { listing_id: string; watchlist_id: string; id: string; is_read: boolean }) => [
      `${a.listing_id}:${a.watchlist_id}`,
      { id: a.id, isRead: a.is_read },
    ])
  );

  const rows: OpportunityRow[] = [];
  for (const m of matches as { id: string; watchlist_id: string; listing_id: string; matched_at: string }[]) {
    const listingRow = listingsMap.get(m.listing_id);
    if (!listingRow) continue;
    const listing = mapRowToListing(listingRow);
    const alert = alertByListing.get(`${m.listing_id}:${m.watchlist_id}`);
    rows.push({
      listing,
      watchlistId: m.watchlist_id,
      watchlistName: wMap.get(m.watchlist_id) ?? '',
      matchId: m.id,
      matchedAt: m.matched_at,
      alertId: alert?.id ?? null,
      isRead: alert?.isRead ?? false,
    });
  }
  return rows;
}

function mapRowToListing(r: Record<string, unknown>): Listing {
  return {
    id: r.id as string,
    source: r.source as string,
    externalId: r.external_id as string | null,
    externalUrl: r.external_url as string,
    title: r.title as string,
    price: r.price != null ? Number(r.price) : null,
    locationText: r.location_text as string | null,
    city: r.city as string | null,
    state: r.state as string | null,
    postedAt: r.posted_at as string | null,
    firstSeenAt: r.first_seen_at as string,
    lastSeenAt: r.last_seen_at as string,
    dedupeHash: r.dedupe_hash as string | null,
    rawData: r.raw_data as Record<string, unknown> | null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
