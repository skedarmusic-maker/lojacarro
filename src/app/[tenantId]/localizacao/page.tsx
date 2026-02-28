import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import StorefrontHeader from '../StorefrontHeader'
import { MapPin, Navigation2, Compass } from 'lucide-react'
import StorefrontFooter from '../StorefrontFooter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TenantLocalizacao({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params
    const supabase = await createClient()

    const { data: loja } = await supabase
        .from('perfis_lojas')
        .select('*')
        .or(`slug.eq.${tenantId},custom_domain.eq.${tenantId}`)
        .single()

    if (!loja) notFound()

    const contato = loja.dados_contato || {}
    const corPrimaria = loja.config_visual?.cor_primaria || '#3b82f6'

    const headersList = await headers()
    const basePath = headersList.get('x-base-path') || ''

    // Fallback caso nao tenha iframe (Evitar que quebre)
    const hasMap = contato.google_maps_embed && contato.google_maps_embed.includes('<iframe')

    // Link para abrir GPS Nativo do Celular (Google Maps Link)
    const queryEnderecoParaGps = encodeURIComponent(`${contato.endereco || ''} ${contato.cidade || ''} ${contato.estado || ''}`)
    const gpsLink = queryEnderecoParaGps.length > 5 ? `https://www.google.com/maps/search/?api=1&query=${queryEnderecoParaGps}` : '#'

    // Schema Markup - LocalBusiness for SEO Local
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": loja.nome,
        "image": loja.config_visual?.logo_url || undefined,
        "url": loja.custom_domain ? `https://${loja.custom_domain}` : `https://${loja.slug}.plataforma.com`,
        "telephone": contato.telefone_fixo || contato.whatsapp,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": contato.endereco,
            "addressLocality": contato.cidade,
            "addressRegion": contato.estado,
            "postalCode": contato.cep,
            "addressCountry": "BR"
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                .iframe-container iframe {
                    width: 100% !important;
                    height: 100% !important;
                    border: 0 !important;
                }
            `}} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <StorefrontHeader
                nome={loja.nome}
                logo_url={loja.config_visual?.logo_url}
                cor_primaria={corPrimaria}
                basePath={basePath}
                activePath="localizacao"
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-16">

                <div className="text-center mb-16 animate-in slide-in-from-bottom-5 fade-in duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm border border-gray-200 mb-6 relative">
                        {/* Efeito Glow */}
                        <div className="absolute inset-0 bg-[var(--color-brand)] opacity-10 blur-xl rounded-full"></div>
                        <Compass className="text-[var(--color-brand)] z-10" size={40} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Onde Estamos</h1>
                    <p className="text-gray-500 text-lg">Faça-nos uma visita e conheça nosso showroom pessoalmente.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUNA ESQUERDA: INFOS DE ENDEREÇO */}
                    <div className="lg:col-span-1 space-y-6">

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 h-full">
                            <h2 className="text-2xl font-bold mb-8 border-b border-gray-200 pb-4">Endereço Oficial</h2>

                            <div className="flex items-start gap-4 mb-8">
                                <MapPin className="text-[var(--color-brand)] shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-lg mb-2 text-gray-900">{loja.nome}</h4>
                                    <p className="text-gray-500 leading-relaxed max-w-sm">
                                        {contato.endereco || 'Avenida Indefinida, 0000'} <br />
                                        {contato.cidade && contato.estado ? `${contato.cidade} - ${contato.estado}` : 'Cidade não cadastrada'} <br />
                                        {contato.cep && `CEP: ${contato.cep}`}
                                    </p>
                                </div>
                            </div>

                            {/* Botao de Rota DInâmico */}
                            {queryEnderecoParaGps.length > 5 && (
                                <a
                                    href={gpsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--color-brand)] text-white hover:opacity-90 transition-opacity rounded-xl font-bold text-lg"
                                >
                                    <Navigation2 size={20} className="fill-white" /> Como Chegar (GPS)
                                </a>
                            )}
                        </div>

                    </div>

                    {/* COLUNA DIREITA: GOOGLE MAPS EMBED */}
                    <div className="lg:col-span-2">
                        <div className="w-full h-[500px] md:h-[600px] bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden relative group">
                            {hasMap ? (
                                <div
                                    className="w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 iframe-container"
                                    dangerouslySetInnerHTML={{ __html: contato.google_maps_embed as string }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-400 p-8 text-center">
                                    <MapPin size={48} className="mb-4 opacity-50 text-gray-300" />
                                    <p className="font-bold text-xl mb-2 text-gray-500">Mapa não configurado</p>
                                    <p className="max-w-md">O lojista ainda não incorporou o código HTML do Google Maps nas configurações do painel.</p>
                                </div>
                            )}

                            {/* Camada Visual Decorativa Interna */}
                            <div className="absolute inset-0 border-[3px] border-black/10 rounded-2xl pointer-events-none"></div>
                        </div>
                    </div>

                </div>

            </main>

            <StorefrontFooter
                slug={loja.slug}
                lojaNome={loja.nome}
                logoUrl={loja.config_visual?.logo_url || ''}
                corPrimaria={corPrimaria}
                contato={loja.dados_contato || {}}
                basePath={basePath}
            />
        </div>
    )
}
