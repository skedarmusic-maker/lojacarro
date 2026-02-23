import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    let query = supabase.from('veiculos').select('*').eq('status', 'disponivel')
    query = query.eq('categoria', 'SUVs')

    // Test with text
    let query2 = supabase.from('veiculos').select('*').eq('status', 'disponivel').or('marca.ilike.%JEEP%,modelo.ilike.%JEEP%,cor.ilike.%JEEP%')

    const { data, error } = await query
    console.log("Q1 Error:", error?.message, "Q1 Data length:", data?.length)

    const { data: d2, error: e2 } = await query2
    console.log("Q2 Error:", e2?.message, "Q2 Data length:", d2?.length)
}

run()
