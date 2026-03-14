import type { ScraperAdapter } from './types';
import type { Watchlist } from '@/types';

/** Adapter de mock: retorna anúncios fictícios para desenvolvimento */
export const mockAdapter: ScraperAdapter = {
  async search(watchlist: Watchlist): Promise<{ externalId?: string; externalUrl?: string; title: string; price?: number; locationText?: string; city?: string; state?: string }[]> {
    await new Promise((r) => setTimeout(r, 500));
    const base = [
      {
        externalId: `mock-${watchlist.id}-1`,
        externalUrl: `https://www.facebook.com/marketplace/item/mock-1`,
        title: `${watchlist.searchTerm} - Exemplo 1`,
        price: watchlist.minPrice ?? 100,
        locationText: watchlist.city ? `${watchlist.city}, ${watchlist.state ?? 'BR'}` : 'Brasil',
        city: watchlist.city ?? 'São Paulo',
        state: watchlist.state ?? 'SP',
      },
      {
        externalId: `mock-${watchlist.id}-2`,
        externalUrl: `https://www.facebook.com/marketplace/item/mock-2`,
        title: `${watchlist.searchTerm} - Exemplo 2`,
        price: (watchlist.minPrice ?? 0) + 50,
        locationText: 'Curitiba, PR',
        city: 'Curitiba',
        state: 'PR',
      },
    ];
    return base;
  },
};
