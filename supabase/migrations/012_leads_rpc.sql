-- Migração para Funções Auxiliares (RPC) que permitem criação de Leads por Visitantes sem comprometer o RLS

-- 1. Função para inserir um Lead inicial (Post)
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
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Permite burlar a política de RLS com segurança, pois roda como criador (Admin)
AS $$
DECLARE
    v_lead_id UUID;
BEGIN
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

    RETURN v_lead_id;
END;
$$;


-- 2. Função para atualizar informações de crédito do Lead (Put) 
CREATE OR REPLACE FUNCTION public.atualizar_lead_publico(
    p_lead_id UUID,
    p_data_nascimento DATE,
    p_renda_mensal NUMERIC,
    p_valor_entrada NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.leads_financiamento
        SET 
            cliente_data_nascimento = p_data_nascimento,
            renda_mensal = p_renda_mensal,
            valor_entrada = p_valor_entrada
        WHERE id = p_lead_id;

    -- Opcional: só para retornar true se afetou a linha
    IF FOUND THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;
