import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnostic() {
    console.log("--- SaaS Diagnostic ---")

    // Check all lojas
    const { data: lojas, error: errLojas } = await supabase.from('perfis_lojas').select('*')
    if (errLojas) {
        console.error("Error fetching lojas:", errLojas.message)
    } else {
        console.log(`Found ${lojas.length} lojas:`)
        lojas.forEach(l => {
            console.log(`- ID: ${l.id} | Slug: ${l.slug} | Ativo: ${l.ativo} | SuperAdmin: ${l.is_super_admin} | UserID: ${l.user_id}`)
        })
    }

    // Check total vehicles
    const { count, error: errVeh } = await supabase.from('veiculos').select('*', { count: 'exact', head: true })
    if (errVeh) {
        console.error("Error counting vehicles:", errVeh.message)
    } else {
        console.log(`Total vehicles in DB: ${count}`)
    }
}

diagnostic()
