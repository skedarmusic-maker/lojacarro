-- Migração para Funções Auxiliares (RPC) v2 - Agora retornando dados para Webhook
-- Esta versão resolve o problema do RLS impedindo a leitura do Webhook URL por anônimos

CREATE OR REPLACE FUNCTION public.inserir_lead_publico(
    p_loja_id UUID,
    p_veiculo_id UUID,
    p_nome TEXT,
    p_whatsapp TEXT,
    p_email TEXT,
    p_cpf TEXT,
    p_data_nascimento DATE,
    p_renda_mensal NUMERIC,
    p_valor_entrada NUMERIC
)
RETURNS JSONB -- Retornamos um objeto JSON com lead_id e infos da loja
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lead_id UUID;
    v_loja_nome TEXT;
    v_webhook_url TEXT;
BEGIN
    -- 1. Insere o Lead
    INSERT INTO public.leads_financiamento (
        loja_id,
        veiculo_id,
        cliente_nome,
        cliente_whatsapp,
        cliente_email,
        cliente_cpf,
        cliente_data_nascimento,
        renda_mensal,
        valor_entrada,
        status
    ) VALUES (
        p_loja_id,
        p_veiculo_id,
        p_nome,
        p_whatsapp,
        p_email,
        p_cpf,
        p_data_nascimento,
        p_renda_mensal,
        p_valor_entrada,
        'novo'
    ) RETURNING id INTO v_lead_id;

    -- 2. Busca os dados da loja (dentro do SECURITY DEFINER ignora o RLS restritivo)
    SELECT nome, webhook_url_leads 
    INTO v_loja_nome, v_webhook_url
    FROM public.perfis_lojas
    WHERE id = p_loja_id;

    -- 3. Retorna o pacote completo
    RETURN jsonb_build_object(
        'lead_id', v_lead_id,
        'loja_nome', v_loja_nome,
        'webhook_url', v_webhook_url
    );
END;
$$;

-- 2. Função para atualizar informações de crédito e retornar dados (Put)
CREATE OR REPLACE FUNCTION public.atualizar_lead_publico(
    p_lead_id UUID,
    p_loja_id UUID,
    p_data_nascimento DATE,
    p_renda_mensal NUMERIC,
    p_valor_entrada NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_loja_nome TEXT;
    v_webhook_url TEXT;
BEGIN
    UPDATE public.leads_financiamento
        SET 
            cliente_data_nascimento = p_data_nascimento,
            renda_mensal = p_renda_mensal,
            valor_entrada = p_valor_entrada
        WHERE id = p_lead_id;

    SELECT nome, webhook_url_leads 
    INTO v_loja_nome, v_webhook_url
    FROM public.perfis_lojas
    WHERE id = p_loja_id;

    RETURN jsonb_build_object(
        'success', FOUND,
        'loja_nome', v_loja_nome,
        'webhook_url', v_webhook_url
    );
END;
$$;

