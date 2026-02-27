import { createClient } from '@/lib/supabase/server'
import { notFound } from "next/navigation"
import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'
import { Phone, MessageCircle } from 'lucide-react'
import StorefrontFooter from '../../StorefrontFooter'
import FinancingModalClient from './FinancingModalClient'
import VehicleGallery from './VehicleGallery'

type CarPageProps = {
    params: Promise<{ tenantId: string; carId: string }>
}

// 1. Geração Dinâmica de SEO (Meta tags do Whatsapp, Google, Instagram)
export async function generateMetadata(
    { params }: CarPageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { tenantId, carId } = await params
    const supabase = await createClient()

    // Buscar Loja
    const { data: loja } = await supabase.from('perfis_lojas').select('nome').or(`slug.eq.${tenantId},custom_domain.eq.${tenantId}`).single()

    // Buscar Carro
    const { data: car } = await supabase.from('veiculos').select('*').eq('id', carId).single()

    if (!car || !loja) return { title: 'Veículo não encontrado' }

    const titulo = `${car.marca} ${car.modelo} ${car.ano_fabricacao} | ${loja.nome}`
    const descricao = `Apenas R$ ${Number(car.preco).toLocaleString('pt-BR')}! Confira os detalhes deste ${car.marca} ${car.modelo} no estoque da ${loja.nome}.`
    const fotoRaiz = car.imagens?.[0] || 'https://via.placeholder.com/1200x630.png?text=Sem+Foto'

    return {
        title: titulo,
        description: descricao,
        openGraph: {
            title: titulo,
            description: descricao,
            images: [fotoRaiz],
        },
        twitter: {
            card: 'summary_large_image',
            title: titulo,
            description: descricao,
            images: [fotoRaiz],
        },
    }
}
import StorefrontCategories from '../../StorefrontCategories'

