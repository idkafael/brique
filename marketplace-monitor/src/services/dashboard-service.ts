import { getSupabaseServer } from '@/lib/supabase/server';

export interface DashboardStats {
  activeWatchlists: number;
  totalListings: number;
  totalMatches: number;
  unreadAlerts: number;
  topCities: { city: string | null; count: number }[];
  topTerms: { searchTerm: string; count: number }[];
  matchesByDay: { date: string; count: number }[];
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = getSupabaseServer();
  const watchlistIds = await getWatchlistIds(supabase, userId);

  const [watchlistsRes, listingsRes, matchesRes, alertsRes, citiesRes, termsRes, dailyRes] =
    await Promise.all([
      supabase
        .from('marketplace_watchlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true),
      supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }),
      watchlistIds.length > 0
        ? supabase
            .from('marketplace_matches')
            .select('id', { count: 'exact', head: true })
            .in('watchlist_id', watchlistIds)
        : Promise.resolve({ count: 0 }),
      supabase
        .from('marketplace_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false),
      supabase
        .from('marketplace_listings')
        .select('city')
        .not('city', 'is', null),
      supabase
        .from('marketplace_watchlists')
        .select('search_term')
        .eq('user_id', userId),
      getMatchesByDay(supabase, userId),
    ]);

  const matchesCount = typeof matchesRes.count === 'number' ? matchesRes.count : 0;

  const cityCounts = (citiesRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
    const c = (row as { city: string | null }).city ?? 'Outros';
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});
  const topCities = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const termCounts = (termsRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
    const t = (row as { search_term: string }).search_term;
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const topTerms = Object.entries(termCounts)
    .map(([searchTerm, count]) => ({ searchTerm, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    activeWatchlists: watchlistsRes.count ?? 0,
    totalListings: listingsRes.count ?? 0,
    totalMatches: matchesCount,
    unreadAlerts: alertsRes.count ?? 0,
    topCities,
    topTerms,
    matchesByDay: dailyRes,
  };
}

async function getWatchlistIds(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from('marketplace_watchlists')
    .select('id')
    .eq('user_id', userId);
  return (data ?? []).map((r: { id: string }) => r.id);
}

async function getMatchesByDay(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  userId: string
): Promise<{ date: string; count: number }[]> {
  const watchlistIds = await getWatchlistIds(supabase, userId);
  if (watchlistIds.length === 0) return [];

  const { data } = await supabase
    .from('marketplace_matches')
    .select('matched_at')
    .in('watchlist_id', watchlistIds)
    .gte('matched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const byDay: Record<string, number> = {};
  for (const row of data ?? []) {
    const d = (row as { matched_at: string }).matched_at.slice(0, 10);
    byDay[d] = (byDay[d] ?? 0) + 1;
  }
  return Object.entries(byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
