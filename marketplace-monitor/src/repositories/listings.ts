import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Listing, ListingInsert } from '@/types';

type Row = Database['public']['Tables']['marketplace_listings']['Row'];

function rowToListing(r: Row): Listing {
  return {
    id: r.id,
    source: r.source,
    externalId: r.external_id,
    externalUrl: r.external_url,
    title: r.title,
    price: r.price != null ? Number(r.price) : null,
    locationText: r.location_text,
    city: r.city,
    state: r.state,
    postedAt: r.posted_at,
    firstSeenAt: r.first_seen_at,
    lastSeenAt: r.last_seen_at,
    dedupeHash: r.dedupe_hash,
    rawData: r.raw_data,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function findListingByExternalId(supabase: SupabaseClient<Database>, externalId: string) {
  const { data } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('external_id', externalId)
    .maybeSingle();
  return data ? rowToListing(data) : null;
}

export async function findListingByExternalUrl(supabase: SupabaseClient<Database>, externalUrl: string) {
  const { data } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('external_url', externalUrl)
    .maybeSingle();
  return data ? rowToListing(data) : null;
}

export async function findListingByDedupeHash(supabase: SupabaseClient<Database>, dedupeHash: string) {
  const { data } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('dedupe_hash', dedupeHash)
    .maybeSingle();
  return data ? rowToListing(data) : null;
}

export async function upsertListing(supabase: SupabaseClient<Database>, input: ListingInsert) {
  const now = new Date().toISOString();
  const row = {
    source: input.source ?? 'facebook_marketplace',
    external_id: input.externalId ?? null,
    external_url: input.externalUrl,
    title: input.title,
    price: input.price ?? null,
    location_text: input.locationText ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    posted_at: input.postedAt ?? null,
    dedupe_hash: input.dedupeHash ?? null,
    raw_data: input.rawData ?? null,
    first_seen_at: now,
    last_seen_at: now,
  };

  if (input.externalId) {
    const { data: existing } = await supabase
      .from('marketplace_listings')
      .select('id, first_seen_at')
      .eq('external_id', input.externalId)
      .maybeSingle();
    if (existing) {
      const { data: updated, error } = await supabase
        .from('marketplace_listings')
        .update({
          last_seen_at: now,
          title: row.title,
          price: row.price,
          location_text: row.location_text,
          city: row.city,
          state: row.state,
          posted_at: row.posted_at,
          raw_data: row.raw_data,
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { listing: rowToListing(updated!), isNew: false };
    }
  }

  if (input.externalUrl) {
    const { data: existing } = await supabase
      .from('marketplace_listings')
      .select('id, first_seen_at')
      .eq('external_url', input.externalUrl)
      .maybeSingle();
    if (existing) {
      const { data: updated, error } = await supabase
        .from('marketplace_listings')
        .update({
          last_seen_at: now,
          title: row.title,
          price: row.price,
          location_text: row.location_text,
          city: row.city,
          state: row.state,
          posted_at: row.posted_at,
          raw_data: row.raw_data,
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { listing: rowToListing(updated!), isNew: false };
    }
  }

  const { data: inserted, error } = await supabase
    .from('marketplace_listings')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return { listing: rowToListing(inserted!), isNew: true };
}

export async function getListingsByIds(supabase: SupabaseClient<Database>, ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .in('id', ids);
  if (error) throw error;
  return (data ?? []).map(rowToListing);
}
