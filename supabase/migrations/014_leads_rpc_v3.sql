-- Migração para Funções Auxiliares (RPC) v3 - Incluindo Nome do Veículo para o Webhook
-- Resolve o problema do vendedor não saber qual carro o cliente quer na planilha

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
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lead_id UUID;
    v_loja_nome TEXT;
    v_webhook_url TEXT;
    v_veiculo_nome TEXT;
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

    -- 2. Busca os dados da loja e do veículo para o Webhook
    SELECT nome, webhook_url_leads 
    INTO v_loja_nome, v_webhook_url
    FROM public.perfis_lojas
    WHERE id = p_loja_id;

    IF p_veiculo_id IS NOT NULL THEN
        SELECT marca || ' ' || modelo 
        INTO v_veiculo_nome
        FROM public.veiculos
        WHERE id = p_veiculo_id;
    ELSE
        v_veiculo_nome := 'Interesse Geral / Não especificado';
    END IF;

    -- 3. Retorna o pacote completo com o nome do carro
    RETURN jsonb_build_object(
        'lead_id', v_lead_id,
        'loja_nome', v_loja_nome,
        'webhook_url', v_webhook_url,
        'veiculo_nome', v_veiculo_nome
    );
END;
$$;


-- 2. Função para atualizar e também retornar nome do carro
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
    v_veiculo_nome TEXT;
    v_veiculo_id UUID;
BEGIN
    UPDATE public.leads_financiamento
        SET 
            cliente_data_nascimento = p_data_nascimento,
            renda_mensal = p_renda_mensal,
            valor_entrada = p_valor_entrada
        WHERE id = p_lead_id
    RETURNING veiculo_id INTO v_veiculo_id;

    SELECT nome, webhook_url_leads 
    INTO v_loja_nome, v_webhook_url
    FROM public.perfis_lojas
    WHERE id = p_loja_id;

    IF v_veiculo_id IS NOT NULL THEN
        SELECT marca || ' ' || modelo 
        INTO v_veiculo_nome
        FROM public.veiculos
        WHERE id = v_veiculo_id;
    ELSE
        v_veiculo_nome := 'Interesse Geral';
    END IF;

    RETURN jsonb_build_object(
        'success', FOUND,
        'loja_nome', v_loja_nome,
        'webhook_url', v_webhook_url,
        'veiculo_nome', v_veiculo_nome
    );
END;
$$;
