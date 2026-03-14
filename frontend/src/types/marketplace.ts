export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  search_term: string;
  min_price: number | null;
  max_price: number | null;
  state: string | null;
  city: string | null;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WatchlistInsert {
  name: string;
  search_term: string;
  min_price?: number | null;
  max_price?: number | null;
  state?: string | null;
  city?: string | null;
  is_active?: boolean;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  price: number | null;
  location_text: string | null;
  city: string | null;
  state: string | null;
  external_url: string;
}

export interface MarketplaceMatch {
  id: string;
  watchlist_id: string;
  listing_id: string;
  matched_at: string;
}

export interface OpportunityRow {
  listing: MarketplaceListing;
  watchlistName: string;
  matchId: string;
  matchedAt: string;
}
