import type { NormalizedListing } from '@/types';

export function buildDedupeHash(n: NormalizedListing): string {
  const title = (n.title ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  const price = n.price ?? 0;
  const loc = (n.locationText ?? n.city ?? n.state ?? '').toLowerCase().trim();
  return `${title}|${price}|${loc}`;
}

export function dedupeByHash(
  list: NormalizedListing[],
  hashFn: (n: NormalizedListing) => string
): NormalizedListing[] {
  const seen = new Set<string>();
  return list.filter((n) => {
    const h = hashFn(n);
    if (seen.has(h)) return false;
    seen.add(h);
    return true;
  });
}
