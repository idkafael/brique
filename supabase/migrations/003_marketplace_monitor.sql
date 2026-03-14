-- Módulo Marketplace Monitor: watchlists, listings, matches, alerts, scrape_runs
-- Usuários: auth.users (id, email, raw_user_meta_data->name). Sem tabela users extra.

-- Watchlists: listas de monitoramento por usuário
CREATE TABLE IF NOT EXISTS public.marketplace_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_term TEXT NOT NULL,
  min_price DECIMAL(12,2),
  max_price DECIMAL(12,2),
  state TEXT,
  city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listings: anúncios capturados (deduplicados por external_id / external_url / dedupe_hash)
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'facebook_marketplace',
  external_id TEXT,
  external_url TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(12,2),
  location_text TEXT,
  city TEXT,
  state TEXT,
  posted_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dedupe_hash TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (external_id),
  UNIQUE NULLS NOT DISTINCT (external_url)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_listings_external_id
  ON public.marketplace_listings (external_id) WHERE external_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_listings_external_url
  ON public.marketplace_listings (external_url);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_dedupe_hash
  ON public.marketplace_listings (dedupe_hash) WHERE dedupe_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_first_seen
  ON public.marketplace_listings (first_seen_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_last_seen
  ON public.marketplace_listings (last_seen_at);

-- Matches: associação watchlist <-> listing (quando anúncio bate nos critérios)
CREATE TABLE IF NOT EXISTS public.marketplace_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.marketplace_watchlists(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (watchlist_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_matches_watchlist
  ON public.marketplace_matches (watchlist_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_matches_listing
  ON public.marketplace_matches (listing_id);

-- Alerts: notificações internas (sem imagem)
CREATE TABLE IF NOT EXISTS public.marketplace_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  watchlist_id UUID NOT NULL REFERENCES public.marketplace_watchlists(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_alerts_user
  ON public.marketplace_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_alerts_is_read
  ON public.marketplace_alerts (user_id, is_read);

-- Scrape runs: histórico de execuções por watchlist
CREATE TABLE IF NOT EXISTS public.marketplace_scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.marketplace_watchlists(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running',
  total_found INTEGER DEFAULT 0,
  total_new INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_scrape_runs_watchlist
  ON public.marketplace_scrape_runs (watchlist_id);

-- Índices watchlists
CREATE INDEX IF NOT EXISTS idx_marketplace_watchlists_user
  ON public.marketplace_watchlists (user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_watchlists_active
  ON public.marketplace_watchlists (is_active) WHERE is_active = true;

-- RLS
ALTER TABLE public.marketplace_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_scrape_runs ENABLE ROW LEVEL SECURITY;

-- Watchlists: usuário só acessa as próprias
DROP POLICY IF EXISTS "marketplace_watchlists_select_own" ON public.marketplace_watchlists;
CREATE POLICY "marketplace_watchlists_select_own" ON public.marketplace_watchlists
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "marketplace_watchlists_insert_own" ON public.marketplace_watchlists;
CREATE POLICY "marketplace_watchlists_insert_own" ON public.marketplace_watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "marketplace_watchlists_update_own" ON public.marketplace_watchlists;
CREATE POLICY "marketplace_watchlists_update_own" ON public.marketplace_watchlists
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "marketplace_watchlists_delete_own" ON public.marketplace_watchlists;
CREATE POLICY "marketplace_watchlists_delete_own" ON public.marketplace_watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Listings: leitura para todos autenticados (são dados agregados); inserção/update via service role ou função
DROP POLICY IF EXISTS "marketplace_listings_select" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_select" ON public.marketplace_listings
  FOR SELECT TO authenticated USING (true);
-- Inserção/update pelo backend (service role) ou via função com SECURITY DEFINER
DROP POLICY IF EXISTS "marketplace_listings_insert" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_insert" ON public.marketplace_listings
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "marketplace_listings_update" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_update" ON public.marketplace_listings
  FOR UPDATE USING (true);

-- Matches: usuário vê matches das próprias watchlists
DROP POLICY IF EXISTS "marketplace_matches_select" ON public.marketplace_matches;
CREATE POLICY "marketplace_matches_select" ON public.marketplace_matches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.marketplace_watchlists w WHERE w.id = watchlist_id AND w.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "marketplace_matches_insert" ON public.marketplace_matches;
CREATE POLICY "marketplace_matches_insert" ON public.marketplace_matches
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.marketplace_watchlists w WHERE w.id = watchlist_id AND w.user_id = auth.uid())
  );

-- Alerts: usuário só vê os próprios
DROP POLICY IF EXISTS "marketplace_alerts_select_own" ON public.marketplace_alerts;
CREATE POLICY "marketplace_alerts_select_own" ON public.marketplace_alerts
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "marketplace_alerts_update_own" ON public.marketplace_alerts;
CREATE POLICY "marketplace_alerts_update_own" ON public.marketplace_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Scrape runs: usuário vê runs das próprias watchlists
DROP POLICY IF EXISTS "marketplace_scrape_runs_select" ON public.marketplace_scrape_runs;
CREATE POLICY "marketplace_scrape_runs_select" ON public.marketplace_scrape_runs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.marketplace_watchlists w WHERE w.id = watchlist_id AND w.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "marketplace_scrape_runs_insert" ON public.marketplace_scrape_runs;
CREATE POLICY "marketplace_scrape_runs_insert" ON public.marketplace_scrape_runs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.marketplace_watchlists w WHERE w.id = watchlist_id AND w.user_id = auth.uid())
  );

-- Trigger updated_at watchlists
CREATE OR REPLACE FUNCTION marketplace_watchlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS marketplace_watchlists_updated_at ON public.marketplace_watchlists;
CREATE TRIGGER marketplace_watchlists_updated_at
  BEFORE UPDATE ON public.marketplace_watchlists
  FOR EACH ROW EXECUTE FUNCTION marketplace_watchlists_updated_at();

CREATE OR REPLACE FUNCTION marketplace_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION marketplace_listings_updated_at();
