import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { loja_id, veiculo_id, nome, whatsapp, email, cpf, data_nascimento, renda_mensal, valor_entrada } = body

        if (!loja_id || !nome || !whatsapp || !cpf) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Salvar no Banco de Dados (Bypassing RLS with Security Definer DB Function)
        const { data: rpcResponse, error: dbError } = await supabase.rpc('inserir_lead_publico', {
            p_loja_id: loja_id,
            p_veiculo_id: veiculo_id || null,
            p_nome: nome,
            p_whatsapp: whatsapp,
            p_email: email || null,
            p_cpf: cpf,
            p_data_nascimento: data_nascimento || null,
            p_renda_mensal: renda_mensal ? cleanNumberString(renda_mensal) : null,
            p_valor_entrada: valor_entrada ? cleanNumberString(valor_entrada) : null
        })

        if (dbError || !rpcResponse) {
            console.error('Erro ao salvar lead no DB via RPC:', dbError)
            return NextResponse.json({ error: 'Erro interno ao salvar simulação' }, { status: 500 })
        }

        console.log('--- DB RPC RESPONSE POST ---', rpcResponse)

        const { lead_id, loja_nome, webhook_url, veiculo_nome } = rpcResponse

        // 3. (Opcional) Disparar o Webhook para integração do lojista (ex: Google Sheets App Script)
        let webhookSuccess = null
        if (webhook_url) {
            try {
                // Montar payload estruturado e enviá-lo de forma assíncrona para não prender a resposta ao cliente
                fetch(webhook_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        origem: 'Vitrine Auto SaaS',
                        data: new Date().toISOString(),
                        loja_nome: loja_nome,
                        veiculo_nome: veiculo_nome,
                        veiculo_id: veiculo_id,
                        lead_id: lead_id,
                        nome,
                        whatsapp,
                        email,
                        cpf,
                        data_nascimento,
                        renda_mensal,
                        valor_entrada,
                        possui_cnh: null
                    })
                }).catch(err => console.error("Erro disparando Webhook em background:", err))
                webhookSuccess = true
            } catch (webhookErr) {
                console.error('Falha ao acionar webhook:', webhookErr)
                webhookSuccess = false
            }
        }

        return NextResponse.json({
            success: true,
            leadId: lead_id,
            webhookTriggered: webhookSuccess
        }, { status: 201 })

    } catch (error: any) {
        console.error('Erro fatal endpoint leads:', error)
        return NextResponse.json({ error: 'Erro inesperado no servidor' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { lead_id, loja_id, veiculo_id, nome, whatsapp, email, cpf, data_nascimento, renda_mensal, valor_entrada, possui_cnh } = body

        if (!lead_id || !loja_id) {
            return NextResponse.json({ error: 'ID do lead e da loja são obrigatórios' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Atualizar no Banco de Dados (Bypassing RLS)
        const { data: rpcResponse, error: dbError } = await supabase.rpc('atualizar_lead_publico', {
            p_lead_id: lead_id,
            p_loja_id: loja_id,
            p_data_nascimento: data_nascimento || null,
            p_renda_mensal: renda_mensal ? cleanNumberString(renda_mensal) : null,
            p_valor_entrada: valor_entrada ? cleanNumberString(valor_entrada) : null,
            p_possui_cnh: possui_cnh === undefined ? null : possui_cnh
        })

        if (dbError || !rpcResponse) {
            console.error('Erro ao atualizar lead no DB via RPC:', dbError)
            return NextResponse.json({ error: 'Erro interno ao atualizar simulação' }, { status: 500 })
        }

        const { success: isSuccess, loja_nome, webhook_url, veiculo_nome } = rpcResponse

        // 3. Disparar o Webhook novamente (O opcional)
        let webhookSuccess = null
        if (webhook_url) {
            try {
                fetch(webhook_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        origem: 'Vitrine Auto SaaS (Etapa 2 - Crédito)',
                        data: new Date().toISOString(),
                        loja_nome: loja_nome,
                        veiculo_nome: veiculo_nome,
                        veiculo_id: veiculo_id,
                        lead_id: lead_id,
                        nome,
                        whatsapp,
                        email,
                        cpf,
                        data_nascimento,
                        renda_mensal,
                        valor_entrada,
                        possui_cnh: possui_cnh
                    })
                }).catch(err => console.error("Erro disparando Webhook em background:", err))
                webhookSuccess = true
            } catch (webhookErr) {
                console.error('Falha ao acionar webhook:', webhookErr)
                webhookSuccess = false
            }
        }

        return NextResponse.json({
            success: true,
            leadId: lead_id,
            webhookTriggered: webhookSuccess
        }, { status: 200 })

    } catch (error: any) {
        console.error('Erro fatal endpoint leads PUT:', error)
        return NextResponse.json({ error: 'Erro inesperado no servidor' }, { status: 500 })
    }
}

// Utility to clean money formatted strings (e.g. "R$ 1.500,00" -> 1500.00)
function cleanNumberString(val: string): number {
    if (!val) return 0
    let cleaned = val.replace(/[^\d,]/g, '')
    cleaned = cleaned.replace(',', '.')
    return Number(cleaned) || 0
}
