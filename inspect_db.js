const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('veiculos')
        .select('id, marca, modelo, preco, preco_fipe, criado_em')
        .order('criado_em', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching:', error);
        return;
    }

    console.log('--- ULTIMOS 10 VEICULOS ---');
    data.forEach(v => {
        console.log(`[${v.marca} ${v.modelo}] preco = ${v.preco} (typeof ${typeof v.preco}), preco_fipe = ${v.preco_fipe}`);
    });
}

check();
