import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hgvhfzvabbnngjkmvqpo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndmhmenZhYmJubmdqa212cXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODEwNzcsImV4cCI6MjA4NzI1NzA3N30.ukg7IFlY1_Tk2CWnw82VW_L3S0CU_eMVT-Vz4tWQimo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
    const data = {
        email: `teste${Date.now()}@loja.com`,
        password: 'password123',
    }
    console.log("Signing up...", data.email)
    const { error, data: authData } = await supabase.auth.signUp(data)

    if (error) {
        console.error("Signup Auth Error:", error)
        return
    }

    console.log("Auth Data:", authData.user?.id)

    if (authData?.user?.id) {
        const defaultSlug = data.email.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000)

        console.log("Inserting loja com slug:", defaultSlug)
        const { error: insertError, data: insertData } = await supabase.from('perfis_lojas').insert({
            user_id: authData.user.id,
            nome: 'Minha Nova Loja',
            slug: defaultSlug
        });

        if (insertError) {
            console.error("Insert Perfil Loja Error:", insertError)
        } else {
            console.log("Inserted Perfil Loja successfully!", insertData)
        }
    }
}

testSignup()
