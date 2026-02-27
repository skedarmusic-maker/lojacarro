'use server'

import { createClient } from '@/lib/supabase/server'

export async function publishToInstagramService(veiculoId: string, customImages?: string[], customTag?: string) {
    try {
        const supabase = await createClient()

        // 1. Validar Usuário Logado
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Usuário não autenticado.' }

        // 2. Buscar Dados da Loja e Tokens
        const { data: loja } = await supabase
            .from('perfis_lojas')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!loja) return { error: 'Loja não encontrada.' }
        if (!loja.instagram_access_token || !loja.instagram_account_id) {
            return { error: 'Integração com Instagram não configurada.' }
        }

        // 3. Buscar Dados do Veículo
        const { data: veiculo, error: veiculoError } = await supabase
            .from('veiculos')
            .select('*')
            .eq('id', veiculoId)
            .eq('loja_id', loja.id)
            .single()

        if (veiculoError || !veiculo) return { error: 'Veículo não encontrado.' }
        if (!veiculo.imagens || veiculo.imagens.length === 0) return { error: 'O veículo precisa ter foto.' }

        const imageUrl = veiculo.imagens[0]

        // 4. Formatar a Legenda
        const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        const precoFormatado = veiculo.preco_promocional
            ? `🔥 Por apenas: ${formatadorMoeda.format(veiculo.preco_promocional)}🔥`
            : `💰 Valor: ${formatadorMoeda.format(veiculo.preco)}💰`

        const kmStr = veiculo.quilometragem ? veiculo.quilometragem.toLocaleString('pt-BR') : '0'

        // Extrair dados de contato da loja
        const dadosContato = loja.dados_contato || {}
        const whatsapp = dadosContato.whatsapp || ''
        const cidade = dadosContato.cidade || ''
        const estado = dadosContato.estado || ''

        // Formatar WhatsApp (de 11999999999 para (11) 99999-9999)
        let whatsappFormatado = whatsapp
        if (whatsapp.length === 11) {
            whatsappFormatado = `(${whatsapp.substring(0, 2)}) ${whatsapp.substring(2, 7)}-${whatsapp.substring(7, 11)}`
        } else if (whatsapp.length === 10) {
            whatsappFormatado = `(${whatsapp.substring(0, 2)}) ${whatsapp.substring(2, 6)}-${whatsapp.substring(6, 10)}`
        }

        const tagEstado = estado ? `#${estado.toLowerCase()}` : '';

        const caption = `${customTag || '‼️🇧🇷OPORTUNIDADE🇧🇷‼️'}

◾ MARCA / ${veiculo.marca}
◾ MODELO / ${veiculo.modelo}
◾ ANO / ${veiculo.ano_fabricacao}/${veiculo.ano_modelo}
◾ Km's / ${kmStr}

${precoFormatado}

🚨EXTREMAMENTE CONSERVADO🚨

Laudo cautelar aprovado✅

Quer saber mais??

Entre em contato com nosso time de vendas pelo whatsapp (link na bio) ou pelo direct no instagram.

➖➖➖➖➖➖➖➖➖➖
Contatos whatsapp 👇🏼

📞 ${whatsappFormatado} - (falar com time ${loja.nome})

Cidade: 📍 ${cidade}, ${estado} 📍

➖➖➖➖➖➖➖➖➖➖

#seminovosdequalidade #usadospremium ${tagEstado} #${veiculo.modelo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()} #${veiculo.marca.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`.trim()

        // 5. Preparar todas as imagens (máximo 10 para o Instagram)
        const imagensParaPostar = (customImages && customImages.length > 0 ? customImages : veiculo.imagens).slice(0, 10)

        if (imagensParaPostar.length === 0) return { error: 'Nenhuma foto selecionada.' }

        if (imagensParaPostar.length === 1) {
            console.log('\n\n' + '🚀'.repeat(20))
            console.log('--- INICIANDO POSTAGEM DE FOTO ÚNICA ---')

            const singleImageRes = await fetch(`https://graph.facebook.com/v19.0/${loja.instagram_account_id}/media`, {
                method: 'POST',
                body: new URLSearchParams({
                    image_url: imagensParaPostar[0],
                    caption: caption,
                    access_token: loja.instagram_access_token
                })
            })
            const singleData = await singleImageRes.json()

            if (singleData.error) {
                console.error('❌ Erro detalhado na foto única:', {
                    url: imagensParaPostar[0],
                    error: singleData.error
                })
                if (singleData.error?.code === 190) {
                    return { error: '🔑 Token do Instagram expirado! Vá em Configurações → Instagram e gere um novo Token de Acesso.' }
                }
                return { error: `Erro na imagem: ${singleData.error.message}` }
            }

            console.log(`✅ Foto pronta (ID: ${singleData.id}), publicando...`)
            await new Promise(r => setTimeout(r, 5000)) // Aguarda processamento

            const publishResponse = await fetch(`https://graph.facebook.com/v19.0/${loja.instagram_account_id}/media_publish`, {
                method: 'POST',
                body: new URLSearchParams({
                    creation_id: singleData.id,
                    access_token: loja.instagram_access_token
                })
            })
            const publishData = await publishResponse.json()

            if (publishData.error) {
                return { error: `Erro na publicação: ${publishData.error.message}` }
            }

            console.log('🎉 FOTO POSTADA COM SUCESSO!')
            return { success: true, message: 'Foto única postada com sucesso no Instagram!' }
        }

        console.log('\n\n' + '🚀'.repeat(20))
        console.log(`--- INICIANDO POSTAGEM DE ÁLBUM (${imagensParaPostar.length} fotos) ---`)

        // ETAPA 1: Criar containers individuais para cada foto
        const itemIds: string[] = []

        for (const [index, imgUrl] of imagensParaPostar.entries()) {
            console.log(`📸 Preparando foto ${index + 1}...`)

            // Com o novo imageCompressor.ts (Client Side), as imagens no Supabase já estão 
            // em JPG, no Aspect Ratio 4:3 (1920x1440) obrigatório para Webmotors/Instagram
            const res = await fetch(`https://graph.facebook.com/v19.0/${loja.instagram_account_id}/media`, {
                method: 'POST',
                body: new URLSearchParams({
                    image_url: imgUrl,
                    is_carousel_item: 'true',
                    access_token: loja.instagram_access_token
                })
            })
            const data = await res.json()
            if (data.id) {
                itemIds.push(data.id)
                console.log(`✅ Foto ${index + 1} pronta (ID: ${data.id})`)
            } else {
                console.error(`❌ Erro detalhado na foto ${index + 1}:`, {
                    url: imgUrl,
                    error: data.error
                })
                // Detectar token expirado (código 190) e retornar imediatamente
                if (data.error?.code === 190) {
                    return { error: '🔑 Token do Instagram expirado! Vá em Configurações → Instagram e gere um novo Token de Acesso.' }
                }
            }
        }

        if (itemIds.length < 2) {
            console.error('❌ Falha ao processar imagens suficientes:', {
                enviadas: imagensParaPostar.length,
                processadas: itemIds.length,
                ids: itemIds
            })
            return { error: `Falha ao processar imagens para o álbum. Apenas ${itemIds.length} de ${imagensParaPostar.length} ficaram prontas.` }
        }

        // ETAPA 2: Aguardar o processamento de todos os itens
        console.log('⏳ Aguardando processamento das fotos (10 segundos)...')
        await new Promise(r => setTimeout(r, 10000))

        // ETAPA 3: Criar o Container do Carrossel (Álbum)
        console.log('📦 Criando o Álbum (Carrossel)...')
        const carouselRes = await fetch(`https://graph.facebook.com/v19.0/${loja.instagram_account_id}/media`, {
            method: 'POST',
            body: new URLSearchParams({
                media_type: 'CAROUSEL',
                children: itemIds.join(','),
                caption: caption,
                access_token: loja.instagram_access_token
            })
        })
        const carouselData = await carouselRes.json()

        if (carouselData.error) {
            console.error('❌ Erro ao criar álbum:', carouselData.error.message)
            return { error: `Erro ao criar álbum: ${carouselData.error.message}` }
        }

        const carouselContainerId = carouselData.id

        // ETAPA 4: Aguardar o álbum ficar pronto
        console.log('⏳ Verificando status do álbum...')
        await new Promise(r => setTimeout(r, 5000))

        // ETAPA 5: Publicar o Carrossel
        console.log('🚀 Publicando Álbum agora...')
        const publishResponse = await fetch(`https://graph.facebook.com/v19.0/${loja.instagram_account_id}/media_publish`, {
            method: 'POST',
            body: new URLSearchParams({
                creation_id: carouselContainerId,
                access_token: loja.instagram_access_token
            })
        })
        const publishData = await publishResponse.json()

        if (publishData.error) {
            return { error: `Erro na publicação final: ${publishData.error.message}` }
        }

        console.log('🎉 ÁLBUM POSTADO COM SUCESSO!')
        return { success: true, message: `Álbum com ${itemIds.length} fotos postado no Instagram!` }

    } catch (e: any) {
        return { error: `Erro crítico: ${e.message}` }
    }
}