// 2. Renderização da Página do Carro (Server Side)
export default async function DetalhesVeiculoPage({ params }: CarPageProps) {
    const { tenantId, carId } = await params
    const supabase = await createClient()

    const { data: loja } = await supabase.from('perfis_lojas').select('*').or(`slug.eq.${tenantId},custom_domain.eq.${tenantId}`).single()
    const { data: car } = await supabase.from('veiculos').select('*').eq('id', carId).single()

    if (!loja || !car) notFound()

    // Busca veículos para obter as categorias dinamicamente
    const { data: todosVeiculos } = await supabase
        .from('veiculos')
        .select('categoria')
        .eq('loja_id', loja.id)
        .eq('status', 'disponivel')

    const categoriaCount: Record<string, number> = {}
    const availableCategories = new Set<string>()

    todosVeiculos?.forEach(v => {
        const c = v.categoria || 'Outros'
        categoriaCount[c] = (categoriaCount[c] || 0) + 1
        availableCategories.add(c)
    })

    const rawWhatsApp = loja.dados_contato?.whatsapp ? loja.dados_contato.whatsapp.replace(/\D/g, '') : '11999999999'

    const zapMessage = `Olá! Tenho interesse no veículo ${car.marca} ${car.modelo} (${car.ano_fabricacao}) que vi no site.`
    const linkWhatsApp = `https://wa.me/55${rawWhatsApp}?text=${encodeURIComponent(zapMessage)}`

    const corPrimaria = loja.config_visual?.cor_primaria || '#3b82f6'

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
            <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="text-2xl font-black tracking-tight flex items-center gap-3">
                        {loja.config_visual?.logo_url && (
                            <img src={loja.config_visual.logo_url} alt={`Logo ${loja.nome}`} className="h-10 w-auto" />
                        )}
                        <Link href={`/${tenantId}`} style={{ color: "var(--color-brand)" }}>{loja.nome}</Link>
                    </div>
                    <nav className="hidden md:flex gap-6 font-medium text-gray-600">
                        <Link href={`/${tenantId}`} className="hover:text-gray-900 transition-colors">Estoque</Link>
                        <Link href={`/${tenantId}/sobre`} className="hover:text-gray-900 transition-colors">Sobre Nós</Link>
                        <Link href={`/${tenantId}/localizacao`} className="hover:text-gray-900 transition-colors">Localização</Link>
                        <Link href={`/${tenantId}/contato`} className="hover:text-gray-900 transition-colors">Contato</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content Area - Webmotors Style */}
            <main className="flex-1 w-full pb-24 md:pb-12 bg-white md:bg-gray-50">

                {/* Hero Gallery (Full width in mobile, constrained/edge-to-edge in desktop) */}
                <section className="w-full max-w-[1440px] mx-auto md:px-4 md:pt-4">
                    <VehicleGallery
                        images={car.imagens || []}
                        modelo={`${car.marca} ${car.modelo}`}
                    />
                </section>

                {/* Split Content: Main details (Left - 70.5%) + Sticky Lead Card (Right - 29.5%) */}
                <div className="max-w-[1440px] mx-auto w-full md:px-4 mt-6 md:mt-12 flex flex-col lg:flex-row gap-8 relative items-start">

                    {/* Left Column - Content (70.5%) */}
                    <div className="flex-1 lg:w-[70.5%] w-full bg-white md:p-12 md:rounded-2xl md:shadow-[0_2px_20px_rgba(0,0,0,0.03)] md:border md:border-gray-100">
                        <div className="mb-6 md:mb-8 border-b border-gray-100 pb-6 md:pb-8">
                            <div className="flex items-center gap-2 mb-2 justify-between">
                                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                                    <h1 className="text-3xl md:text-5xl font-black uppercase text-gray-500 tracking-tighter">{car.marca}</h1>
                                    <h2 className="text-3xl md:text-5xl font-black text-[var(--color-brand)] tracking-tighter">{car.modelo}</h2>
                                </div>
                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                    {/* Like Heart Icon Optional */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                                {car.categoria ? `${car.categoria} AUTOMÁTICO` : 'VERSÃO NÃO INFORMADA'}
                            </p>
                        </div>

                        {/* Especificações - Grid Denso (Webmotors style) */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-6 mb-12">
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">Cidade</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">São Paulo - SP</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">Ano</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">{car.ano_fabricacao}/{car.ano_modelo}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">KM</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">{car.quilometragem.toLocaleString('pt-BR')}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">Câmbio</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">Automática</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">Carroceria</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">{car.categoria || '-'}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">Combustível</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">Gasolina e elétrico</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">Final da Placa</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">5</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-bold">Cor</div>
                                <div className="font-bold text-base text-gray-900 border-l-2 border-[var(--color-brand)] pl-3">Branco</div>
                            </div>
                        </div>

                        <div className="mb-0">
                            <h3 className="text-lg text-gray-900 font-bold mb-4 pb-2 border-b border-gray-100">Sobre este carro</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                {car.descricao || "Veículo em excelente estado de conservação. Em breve o lojista adicionará mais detalhes sobre este veículo."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Sticky Lead Card (29.5%) */}
                    <aside className="w-full lg:w-[29.5%] lg:max-w-[440px] lg:sticky lg:top-[100px]">
                        <div className="bg-white rounded-2xl md:shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:border border-gray-100 p-0 md:p-6 flex flex-col">

                            {/* Price Area inside Card */}
                            <div className="mb-6">
                                {car.preco_promocional > 0 ? (
                                    <div className="flex flex-col mb-2">
                                        <span className="text-gray-400 text-sm line-through decoration-gray-300 font-bold mb-1">
                                            R$ {Number(car.preco).toLocaleString('pt-BR')}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                                R$ {Number(car.preco_promocional).toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider self-start mt-2">
                                            Oferta Especial
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter">
                                        R$ {Number(car.preco).toLocaleString('pt-BR')}
                                    </div>
                                )}
                            </div>

                            <FinancingModalClient
                                lojaId={loja.id}
                                veiculoId={car.id}
                                veiculoNome={`${car.marca} ${car.modelo}`}
                                corPrimaria={corPrimaria}
                            >
                                <button className="w-full mb-6 py-2.5 px-4 rounded-lg font-bold text-center flex items-center justify-center transition-colors border-2 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white text-sm">
                                    Ver parcelas <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><rect width="20" height="14" x="2" y="5" rx="2" ry="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                </button>
                            </FinancingModalClient>

                            <hr className="border-gray-100 mb-6 hidden md:block" />

                            <div className="mb-4 text-sm text-gray-500 font-medium pb-2 border-b border-gray-100 md:border-b-0 md:pb-0">
                                Envie uma mensagem ao vendedor
                            </div>

                            {/* Lead Form Mockup connected to WhatsApp */}
                            <form action={linkWhatsApp} target="_blank" className="flex flex-col gap-3">
                                <input type="text" placeholder="Nome*" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all placeholder:text-gray-400" />
                                <input type="email" placeholder="E-mail*" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all placeholder:text-gray-400" />
                                <input type="tel" placeholder="Telefone*" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all placeholder:text-gray-400" />
                                <textarea rows={2} placeholder="Mensagem*" required defaultValue={`Olá, tenho interesse no veículo. Por favor entre em contato.`} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all resize-none placeholder:text-gray-400 text-gray-600"></textarea>

                                <div className="flex items-start gap-2 mt-2 mb-3">
                                    <input type="checkbox" id="terms" defaultChecked className="mt-1 flex-shrink-0 cursor-pointer" />
                                    <label htmlFor="terms" className="text-xs text-gray-500 leading-tight cursor-pointer">
                                        Quero receber contatos da {loja.nome} por e-mail, WhatsApp e outros canais.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-lg font-bold text-white text-center flex items-center justify-center transition-transform hover:scale-[1.02] shadow-md shadow-black/10 text-base"
                                    style={{ backgroundColor: "var(--color-brand)" }}
                                >
                                    Enviar mensagem
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Sticky Action Bar (Visível apenas no Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 flex gap-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <FinancingModalClient
                    lojaId={loja.id}
                    veiculoId={car.id}
                    veiculoNome={`${car.marca} ${car.modelo}`}
                    corPrimaria={corPrimaria}
                >
                    <button className="flex-1 bg-white text-[var(--color-brand)] border-2 border-[var(--color-brand)] font-bold rounded-lg py-3 px-2 text-xs text-center active:scale-95 transition-transform h-full">
                        Financiar
                    </button>
                </FinancingModalClient>
                <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[1.5] text-white font-bold rounded-lg py-3 px-2 text-sm text-center flex items-center justify-center active:scale-95 transition-transform"
                    style={{ backgroundColor: "var(--color-brand)" }}
                >
                    Vendedor
                </a>
            </div>

            {/* Categorias (Continuar Explorando) */}
            <StorefrontCategories
                tenantId={tenantId}
                availableCategories={Array.from(availableCategories).sort()}
                categoriaCount={categoriaCount}
            />

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
