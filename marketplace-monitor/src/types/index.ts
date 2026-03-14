/** Entidades e DTOs do módulo Marketplace Monitor */

export interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  searchTerm: string;
  minPrice: number | null;
  maxPrice: number | null;
  state: string | null;
  city: string | null;
  isActive: boolean;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistInsert {
  name: string;
  searchTerm: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  state?: string | null;
  city?: string | null;
  isActive?: boolean;
}

export interface WatchlistUpdate extends Partial<WatchlistInsert> {}

export interface Listing {
  id: string;
  source: string;
  externalId: string | null;
  externalUrl: string;
  title: string;
  price: number | null;
  locationText: string | null;
  city: string | null;
  state: string | null;
  postedAt: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  dedupeHash: string | null;
  rawData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListingInsert {
  source?: string;
  externalId?: string | null;
  externalUrl: string;
  title: string;
  price?: number | null;
  locationText?: string | null;
  city?: string | null;
  state?: string | null;
  postedAt?: string | null;
  dedupeHash?: string | null;
  rawData?: Record<string, unknown> | null;
}

export interface Match {
  id: string;
  watchlistId: string;
  listingId: string;
  score: number | null;
  matchedAt: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  watchlistId: string;
  listingId: string;
  title: string;
  message: string | null;
  isRead: boolean;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export interface AlertWithListing extends Alert {
  listing?: Listing | null;
  watchlist?: { name: string } | null;
}

export interface ScrapeRun {
  id: string;
  watchlistId: string;
  status: 'running' | 'success' | 'error';
  totalFound: number;
  totalNew: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
}

export type ScrapeRunStatus = 'running' | 'success' | 'error';

/** Dados normalizados vindos do scraper (antes de persistir) */
export interface NormalizedListing {
  externalId?: string | null;
  externalUrl: string;
  title: string;
  price?: number | null;
  locationText?: string | null;
  city?: string | null;
  state?: string | null;
  postedAt?: string | null;
  rawData?: Record<string, unknown> | null;
}
