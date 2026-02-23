-- Migração para adicionar coluna `sobre_loja` na tabela de perfis de lojas

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='perfis_lojas' AND column_name='sobre_loja') THEN
        ALTER TABLE public.perfis_lojas ADD COLUMN sobre_loja TEXT;
    END IF;
END $$;
