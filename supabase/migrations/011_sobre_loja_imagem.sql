-- Migração para adicionar coluna de imagem_sobre (para fachada/logo na pagina Sobre)

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='perfis_lojas' AND column_name='imagem_sobre') THEN
        ALTER TABLE public.perfis_lojas ADD COLUMN imagem_sobre TEXT;
    END IF;
END $$;
