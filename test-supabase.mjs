import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hgvhfzvabbnngjkmvqpo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndmhmenZhYmJubmdqa212cXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODEwNzcsImV4cCI6MjA4NzI1NzA3N30.ukg7IFlY1_Tk2CWnw82VW_L3S0CU_eMVT-Vz4tWQimo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
    const { data: { user } } = await supabase.auth.getUser()
    console.log("User:", user)

    const { data, error } = await supabase.from('perfis_lojas').select('*').limit(1)

    if (error) {
        console.error("Supabase Error:", error)
    } else {
        console.log("Table exists! Data:", data)
    }
}

testSupabase()
