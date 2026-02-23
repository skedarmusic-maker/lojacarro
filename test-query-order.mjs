import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    // 1. Order THEN Eq
    let query1 = supabase.from('veiculos').select('*').order('created_at', { ascending: false })
    query1 = query1.eq('categoria', 'SUVs')

    // 2. Eq THEN Order
    let query2 = supabase.from('veiculos').select('*').eq('categoria', 'SUVs').order('created_at', { ascending: false })

    const { data: d1, error: e1 } = await query1
    console.log("Q1 Error:", e1?.message, "Q1 Data length:", d1?.length)

    const { data: d2, error: e2 } = await query2
    console.log("Q2 Error:", e2?.message, "Q2 Data length:", d2?.length)
}

run()
