-- Migração: Criação do Schema SaaS Inicial (Lojas e Veículos)

-- 1. Criação da tabela de Perfis/Lojas (Tenants)
CREATE TABLE IF NOT EXISTS public.perfis_lojas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Vincula ao lojista que logou
  slug TEXT UNIQUE NOT NULL, -- Ex: 'marinhos', para marinhos.plataforma.com
  custom_domain TEXT UNIQUE, -- Ex: 'www.marinhosveiculos.com.br'
  nome TEXT NOT NULL,
  config_visual JSONB DEFAULT '{"cor_primaria": "#3b82f6", "logo_url": null}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criação da tabela de Veículos
CREATE TABLE IF NOT EXISTS public.veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loja_id UUID REFERENCES public.perfis_lojas(id) ON DELETE CASCADE NOT NULL,
  
  -- Informacoes Basicas
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano_fabricacao INTEGER NOT NULL,
  ano_modelo INTEGER NOT NULL,
  quilometragem INTEGER DEFAULT 0,
  preco DECIMAL(10,2) NOT NULL,
  cor TEXT,
  
  -- Mídia e Detalhamento
  imagens JSONB DEFAULT '[]', -- Lista de URLs das fotos cropadas
  descricao TEXT,
  opcionais JSONB DEFAULT '[]',
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'vendido', 'oculto')),
  
  -- Controle interno
  posted_on_instagram BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitação de RLS (Row Level Security) nas tabelas
ALTER TABLE public.perfis_lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURANÇA (RLS)
-- Nota: A leitura (SELECT) na plataforma pública usa ServiceRole (bypass) ou Anon com filtros baseados no Tenant
-- Já as modificações (INSERT/UPDATE/DELETE) são unicamente feitas pelos donos da loja

-- 4.1 Lojista pode ver e editar APENAS o SEU perfil de loja
CREATE POLICY "Lojista gerencia sua propria loja" 
ON public.perfis_lojas
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());

-- 4.2 Lojista pode consultar e editar APENAS os veículos cadastrados na loja dele
CREATE POLICY "Lojista gerencia seus proprios veiculos" 
ON public.veiculos
FOR ALL 
TO authenticated 
USING (
  loja_id IN (
    SELECT id FROM public.perfis_lojas WHERE user_id = auth.uid()
  )
);

-- 4.3 View Pública (A Vitrine pode ler Lojas e Veículos de forma aberta dependendo da regra do middleware)
CREATE POLICY "Visitantes podem ver dados das lojas" 
ON public.perfis_lojas FOR SELECT TO anon USING (true);

CREATE POLICY "Visitantes podem ver carros disponiveis" 
ON public.veiculos FOR SELECT TO anon USING (status = 'disponivel');
