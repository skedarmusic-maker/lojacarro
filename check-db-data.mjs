import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkData() {
    const { data: veiculos, error: vError } = await supabase.from('veiculos').select('*')
    const { data: lojas, error: lError } = await supabase.from('perfis_lojas').select('*')

    console.log("Veiculos in DB:", veiculos?.length)
    console.log("Lojas in DB:", lojas?.length)

    if (veiculos && veiculos.length > 0) {
        console.log("First vehicle loja_id:", veiculos[0].loja_id)
    }
}

checkData()
