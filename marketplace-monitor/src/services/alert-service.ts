import { getSupabaseServer } from '@/lib/supabase/server';
import * as alertsRepo from '@/repositories/alerts';
import * as listingsRepo from '@/repositories/listings';
import type { Alert, AlertWithListing } from '@/types';

export async function getAlerts(
  userId: string,
  options?: { onlyUnread?: boolean; limit?: number }
): Promise<Alert[]> {
  const supabase = getSupabaseServer();
  return alertsRepo.getAlertsByUserId(supabase, userId, options);
}

export async function getAlertsWithListings(
  userId: string,
  options?: { onlyUnread?: boolean; limit?: number }
): Promise<AlertWithListing[]> {
  const supabase = getSupabaseServer();
  const alerts = await alertsRepo.getAlertsByUserId(supabase, userId, options);
  const listingIds = [...new Set(alerts.map((a) => a.listingId))];
  const listings = await listingsRepo.getListingsByIds(supabase, listingIds);
  return alertsRepo.withListings(alerts, listings).map((a) => ({
    ...a,
    watchlist: undefined,
  }));
}

export async function markRead(alertId: string, userId: string): Promise<void> {
  const supabase = getSupabaseServer();
  return alertsRepo.markAlertRead(supabase, alertId, userId);
}

export async function dismiss(alertId: string, userId: string): Promise<void> {
  const supabase = getSupabaseServer();
  return alertsRepo.dismissAlert(supabase, alertId, userId);
}
