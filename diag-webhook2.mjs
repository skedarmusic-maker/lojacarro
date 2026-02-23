import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRpc() {
    console.log('--- Testando RPC para ver retorno ---')

    const loja_id = 'c1fe37b5-0c9f-442b-b6fb-b09e0a0d0a51' // I will fetch a loja_id first

    const { data: lojas } = await supabase.from('perfis_lojas').select('id').limit(1)
    if (!lojas || lojas.length === 0) {
        console.log('Nenhuma loja encontrada')
        return
    }

    const test_loja_id = lojas[0].id

    const { data: rpcResponse, error: dbError } = await supabase.rpc('inserir_lead_publico', {
        p_loja_id: test_loja_id,
        p_veiculo_id: null,
        p_nome: 'Teste Webhook 2',
        p_whatsapp: '11999999999',
        p_email: 'teste@teste.com',
        p_cpf: '000.000.000-00',
        p_data_nascimento: null,
        p_renda_mensal: null,
        p_valor_entrada: null
    })

    console.log('RPC Error:', dbError)
    console.log('RPC Response:', rpcResponse)
}

testRpc()
