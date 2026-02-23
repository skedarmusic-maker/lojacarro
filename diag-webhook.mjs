import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLeads() {
    console.log('--- Verificando Leads ---')
    const { data: leads, error: leadError } = await supabase
        .from('leads_financiamento')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

    if (leadError) {
        console.error('Erro ao buscar leads:', leadError)
    } else {
        console.log('Último Lead:', leads)
    }

    console.log('\n--- Verificando Lojas (Config Webhook) ---')
    const { data: lojas, error: lojaError } = await supabase
        .from('perfis_lojas')
        .select('id, nome, webhook_url_leads')

    if (lojaError) {
        console.error('Erro ao buscar lojas:', lojaError)
    } else {
        console.log('Lojas e Webhooks:', lojas)
    }
}

checkLeads()
