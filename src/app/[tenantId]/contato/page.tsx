import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Clock, Car } from 'lucide-react'
import StorefrontFooter from '../StorefrontFooter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TenantContato({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params
    const supabase = await createClient()

    const { data: loja } = await supabase
        .from('perfis_lojas')
        .select('*')
        .or(`slug.eq.${tenantId},custom_domain.eq.${tenantId}`)
        .single()

    if (!loja) notFound()

    const contato = loja.dados_contato || {}
    const hasZap = !!contato.whatsapp
    const whatsappLink = hasZap ? `https://wa.me/55${contato.whatsapp.replace(/\D/g, '')}?text=Olá! Vim pelo site da loja e gostaria de tirar algumas dúvidas.` : '#'

    const corPrimaria = loja.config_visual?.cor_primaria || '#3b82f6'

    // Schema Markup - LocalBusiness for SEO Local
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": loja.nome,
        "image": loja.config_visual?.logo_url || undefined,
        "url": loja.custom_domain ? `https://${loja.custom_domain}` : `https://${loja.slug}.plataforma.com`,
        "telephone": contato.telefone_fixo || contato.whatsapp,
        "email": contato.email,
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <Link href={`/${tenantId}`} className="text-2xl font-black tracking-tight flex items-center gap-3">
                        {loja.config_visual?.logo_url && (
                            <img src={loja.config_visual.logo_url} alt={`Logo ${loja.nome}`} className="h-10 w-auto" />
                        )}
                        <span style={{ color: "var(--color-brand)" }}>{loja.nome}</span>
                    </Link>
                    <nav className="hidden md:flex gap-6 font-medium text-gray-500">
                        <Link href={`/${tenantId}`} className="hover:text-gray-900 transition-colors">Estoque</Link>
                        <Link href={`/${tenantId}/sobre`} className="hover:text-gray-900 transition-colors">Sobre Nós</Link>
                        <Link href={`/${tenantId}/localizacao`} className="hover:text-gray-900 transition-colors">Localização</Link>
                        <Link href={`/${tenantId}/contato`} className="text-gray-900 font-bold">Contato</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-16">
                <div className="text-center mb-16 animate-in slide-in-from-bottom-5 fade-in duration-700">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Fale Conosco</h1>
                    <p className="text-gray-500 text-lg">Nossa equipe está pronta para te atender e negociar seu próximo veículo.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Canais Oficiais */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-4">Canais Diretos</h2>

                        {hasZap && (
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white shadow-sm border border-gray-200 hover:border-emerald-500/50 hover:shadow-md p-6 rounded-2xl transition-all group">
                                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <Phone size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">WhatsApp Vendas</h3>
                                    <p className="text-gray-500">{contato.whatsapp}</p>
                                </div>
                            </a>
                        )}

                        {contato.telefone_fixo && (
                            <div className="flex items-center gap-4 bg-white shadow-sm border border-gray-200 p-6 rounded-2xl">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                    <Phone size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Telefone Fixo</h3>
                                    <p className="text-gray-500">{contato.telefone_fixo}</p>
                                </div>
                            </div>
                        )}

                        {contato.email && (
                            <a href={`mailto:${contato.email}`} className="flex items-center gap-4 bg-white shadow-sm border border-gray-200 hover:border-blue-500/50 hover:shadow-md p-6 rounded-2xl transition-all group">
                                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <Mail size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">E-mail Comercial</h3>
                                    <p className="text-gray-500">{contato.email}</p>
                                </div>
                            </a>
                        )}

                        {contato.instagram && (
                            <a href={`https://instagram.com/${contato.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white shadow-sm border border-gray-200 hover:border-pink-500/50 hover:shadow-md p-6 rounded-2xl transition-all group">
                                <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                                    <Instagram size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">Instagram</h3>
                                    <p className="text-gray-500">@{contato.instagram.replace('@', '')}</p>
                                </div>
                            </a>
                        )}
                    </div>

                    {/* Endereço e Horários (Preview Rápido) */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-4">Visite-nos</h2>

                        <div className="bg-white border border-gray-200 shadow-sm p-8 rounded-2xl relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-gray-900">
                                <Car size={300} />
                            </div>

                            <div className="relative z-10 flex items-start gap-4 mb-8">
                                <MapPin className="text-[var(--color-brand)] shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-gray-900">Nosso Showroom</h4>
                                    <p className="text-gray-500 max-w-sm">{contato.endereco || 'Endereço não cadastrado'}</p>
                                    {(contato.cidade || contato.estado) && (
                                        <p className="text-gray-400 text-sm mt-1">{contato.cidade} - {contato.estado} • {contato.cep}</p>
                                    )}
                                    <Link href="/localizacao" className="inline-block mt-4 text-sm font-medium border border-gray-300 hover:border-[var(--color-brand)] text-gray-700 px-4 py-2 rounded-full transition-colors">Ver Mapa Completo</Link>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-start gap-4 border-t border-gray-100 pt-8">
                                <Clock className="text-[var(--color-brand)] shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-gray-900">Horário de Funcionamento</h4>
                                    <p className="text-gray-500 max-w-sm whitespace-pre-wrap">{contato.horario_funcionamento || 'Consulte nossos horários'}</p>
                                </div>
                            </div>
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
            />
        </div>
    )
}
