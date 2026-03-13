'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Ação de busca de placa para o painel de demonstração pública.
 * Fica separada de /admin para não ser bloqueada pelo middleware de autenticação.
 */
export async function fetchPlacaDemoAction(placa: string) {
    if (!placa) return { error: 'Placa não informada.' }

    const placaLimpa = placa.replace('-', '').toUpperCase()
    const btok = process.env.APIBRASIL_TOKEN

    if (!btok) {
        return { error: 'Token da API de consulta não configurado no servidor.' }
    }

    try {
        const res = await fetch('https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${btok}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tipo: 'fipe-chassi',
                placa: placaLimpa,
                homolog: false
            }),
            cache: 'no-store'
        })

        if (!res.ok) {
            return { error: 'A API de consulta está indisponível. Preencha os dados manualmente.' }
        }

        const result = await res.json()

        if (result.error || !result.data?.resultados?.length) {
            return { error: result.message || 'Placa não encontrada na base nacional.' }
        }

        const d = result.data.resultados[0]
        const modeloUpper = (d.modelo || '').toUpperCase()

        let cambio = ''
        if (modeloUpper.includes(' AUT') || modeloUpper.includes('AUTOMATICO')) cambio = 'Automático'
        else if (modeloUpper.includes(' CVT ')) cambio = 'CVT'
        else if (modeloUpper.includes(' MANUAL ')) cambio = 'Manual'

        return {
            data: {
                marca: (d.marca || '').toUpperCase(),
                modelo: modeloUpper,
                anoFabricacao: d.anoFabricacao || '',
                anoModelo: d.anoModelo || '',
                cor: d.cor || '',
                combustivel: (d.combustivel || '').toUpperCase(),
                cambio,
                chassi: d.chassi || '',
                renavam: '',
                placa: placaLimpa,
                potencia: '',
                cilindradas: (modeloUpper.match(/(\d\.\d)/) || [])[1] || '',
                municipio: '',
                uf: '',
                preco_fipe: d.valor || 0
            }
        }
    } catch (e: any) {
        console.error('[Demo fetchPlaca] Erro:', e.message)
        return { error: 'Erro de conexão. Tente novamente ou preencha manualmente.' }
    }
}


export async function submitDemoVeiculo(formData: FormData) {
    // Usamos o supabase-js puro aqui porque:
    // 1. É uma rota pública, não queremos ler cookies de Auth.
    // 2. Precisamos usar a SERVICE ROLE KEY (se existir) para by-passar o RLS
    // e permitir que o visitante grave no banco do sistema principal.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)


    try {
        // Encontrar a loja "Demo" principal. 
        // 1. Tentamos pelo slug exato ou pelo domínio da landing page
        let { data: currentLoja } = await supabase
            .from('perfis_lojas')
            .select('id, slug, custom_domain')
            .or('slug.eq.focus.earts,custom_domain.eq.silver-starling-801980.hostingersite.com')
            .limit(1)
            .maybeSingle()

        // 2. Se falhar, tentamos qualquer uma que comece com 'focus' (backup)
        if (!currentLoja) {
            const { data: backup } = await supabase
                .from('perfis_lojas')
                .select('id, slug, custom_domain')
                .ilike('slug', '%focus%')
                .limit(1)
                .maybeSingle()
            currentLoja = backup
        }

        // 3. Fallback final: Pega a primeira loja disponível no banco
        if (!currentLoja) {
            const { data: first } = await supabase.from('perfis_lojas').select('id, slug, custom_domain').limit(1).maybeSingle()
            currentLoja = first
        }

        if (!currentLoja) return { error: 'Nenhuma loja base configurada no sistema para direcionar o teste.' }

        const fotos = formData.getAll('fotos') as File[];
        let imagens: string[] = [];

        // Limitar a 5 fotos para o modo teste
        const fotosToUpload = fotos.filter(f => f.size > 0).slice(0, 5);

        if (fotosToUpload.length > 0) {
            const uploadPromises = fotosToUpload.map(async (foto) => {
                const fileExt = foto.name.split('.').pop()
                // Criando uma pasta /demo-uploads no bucket de veiculos
                const fileName = `demo-uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                const fileBuffer = await foto.arrayBuffer()

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('veiculos')
                    .upload(fileName, fileBuffer, {
                        contentType: foto.type,
                        upsert: false
                    })

                if (!uploadError && uploadData) {
                    const { data: publicUrlData } = supabase.storage.from('veiculos').getPublicUrl(uploadData.path)
                    return publicUrlData.publicUrl
                }
                return null
            })

            const uploadedUrls = await Promise.all(uploadPromises)
            imagens = uploadedUrls.filter(url => url !== null) as string[]
        }

        const novoVeiculo = {
            loja_id: currentLoja.id,
            marca: formData.get('marca') as string || 'Não Informado',
            modelo: formData.get('modelo') as string || 'Não Informado',
            ano_fabricacao: Number(formData.get('ano_fabricacao')) || new Date().getFullYear(),
            ano_modelo: Number(formData.get('ano_modelo')) || new Date().getFullYear(),
            preco: Number(formData.get('preco')) || 0,
            preco_fipe: Number(formData.get('preco_fipe')) || 0,
            quilometragem: Number(formData.get('km')) || 0,
            categoria: formData.get('categoria') as string || 'Outros',
            cor: formData.get('cor') as string || 'Prata',
            combustivel: formData.get('combustivel') as string || 'Flex',
            cambio: formData.get('cambio') as string || 'Manual',
            placa: formData.get('placa') as string || 'XXX0000',
            chassi: formData.get('chassi') as string || '',
            renavam: formData.get('renavam') as string || '',
            municipio: formData.get('municipio') as string || '',
            uf: formData.get('uf') as string || '',
            potencia: formData.get('potencia') as string || '',
            cilindradas: formData.get('cilindradas') as string || '',
            status: 'disponivel', // Ativo para aparecer publicamente
            imagens: imagens
        }

        const { data, error } = await supabase
            .from('veiculos')
            .insert(novoVeiculo)
            .select()
            .single()

        if (error) {
            console.log("Erro ao salvar:", error)
            return { error: 'O Banco de Dados barrou o salvamento sem login (RLS). Por favor adicione a SUPABASE_SERVICE_ROLE_KEY no .env.local' }
        }

        // Devolver a URL final da Loja/Veiculo pro front-end apontar o cliente
        const baseUrl = currentLoja.custom_domain 
            ? `https://${currentLoja.custom_domain}` 
            : `/v/${currentLoja.slug}`

        return { success: true, urlDestino: `${baseUrl}/v/${data.id}` }
        
    } catch (err: unknown) {
        let msg = 'Erro desconhecido'
        if(err instanceof Error) msg = err.message
        return { error: msg }
    }
}
