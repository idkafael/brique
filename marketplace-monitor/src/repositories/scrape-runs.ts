import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { ScrapeRun, ScrapeRunStatus } from '@/types';

type Row = Database['public']['Tables']['marketplace_scrape_runs']['Row'];

function rowToScrapeRun(r: Row): ScrapeRun {
  return {
    id: r.id,
    watchlistId: r.watchlist_id,
    status: r.status as ScrapeRunStatus,
    totalFound: r.total_found,
    totalNew: r.total_new,
    errorMessage: r.error_message,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    createdAt: r.created_at,
  };
}

export async function createScrapeRun(supabase: SupabaseClient<Database>, watchlistId: string) {
  const { data, error } = await supabase
    .from('marketplace_scrape_runs')
    .insert({
      watchlist_id: watchlistId,
      status: 'running',
      total_found: 0,
      total_new: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToScrapeRun(data);
}

export async function finishScrapeRun(
  supabase: SupabaseClient<Database>,
  id: string,
  status: 'success' | 'error',
  totalFound: number,
  totalNew: number,
  errorMessage?: string | null
) {
  const { error } = await supabase
    .from('marketplace_scrape_runs')
    .update({
      status,
      total_found: totalFound,
      total_new: totalNew,
      error_message: errorMessage ?? null,
      finished_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}
