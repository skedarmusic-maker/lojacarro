-- Migração para adicionar tabela de leads de financiamento e campo de webhook na loja

-- 1. Cria a tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads_financiamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loja_id UUID NOT NULL REFERENCES public.perfis_lojas(id) ON DELETE CASCADE,
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE SET NULL, -- Se o veiculo for deletado, mantem o lead
    cliente_nome TEXT NOT NULL,
    cliente_whatsapp TEXT NOT NULL,
    cliente_email TEXT,
    cliente_cpf TEXT NOT NULL,
    cliente_data_nascimento DATE,
    renda_mensal NUMERIC(10, 2),
    valor_entrada NUMERIC(10, 2),
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'em_atendimento', 'aprovado', 'reprovado', 'perdido')),
    dados_extras JSONB DEFAULT '{}'::jsonb, -- Para salvar IP, origem, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativa RLS
ALTER TABLE public.leads_financiamento ENABLE ROW LEVEL SECURITY;

-- Politica: Usuarios (Lojistas) podem ver e modificar apenas OS SEUS PRÓPRIOS LEADS
CREATE POLICY "Lojistas podem acessar seus próprios leads"
    ON public.leads_financiamento
    FOR ALL
    USING (
        loja_id IN (SELECT id FROM public.perfis_lojas WHERE user_id = auth.uid())
    )
    WITH CHECK (
        loja_id IN (SELECT id FROM public.perfis_lojas WHERE user_id = auth.uid())
    );

-- Politica Especial: A ROLE 'anon' (Visitante/Storefront API) tem permissao para INSERIR leads vinculados a uma loja publica
CREATE POLICY "Visitantes anonimos podem inserir leads"
    ON public.leads_financiamento
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true); -- Permitimos o insert inicial (uma vez q o endpoint da api fará isso de forma segura)


-- Função para atualizar o updated_at automaticamente (caso não exista)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER set_leads_financiamento_updated_at
    BEFORE UPDATE ON public.leads_financiamento
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 2. Adiciona coluna para Webhooks na perfis_lojas (Usando ALTER TABLE seguro)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='perfis_lojas' AND column_name='webhook_url_leads') THEN
        ALTER TABLE public.perfis_lojas ADD COLUMN webhook_url_leads TEXT;
    END IF;
END $$;
