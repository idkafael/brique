-- Data de entrada, data de saída e nota fiscal (URL) para briques

ALTER TABLE public.briques
  ADD COLUMN IF NOT EXISTS entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS exit_date DATE,
  ADD COLUMN IF NOT EXISTS invoice_url TEXT;

COMMENT ON COLUMN public.briques.entry_date IS 'Data de entrada do produto';
COMMENT ON COLUMN public.briques.exit_date IS 'Data de saída (opcional)';
COMMENT ON COLUMN public.briques.invoice_url IS 'URL do arquivo da nota fiscal (Storage ou link)';
