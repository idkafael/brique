import type { RawListing } from './types';
import type { NormalizedListing } from '@/types';

export function normalizeListing(raw: RawListing): NormalizedListing {
  const price =
    typeof raw.price === 'number'
      ? raw.price
      : typeof raw.price === 'string'
        ? parseFloat(raw.price.replace(/\D/g, '')) / 100 || null
        : null;

  return {
    externalId: raw.externalId ?? null,
    externalUrl: raw.externalUrl ?? (raw.external_url as string) ?? '',
    title: String(raw.title ?? '').trim(),
    price: price ?? null,
    locationText: raw.locationText ?? raw.location_text ?? null,
    city: raw.city ?? null,
    state: raw.state ?? null,
    postedAt: raw.postedAt ?? raw.posted_at ?? null,
    rawData: raw,
  };
}

export function normalizeList(raw: RawListing[]): NormalizedListing[] {
  return raw.map(normalizeListing).filter((n) => n.externalUrl && n.title);
}
