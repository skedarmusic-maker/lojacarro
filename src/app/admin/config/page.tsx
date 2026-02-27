import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export default async function ConfigPage() {
    const supabase = await createClient()
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const baseHost = host.split('.').slice(-2).join('.') // Pega o dominio base (ex: hostingersite.com)

    const { data: { user } } = await supabase.auth.getUser()

    let { data: loja } = await supabase
        .from('perfis_lojas')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

    if (!loja && user?.email) {
        const defaultSlug = user.email.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000)
        const { data: novaLoja } = await supabase.from('perfis_lojas').insert({
            user_id: user.id,
            nome: 'Minha Loja',
            slug: defaultSlug
        }).select().single()
        loja = novaLoja
    }

    // Server Action para Atualizar as Configurações
    async function updateConfig(formData: FormData) {
        'use server'
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Na fase 3, implementar upload real do logo para o bucket 'logos' e pegar a URL. Algumas validações extras aqui

        const cores = {
            cor_primaria: formData.get('cor_primaria') as string,
            logo_url: loja?.config_visual?.logo_url || null // mantem a atual se não mudar
        }

        let imagem_sobre_url = loja?.imagem_sobre || null
        const file_imagem_sobre = formData.get('imagem_sobre') as File | null
        if (file_imagem_sobre && file_imagem_sobre.size > 0 && loja) {
            const ext = file_imagem_sobre.name.split('.').pop()
            const fileName = `loja-${loja.id}-fachada-${Date.now()}.${ext}`
            const arrayBuffer = await file_imagem_sobre.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('logos')
                .upload(fileName, buffer, {
                    upsert: true,
                    contentType: file_imagem_sobre.type
                })

            if (!uploadError && uploadData) {
                const { data } = supabase.storage.from('logos').getPublicUrl(fileName)
                imagem_sobre_url = data.publicUrl
            } else {
                console.error("Erro upload imagem sobre", uploadError)
            }
        }

        const dadosContato = {
            endereco: formData.get('endereco') as string,
            cidade: formData.get('cidade') as string,
            estado: formData.get('estado') as string,
            cep: formData.get('cep') as string,
            whatsapp: formData.get('whatsapp') as string,
            telefone_fixo: formData.get('telefone_fixo') as string,
            email: formData.get('email') as string,
            google_maps_embed: formData.get('google_maps_embed') as string,
            instagram: formData.get('instagram') as string,
            facebook: formData.get('facebook') as string,
            horario_funcionamento: formData.get('horario_funcionamento') as string,
        }

        await supabase
            .from('perfis_lojas')
            .update({
                nome: formData.get('nome') as string,
                slug: formData.get('slug') as string,
                custom_domain: formData.get('custom_domain') as string || null,
                webhook_url_leads: formData.get('webhook_url_leads') as string || null,
                sobre_loja: formData.get('sobre_loja') as string || null,
                imagem_sobre: imagem_sobre_url,
                config_visual: cores,
                dados_contato: dadosContato,
                instagram_access_token: formData.get('instagram_access_token') as string || null,
                instagram_account_id: formData.get('instagram_account_id') as string || null,
            })
            .eq('user_id', user?.id)

        revalidatePath('/admin/config')
        revalidatePath('/', 'layout') // Força atualização total para refletir novas cores/dominios
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex text-sm">
            {/* Sidebar (Simplificada) */}
            <aside className="w-64 border-r border-zinc-800 bg-[#0f0f0f] hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="font-bold text-lg">Menu Admin</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"> Visão Geral </a>
                    <a href="/admin/estoque" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"> Meu Estoque </a>
                    <a href="/admin/config" className="block px-4 py-2.5 bg-zinc-800 text-white rounded-md font-medium"> Configurações </a>
                    <a
                        href={`https://wa.me/5511965843545?text=${encodeURIComponent(`Olá! Sou da loja ${loja?.nome} (slug: ${loja?.slug}) e preciso de suporte no Painel Admin.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"
                    >
                        Suporte
                    </a>
                </nav>
            </aside>

            <main className="flex-1 overflow-auto">
                <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between px-4 md:px-8 sticky top-0 backdrop-blur-md z-40">
                    <div className="flex items-center gap-3">
                        <a href="/admin/dashboard" className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                            <span className="text-lg leading-none shrink-0 mb-0.5">&lsaquo;</span>
                        </a>
                        <h1 className="text-xl font-semibold">Configurações da Conta</h1>
                    </div>
                </header>

                <div className="p-8 max-w-3xl">
                    <div className="bg-[#141414] border border-zinc-800 rounded-xl p-8 mb-12">
                        <h2 className="text-lg font-bold mb-6 border-b border-zinc-800 pb-2">Identidade e Domínio (White-Label)</h2>

                        <form action={updateConfig} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Nome Oficial da Loja</label>
                                <input required defaultValue={loja?.nome} name="nome" placeholder="Ex: Marinhos Veículos" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Subdomínio na Plataforma</label>
                                    <div className="flex relative">
                                        <input required defaultValue={loja?.slug} name="slug" placeholder="marinhos" className="w-full rounded-l-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white z-10" />
                                        <span className="bg-zinc-800 border border-zinc-700 border-l-0 rounded-r-md px-4 py-2.5 text-zinc-400 flex items-center whitespace-nowrap">.{baseHost}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">O endereço padrão gratuito do seu site.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        Domínio Próprio <span className="bg-emerald-900/50 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">PRO</span>
                                    </label>
                                    <input defaultValue={loja?.custom_domain || ''} name="custom_domain" placeholder="Ex: www.marinhosveiculos.com.br" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    <p className="text-xs text-zinc-500">Deixe em branco se não possuir domínio.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-800/50">
                                <h3 className="text-md font-medium text-zinc-200 mb-4">Aparência da Vitrine</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Cor Principal (CSS Hex)</label>
                                        <div className="flex gap-4 items-center">
                                            <input type="color" defaultValue={loja?.config_visual?.cor_primaria || '#3b82f6'} name="cor_primaria" className="h-10 w-20 rounded bg-transparent cursor-pointer" />
                                            <span className="text-zinc-400 text-sm font-mono">{loja?.config_visual?.cor_primaria || '#3b82f6'}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500">Essa cor será usada em botões, links e destaques no seu site.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Logotipo (Em breve)</label>
                                        <div className="border border-dashed border-zinc-700 rounded-md h-24 flex items-center justify-center text-zinc-500 text-xs bg-zinc-900/50">
                                            O upload de Logo estará disponível após integração com Supabase Storage.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NOVA SEÇÃO: CONTATO E LOCALIZAÇÃO */}
                            <div className="pt-8 mt-8 border-t border-zinc-800/50">
                                <h3 className="text-md font-medium text-zinc-200 mb-6 border-b border-zinc-800/50 pb-2">Localização e Contato</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">WhatsApp</label>
                                        <input defaultValue={loja?.dados_contato?.whatsapp || ''} name="whatsapp" placeholder="Ex: 11999999999" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">E-mail Profissional</label>
                                        <input defaultValue={loja?.dados_contato?.email || ''} name="email" type="email" placeholder="contato@loja.com" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Telefone Fixo</label>
                                        <input defaultValue={loja?.dados_contato?.telefone_fixo || ''} name="telefone_fixo" placeholder="Ex: 1133334444" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Instagram (apenas o @)</label>
                                        <input defaultValue={loja?.dados_contato?.instagram || ''} name="instagram" placeholder="Ex: marinhosveiculos" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Facebook (Link da página)</label>
                                        <input defaultValue={loja?.dados_contato?.facebook || ''} name="facebook" placeholder="Ex: https://facebook.com/loja" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-medium text-zinc-300">Endereço Completo</label>
                                    <input defaultValue={loja?.dados_contato?.endereco || ''} name="endereco" placeholder="Ex: Avenida das Américas, 1000 - Barra da Tijuca" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Cidade</label>
                                        <input defaultValue={loja?.dados_contato?.cidade || ''} name="cidade" placeholder="Ex: Rio de Janeiro" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Estado (UF)</label>
                                        <input defaultValue={loja?.dados_contato?.estado || ''} name="estado" placeholder="Ex: RJ" maxLength={2} className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">CEP</label>
                                        <input defaultValue={loja?.dados_contato?.cep || ''} name="cep" placeholder="00000-000" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-medium text-zinc-300">Horários de Atendimento</label>
                                    <input defaultValue={loja?.dados_contato?.horario_funcionamento || ''} name="horario_funcionamento" placeholder="Ex: Seg a Sex 09:00 - 18:00 | Sáb 09:00 - 13:00" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Google Maps Embed (HTML do Mapa)</label>
                                    <textarea defaultValue={loja?.dados_contato?.google_maps_embed || ''} name="google_maps_embed" rows={3} placeholder='Cole aqui a tag <iframe src="..."> completa gerada pelo Google Maps' className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white text-xs font-mono"></textarea>
                                    <p className="text-xs text-zinc-500 mt-1">Vá no Google Maps, pesquise o endereço, clique em "Compartilhar" {'>'} "Incorporar mapa" e copie o HTML.</p>
                                </div>
                            </div>

                            {/* NOVA SEÇÃO: INSTITUCIONAL & SEO */}
                            <div className="pt-8 mt-8 border-t border-zinc-800/50">
                                <h3 className="text-md font-medium text-zinc-200 mb-6 border-b border-zinc-800/50 pb-2">Institucional & SEO (Página Sobre)</h3>

                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-medium text-zinc-300">Imagem da Loja (Fachada ou Logotipo)</label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {loja?.imagem_sobre && (
                                            <div className="w-32 h-32 rounded-lg bg-zinc-900 border border-zinc-800 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                                                <img src={loja.imagem_sobre} alt="Imagem da Loja" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input type="file" name="imagem_sobre" accept="image/*" className="w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 bg-zinc-900/50 border border-zinc-800 rounded-md cursor-pointer" />
                                            <p className="text-xs text-zinc-500 mt-2">Envie uma foto da fachada, do pátio ou o seu logo. Ela dará muito mais credibilidade e vida à página Sobre.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-medium text-zinc-300">História da Loja (Sobre Nós)</label>
                                    <textarea defaultValue={loja?.sobre_loja || ''} name="sobre_loja" rows={6} placeholder="Conte um pouco sobre a história, missão e os diferenciais da sua loja..." className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-white text-sm" />
                                    <p className="text-xs text-zinc-500 mt-1">Este texto aparecerá na página /sobre. Se deixar em branco, criaremos um texto otimizado para SEO automaticamente usando seus dados de contato.</p>
                                </div>
                            </div>

                            {/* NOVA SEÇÃO: INTEGRAÇÕES */}
                            <div className="pt-8 mt-8 border-t border-zinc-800/50">
                                <h3 className="text-md font-medium text-zinc-200 mb-6 border-b border-zinc-800/50 pb-2">Integrações Automáticas</h3>

                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        Webhook de Leads (Google Sheets, Zapier, Make) <span className="bg-emerald-900/50 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">NOVO</span>
                                    </label>
                                    <input defaultValue={loja?.webhook_url_leads || ''} name="webhook_url_leads" type="url" placeholder="https://script.google.com/macros/s/..." className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white text-xs font-mono" />
                                    <p className="text-xs text-zinc-500 mt-1">Cole a URL do seu Webhook. Sempre que um cliente solicitar simulação de financiamento, enviaremos os dados automaticamente para este endereço.</p>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        Integração Meta Graph API (Instagram) <span className="bg-emerald-900/50 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">NOVO</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-xs text-zinc-400">Instagram Access Token (Long-Lived)</p>
                                            <input defaultValue={loja?.instagram_access_token || ''} name="instagram_access_token" type="password" placeholder="EAAI..." className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white text-xs font-mono" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs text-zinc-400">Instagram Account ID</p>
                                            <input defaultValue={loja?.instagram_account_id || ''} name="instagram_account_id" type="text" placeholder="178414..." className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white text-xs font-mono" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">Insira as chaves geradas no Meta for Developers para habilitar a postagem automática de veículos no Instagram da loja.</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3 rounded-md transition-colors w-full sm:w-auto">
                                    Salvar Configurações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
