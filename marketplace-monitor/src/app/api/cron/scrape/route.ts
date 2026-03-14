import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/server';
import * as watchlistsRepo from '@/repositories/watchlists';
import { runScraperForWatchlist } from '@/scraper/run';
import { mockAdapter } from '@/scraper/mock-adapter';

/**
 * Execução periódica do scraper (sem Redis).
 * Chamar via: Vercel Cron (CRON_SECRET), ou agendador externo (cron job / GitHub Actions).
 * GET com header Authorization: Bearer <CRON_SECRET> ou ?secret=CRON_SECRET
 */
export async function GET(request: Request) {
  const secret =
    request.headers.get('authorization')?.replace('Bearer ', '') ??
    new URL(request.url).searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = getSupabaseService();
  const watchlists = await watchlistsRepo.getActiveWatchlists(supabase);
  const results = [];

  for (const w of watchlists) {
    const result = await runScraperForWatchlist(w, mockAdapter);
    results.push(result);
  }

  return NextResponse.json({ ran: watchlists.length, results });
}
