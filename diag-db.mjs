import { createClient } from '@supabase/supabase-js'

// Using node --env-file=.env.local to load these
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Make sure to run with --env-file=.env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkColumns() {
    try {
        console.log("Checking veiculos table...")
        const { data, error } = await supabase.from('veiculos').select('id, categoria').limit(1)

        if (error) {
            console.error("Database Error:", error.message)
            if (error.message.includes('column "categoria" does not exist')) {
                console.log("CRITICAL: The 'categoria' column is missing from the 'veiculos' table.")
            }
        } else {
            console.log("Success! Column 'categoria' exists.")
            console.log("Sample Data Row:", data)
        }
    } catch (e) {
        console.error("Unexpected Error:", e)
    }
}

checkColumns()
