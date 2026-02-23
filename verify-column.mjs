import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyColumn() {
    console.log("Verifying if 'preco_promocional' exists in 'veiculos' table...")
    const { data, error } = await supabase.from('veiculos').select('preco_promocional').limit(1)

    if (error) {
        console.error("Error detected:", error.message)
        if (error.message.includes('column "preco_promocional" does not exist')) {
            console.log("RESULT: The column DOES NOT exist. Migration needed.")
        }
    } else {
        console.log("RESULT: The column exists. Data:", data)
    }
}

verifyColumn()
