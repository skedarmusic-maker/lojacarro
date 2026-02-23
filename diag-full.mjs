import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    console.log('=== DIAGNÓSTICO COMPLETO DOS FILTROS ===\n')

    // 1. Listar todas as lojas
    const { data: lojas, error: e1 } = await supabase.from('perfis_lojas').select('id, slug, nome').limit(5)
    console.log('[1] Lojas:', lojas, 'Erro:', e1?.message)

    if (!lojas || lojas.length === 0) {
        console.error('Nenhuma loja encontrada!')
        return
    }

    const loja = lojas[0]
    console.log(`\n[1] Usando loja: "${loja.nome}" (slug: ${loja.slug}, id: ${loja.id})\n`)

    // 2. Listar TODOS os veículos desta loja
    const { data: veiculos, error: e2 } = await supabase
        .from('veiculos')
        .select('id, marca, modelo, categoria, status')
        .eq('loja_id', loja.id)

    console.log('[2] Todos os veículos (sem filtro):')
    veiculos?.forEach(v => console.log(`  - ${v.marca} ${v.modelo} | status: ${v.status} | categoria: "${v.categoria}"`))
    console.log('Erro:', e2?.message, '\n')

    // 3. Filtrar somente disponíveis
    const { data: disponiveis, error: e3 } = await supabase
        .from('veiculos')
        .select('id, marca, modelo, categoria, status')
        .eq('loja_id', loja.id)
        .eq('status', 'disponivel')

    console.log('[3] Somente Disponíveis:')
    disponiveis?.forEach(v => console.log(`  - ${v.marca} ${v.modelo} | categoria: "${v.categoria}"`))
    console.log('Erro:', e3?.message, '\n')

    // 4. Verificar valores únicos de categoria
    const categorias = [...new Set(disponiveis?.map(v => v.categoria))]
    console.log('[4] Categorias únicas encontradas:', categorias, '\n')

    // 5. Filtro por uma categoria específica
    if (categorias.length > 0) {
        const testarCat = categorias[0]
        const { data: filtrados, error: e4 } = await supabase
            .from('veiculos')
            .select('id, marca, modelo, categoria')
            .eq('loja_id', loja.id)
            .eq('status', 'disponivel')
            .eq('categoria', testarCat)

        console.log(`[5] Filtro por categoria "${testarCat}":`)
        filtrados?.forEach(v => console.log(`  - ${v.marca} ${v.modelo}`))
        console.log('Erro:', e4?.message, '\n')
    }

    // 6. Verificar se há carros com categoria NULL
    const nullCat = disponiveis?.filter(v => !v.categoria || v.categoria === null)
    console.log('[6] Carros com categoria NULL/vazia:', nullCat?.length)
}

run()
