import type { Watchlist } from '@/types';
import type { NormalizedListing } from '@/types';

export interface ScraperAdapter {
  /** Executa busca para uma watchlist e retorna lista de anúncios brutos */
  search(watchlist: Watchlist): Promise<RawListing[]>;
}

export interface RawListing {
  externalId?: string | null;
  externalUrl?: string;
  title: string;
  price?: number | string | null;
  locationText?: string | null;
  city?: string | null;
  state?: string | null;
  postedAt?: string | null;
  [key: string]: unknown;
}

export interface ScraperContext {
  watchlist: Watchlist;
  normalized: NormalizedListing[];
  runId: string;
}
