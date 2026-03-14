-- CRM Brique: tabelas iniciais
-- Executar no SQL Editor do Supabase (Dashboard > SQL Editor)

-- Enum para status da brique
CREATE TYPE brique_status AS ENUM ('à venda', 'vendido');

-- Tabela de perfis (opcional, para nome do usuário; auth.users já existe)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela briques
CREATE TABLE IF NOT EXISTS public.briques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purchase_value DECIMAL(12,2) NOT NULL,
  sale_value DECIMAL(12,2) NOT NULL,
  status brique_status NOT NULL,
  origin TEXT,
  phone TEXT,
  social_media TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de imagens das briques
CREATE TABLE IF NOT EXISTS public.brique_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brique_id UUID NOT NULL REFERENCES public.briques(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_briques_user_id ON public.briques(user_id);
CREATE INDEX IF NOT EXISTS idx_briques_status ON public.briques(status);
CREATE INDEX IF NOT EXISTS idx_briques_created_at ON public.briques(created_at);
CREATE INDEX IF NOT EXISTS idx_briques_updated_at ON public.briques(updated_at);
CREATE INDEX IF NOT EXISTS idx_brique_images_brique_id ON public.brique_images(brique_id);

-- RLS: habilitar
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brique_images ENABLE ROW LEVEL SECURITY;

-- Políticas profiles: usuário vê/atualiza só o próprio
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas briques: usuário vê/insere/atualiza/deleta só as próprias
DROP POLICY IF EXISTS "briques_select_own" ON public.briques;
CREATE POLICY "briques_select_own" ON public.briques FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "briques_insert_own" ON public.briques;
CREATE POLICY "briques_insert_own" ON public.briques FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "briques_update_own" ON public.briques;
CREATE POLICY "briques_update_own" ON public.briques FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "briques_delete_own" ON public.briques;
CREATE POLICY "briques_delete_own" ON public.briques FOR DELETE USING (auth.uid() = user_id);

-- Políticas brique_images: via brique (usuário dono da brique)
DROP POLICY IF EXISTS "brique_images_select" ON public.brique_images;
CREATE POLICY "brique_images_select" ON public.brique_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.briques b WHERE b.id = brique_images.brique_id AND b.user_id = auth.uid()));
DROP POLICY IF EXISTS "brique_images_insert" ON public.brique_images;
CREATE POLICY "brique_images_insert" ON public.brique_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.briques b WHERE b.id = brique_images.brique_id AND b.user_id = auth.uid()));
DROP POLICY IF EXISTS "brique_images_delete" ON public.brique_images;
CREATE POLICY "brique_images_delete" ON public.brique_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.briques b WHERE b.id = brique_images.brique_id AND b.user_id = auth.uid()));

-- Trigger para atualizar updated_at em briques
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS briques_updated_at ON public.briques;
CREATE TRIGGER briques_updated_at
  BEFORE UPDATE ON public.briques
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
