'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Simples hash para gerar identificador único de sessão sem expor IP
async function getClientHash() {
    const cookieStore = await cookies()
    // Tenta pegar um identificador de sessão. Se não tiver, cria um pseudo-hash
    let sessionHash = cookieStore.get('sb-session-id')?.value
    if (!sessionHash) {
        sessionHash = Math.random().toString(36).substring(2, 15)
        // Setando o cookie de forma limpa sem quebrar SSR
        // No Next.js 14+ setting cookies num server action é ok
        try {
            cookieStore.set('sb-session-id', sessionHash, { maxAge: 60 * 60 * 24 * 30 }) // 30 dias
        } catch (e) { /* ignore se chamado fora do fluxo correto */ }
    }
    return sessionHash
}

/**
 * Registra uma visualização de página na loja ou num veículo específico
 */
export async function registrarPageView(lojaId: string, slug: string, tipo: 'vitrine' | 'veiculo' | 'sobre', veiculoId?: string) {
    try {
        const supabase = await createClient()
        const ipHash = await getClientHash()

        await supabase.from('page_views').insert({
            loja_id: lojaId,
            tenant_slug: slug,
            tipo: tipo,
            veiculo_id: veiculoId || null,
            ip_hash: ipHash
        })
    } catch (e) {
        // Falhas em analytics nunca devem quebrar a UX do cliente
        console.error("Falha silenciosa no Analytics:", e)
    }
}

/**
 * Registra a tentativa de um contato antes do redirecionamento
 */
export async function registrarLead(
    lojaId: string,
    tipo: 'whatsapp' | 'formulario_financiamento',
    dados?: {
        veiculo_id?: string,
        nome_cliente?: string,
        telefone_contato?: string[instructional],
        mensagem?: string
    }
) {
    try {
        const supabase = await createClient()

        await supabase.from('leads').insert({
            loja_id: lojaId,
            tipo_origem: tipo,
            veiculo_id: dados?.veiculo_id || null,
            nome_cliente: dados?.nome_cliente || null,
            telefone_contato: dados?.telefone_contato || null,
            mensagem: dados?.mensagem || null,
            status: 'novo'
        })
    } catch (e) {
        console.error("Falha silenciosa ao gravar o Lead Analytics:", e)
    }
}
