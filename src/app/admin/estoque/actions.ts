'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MOCK_DB: Record<string, any> = {
    "LSU3J43": {
        "codigoRetorno": "0",
        "mensagemRetorno": "Sem erros.",
        "codigoSituacao": "0",
        "situacao": "Sem restrição",
        "modelo": "JEEP/COMPASS TRAILHAWK D",
        "marca": "JEEP",
        "cor": "Cinza",
        "ano": "2016",
        "anoModelo": "2017",
        "placa": "LSU3J43",
        "uf": "SC",
        "municipio": "BRACO DO NORTE",
        "chassi": "*****02479",
        "preco_fipe": 120000
    },
    "AAA1111": {
        "codigoRetorno": "0",
        "mensagemRetorno": "Sem erros",
        "codigoSituacao": "0",
        "situacao": "Roubo/Furto",
        "modelo": "SANTANA EXECUTIVO",
        "marca": "VW",
        "cor": "Preta",
        "ano": "1990",
        "anoModelo": "1990",
        "placa": "AAA1111",
        "uf": "PR",
        "municipio": "CURITIBA",
        "chassi": "*****01191",
        "preco_fipe": 25000
    },
    "ABC1234": {
        "codigoRetorno": "0",
        "mensagemRetorno": "Sem erros",
        "codigoSituacao": "1",
        "situacao": "Roubo/Furto",
        "modelo": "SANTANA CG",
        "marca": "VW",
        "cor": "Vermelha",
        "ano": "1986",
        "anoModelo": "1986",
        "placa": "ABC1234",
        "uf": "PR",
        "municipio": "LOBATO",
        "chassi": "*****46344",
        "preco_fipe": 15000
    },
    "MUT6002": {
        "codigoRetorno": "0",
        "mensagemRetorno": "Sem erros.",
        "codigoSituacao": "0",
        "situacao": "Sem restrição",
        "modelo": "FIESTA GL",
        "marca": "FORD",
        "cor": "Branca",
        "ano": "2000",
        "anoModelo": "2000",
        "placa": "MUT6002",
        "uf": "AL",
        "municipio": "MACEIO",
        "chassi": "*****02625",
        "preco_fipe": 18500
    },
    "MVO4619": {
        "codigoRetorno": "0",
        "mensagemRetorno": "Sem erros.",
        "codigoSituacao": "0",
        "situacao": "Sem restrição",
        "modelo": "TOPIC DLX",
        "marca": "ASIA",
        "cor": "Branca",
        "ano": "1998",
        "anoModelo": "1998",
        "placa": "MVO4619",
        "uf": "MG",
        "municipio": "BRASILIA DE MINAS",
        "chassi": "*****80738",
        "preco_fipe": 22000
    },
    "NEV5230": {
        "codigoRetorno": "0",
        "mensagemRetorno": "Sem erros.",
        "codigoSituacao": "0",
        "situacao": "Sem restrição",
        "modelo": "GOL 1.0",
        "marca": "VW",
        "cor": "Preta",
        "ano": "2004",
        "anoModelo": "2005",
        "placa": "NEV5230",
        "uf": "AP",
        "municipio": "MACAPA",
        "chassi": "*****61087",
        "preco_fipe": 21000
    }
}

export async function fetchPlacaFipe(placa: string) {
    if (!placa) return { error: 'Placa não recebida' }
    
    const placaLimpa = placa.replace('-', '').toUpperCase();
    const btok = process.env.APIBRASIL_TOKEN;

    if (!btok) {
        console.error('[ERROR] APIBRASIL_TOKEN não configurado no servidor Hostinger.');
        return { error: 'O sistema de consulta automática não está configurado corretamente no servidor.' }
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
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[ERROR] Falha na APIBrasil:', res.status, errorText);
            return { error: 'A API de placas está temporariamente indisponível. Por favor, preencha manualmente.' }
        }

        const result = await res.json();

        if (result.error || !result.data?.resultados?.length) {
            // Fallback se a API retornar erro de crédito ou placa não encontrada
            return { error: result.message || 'Placa não encontrada na base nacional.' }
        }

        const d = result.data.resultados[0];
        const modeloUpper = (d.modelo || '').toUpperCase();
        
        let cambio = '';
        if (modeloUpper.includes(' AUT') || modeloUpper.includes('AUTOMATICO')) cambio = 'Automático';
        else if (modeloUpper.includes(' CVT ')) cambio = 'CVT';
        else if (modeloUpper.includes(' MANUAL ')) cambio = 'Manual';

        return {
            data: {
                marca: (d.marca || '').toUpperCase(),
                modelo: modeloUpper,
                anoFabricacao: d.anoFabricacao || '',
                anoModelo: d.anoModelo || '',
                cor: d.cor || '',
                combustivel: (d.combustivel || '').toUpperCase(),
                cambio: cambio,
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
        console.error('[CRITICAL ERROR] Erro ao buscar placa:', e.message);
        return { error: 'Erro de conexão ao buscar dados da placa. Tente novamente ou preencha manual.' }
    }
}

export async function submitNovoVeiculo(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Não autenticado' }

    const { data: currentLoja } = await supabase.from('perfis_lojas').select('id').eq('user_id', user.id).single()

    const fotos = formData.getAll('fotos') as File[];
    let imagens: string[] = [];

    // Limitar a 8 fotos no backend
    const fotosToUpload = fotos.filter(f => f.size > 0).slice(0, 8);

    if (fotosToUpload.length > 0) {
        // Upload em paralelo para maior performance
        const uploadPromises = fotosToUpload.map(async (foto) => {
            const fileExt = foto.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

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
        // Filtra os nulos caso algum upload tenha falhado
        imagens = uploadedUrls.filter(url => url !== null) as string[]
    }

    const novoVeiculo = {
        loja_id: currentLoja?.id,
        marca: formData.get('marca') as string,
        modelo: formData.get('modelo') as string,
        ano_fabricacao: Number(formData.get('ano_fabricacao')),
        ano_modelo: Number(formData.get('ano_modelo')),
        preco: Number(formData.get('preco')),
        preco_fipe: Number(formData.get('preco_fipe')) || 0,
        quilometragem: Number(formData.get('km')) || 0,
        categoria: formData.get('categoria') as string || 'Outros',
        cor: formData.get('cor') as string,
        combustivel: formData.get('combustivel') as string,
        cambio: formData.get('cambio') as string,
        placa: formData.get('placa') as string,
        chassi: formData.get('chassi') as string,
        renavam: formData.get('renavam') as string,
        municipio: formData.get('municipio') as string,
        uf: formData.get('uf') as string,
        potencia: formData.get('potencia') as string,
        cilindradas: formData.get('cilindradas') as string,
        status: 'disponivel',
        imagens: imagens
    }


    const { error } = await supabase.from('veiculos').insert(novoVeiculo)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/estoque')
    revalidatePath('/admin/dashboard')
    return { success: true }
}

export async function deleteVeiculo(formData: FormData) {
    const supabase = await createClient()

    // Opcional: A segurança (RLS) no banco garante
    // que só deleta se for o dono.
    const id = formData.get('id') as string
    if (!id) return { error: 'Sem ID' }

    await supabase.from('veiculos').delete().eq('id', id)
    revalidatePath('/admin/estoque')
    revalidatePath('/admin/dashboard')
    return { success: true }
}
