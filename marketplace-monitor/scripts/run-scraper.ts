/**
 * Roda o scraper via CLI (sem precisar do Next.js no ar).
 * Uso: npm run scrape (na raiz) ou cd marketplace-monitor && npm run scrape
 * Requer .env.local em marketplace-monitor/ com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Erro: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em marketplace-monitor/.env.local');
    process.exit(1);
  }

  const { getActiveWatchlists } = await import('../src/repositories/watchlists');
  const { runScraperForWatchlist } = await import('../src/scraper/run');
  const { mockAdapter } = await import('../src/scraper/mock-adapter');
  const { getSupabaseService } = await import('../src/lib/supabase/server');

  const supabase = getSupabaseService();
  const watchlists = await getActiveWatchlists(supabase);
  if (watchlists.length === 0) {
    console.log('Nenhuma watchlist ativa. Crie uma na aba Alertas → Watchlists.');
    process.exit(0);
  }

  console.log(`Rodando scraper para ${watchlists.length} watchlist(s)...`);
  for (const w of watchlists) {
    const result = await runScraperForWatchlist(w, mockAdapter);
    console.log(`  ${w.name}: ${result.status} – ${result.totalFound} anúncios, ${result.totalNew} novo(s)${result.errorMessage ? ` – ${result.errorMessage}` : ''}`);
  }
  console.log('Concluído.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
