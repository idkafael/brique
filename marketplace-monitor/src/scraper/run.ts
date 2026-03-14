import { getSupabaseService } from '@/lib/supabase/server';
import * as watchlistsRepo from '@/repositories/watchlists';
import * as listingsRepo from '@/repositories/listings';
import * as matchesRepo from '@/repositories/matches';
import * as alertsRepo from '@/repositories/alerts';
import * as scrapeRunsRepo from '@/repositories/scrape-runs';
import { normalizeList } from './normalize';
import { buildDedupeHash, dedupeByHash } from './dedupe';
import { filterMatching } from './match';
import type { ScraperAdapter } from './types';
import type { NormalizedListing } from '@/types';
import type { Watchlist } from '@/types';

export interface RunResult {
  watchlistId: string;
  runId: string;
  status: 'success' | 'error';
  totalFound: number;
  totalNew: number;
  errorMessage?: string | null;
}

export async function runScraperForWatchlist(
  watchlist: Watchlist,
  adapter: ScraperAdapter
): Promise<RunResult> {
  const supabase = getSupabaseService();
  const run = await scrapeRunsRepo.createScrapeRun(supabase, watchlist.id);

  try {
    const raw = await adapter.search(watchlist);
    const normalized = normalizeList(raw);
    const deduped = dedupeByHash(normalized, buildDedupeHash);

    let totalNew = 0;
    for (const n of deduped) {
      const hash = buildDedupeHash(n);
      const { listing, isNew } = await listingsRepo.upsertListing(supabase, {
        externalId: n.externalId ?? null,
        externalUrl: n.externalUrl,
        title: n.title,
        price: n.price ?? null,
        locationText: n.locationText ?? null,
        city: n.city ?? null,
        state: n.state ?? null,
        postedAt: n.postedAt ?? null,
        dedupeHash: hash,
        rawData: n.rawData ?? null,
      });

      if (isNew) {
        const matching = filterMatching([n], watchlist);
        if (matching.length > 0) {
          const already = await matchesRepo.existsMatch(supabase, watchlist.id, listing.id);
          if (!already) {
            await matchesRepo.createMatch(supabase, watchlist.id, listing.id);
            await alertsRepo.createAlert(
              supabase,
              watchlist.userId,
              watchlist.id,
              listing.id,
              n.title,
              `Novo anúncio: ${n.title} - ${formatPrice(n.price)} - ${n.locationText ?? n.city ?? 'Brasil'}`
            );
            totalNew++;
          }
        }
      }
    }

    await scrapeRunsRepo.finishScrapeRun(
      supabase,
      run.id,
      'success',
      deduped.length,
      totalNew
    );
    await watchlistsRepo.setWatchlistLastRun(supabase, watchlist.id, new Date());

    return {
      watchlistId: watchlist.id,
      runId: run.id,
      status: 'success',
      totalFound: deduped.length,
      totalNew,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await scrapeRunsRepo.finishScrapeRun(
      supabase,
      run.id,
      'error',
      0,
      0,
      message
    );
    return {
      watchlistId: watchlist.id,
      runId: run.id,
      status: 'error',
      totalFound: 0,
      totalNew: 0,
      errorMessage: message,
    };
  }
}

function formatPrice(p: number | null | undefined): string {
  if (p == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);
}
