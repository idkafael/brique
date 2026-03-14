import type { Watchlist } from '@/types';
import type { NormalizedListing } from '@/types';

export function listingMatchesWatchlist(listing: NormalizedListing, w: Watchlist): boolean {
  const term = (w.searchTerm ?? '').toLowerCase();
  const title = (listing.title ?? '').toLowerCase();
  if (term && !title.includes(term)) return false;

  const price = listing.price ?? 0;
  if (w.minPrice != null && price < w.minPrice) return false;
  if (w.maxPrice != null && price > w.maxPrice) return false;

  const loc = [listing.locationText, listing.city, listing.state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (w.state && !loc.includes(w.state.toLowerCase())) return false;
  if (w.city && !loc.includes(w.city.toLowerCase())) return false;

  return true;
}

export function filterMatching(
  listings: NormalizedListing[],
  watchlist: Watchlist
): NormalizedListing[] {
  return listings.filter((l) => listingMatchesWatchlist(l, watchlist));
}
