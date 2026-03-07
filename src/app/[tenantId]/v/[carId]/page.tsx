import { createClient } from '@/lib/supabase/server'
import { notFound } from "next/navigation"
import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'
import { headers } from 'next/headers'
import { Phone, MessageCircle } from 'lucide-react'
import StorefrontFooter from '../../StorefrontFooter'
import StorefrontHeader from '../../StorefrontHeader'
import FinancingModalClient from './FinancingModalClient'
import VehicleGallery from './VehicleGallery'
import { formatCurrency } from '@/lib/utils'
import { registrarPageView } from '../actions/analytics'
import LeadFormClient from './LeadFormClient'

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
    const descricao = `Apenas ${formatCurrency(car.preco)}! Confira os detalhes deste ${car.marca} ${car.modelo} no estoque da ${loja.nome}.`
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

    // 3. Analytics Tracking Server Side (Silencioso)
    registrarPageView(loja.id, tenantId, 'veiculo', car.id)

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

    const headersList = await headers()
    const basePath = headersList.get('x-base-path') || ''

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
            <StorefrontHeader
                nome={loja.nome}
                logo_url={loja.config_visual?.logo_url}
                cor_primaria={corPrimaria}
                basePath={basePath}
                activePath="estoque"
            />

            {/* Main Content Area - Webmotors Style */}
            <main className="flex-1 w-full pb-24 md:pb-12 bg-white md:bg-gray-50">

                {/* Hero Gallery (Full width in mobile, constrained/edge-to-edge in desktop) */}
                <section className="w-full max-w-[1440px] mx-auto md:px-0">
                    <VehicleGallery
                        images={car.imagens || []}
                        modelo={`${car.marca} ${car.modelo}`}
                    />
                </section>

                {/* Split Content: Main details (Left - 70.5%) + Sticky Lead Card (Right - 29.5%) */}
                <div className="max-w-[1440px] mx-auto w-full px-0 md:px-4 flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 relative items-start md:-mt-8 lg:-mt-16 z-10">

                    {/* Left Column - Content (70.5%) */}
                    <div className="flex-1 lg:w-[70.5%] w-full bg-white px-5 md:px-8 py-6 md:pt-8 md:pb-12 md:rounded-xl md:shadow-[0_8px_30px_rgb(0,0,0,0.06)] md:border border-gray-100">
                        <div className="mb-6 md:mb-10 border-b border-gray-200 pb-6 md:pb-8 flex justify-between items-start gap-4">
                            <div>
                                {(() => {
                                    // Separador inteligente igual ao Storefront List
                                    const modeloStr = car.modelo || '';
                                    const modeloParts = modeloStr.split(' ');
                                    const modeloPrincipal = modeloParts[0] || '';
                                    const modeloResto = modeloParts.slice(1).join(' ').trim();

                                    const versaoSecundaria = [
                                        modeloResto
                                    ].filter(Boolean).join(' ').toUpperCase();

                                    return (
                                        <>
                                            <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight leading-tight mb-2 uppercase break-words">
                                                <span className="text-[#333333]">{car.marca} <span className="text-[var(--color-brand)]">{modeloPrincipal}</span></span>
                                            </h1>
                                            {versaoSecundaria && (
                                                <p className="text-[13px] text-[#818085] font-normal uppercase tracking-wide leading-relaxed">
                                                    {versaoSecundaria}
                                                </p>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                            <button className="text-gray-400 hover:text-red-500 transition-colors mt-2 shrink-0">
                                {/* Like Heart Icon Optional */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                            </button>
                        </div>

                        {/* Especificações - Grid Denso (Webmotors style) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-7 gap-x-4 mb-12 text-[#2e2d33]">
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">Cidade</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">
                                    {(car.municipio || 'São Paulo')} - {(car.uf || 'SP')}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">Ano</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">{car.ano_fabricacao}/{car.ano_modelo}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">KM</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">
                                    {typeof car.quilometragem === 'number' ? car.quilometragem.toLocaleString('pt-BR') : car.quilometragem}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">Câmbio</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">
                                    {car.cambio || 'Automática'}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">Carroceria</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">{car.categoria || '-'}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">Combustível</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">
                                    {car.combustivel || 'Gasolina e elétrico'}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">Final da Placa</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">5</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-[10px] mb-1.5 uppercase tracking-wider font-bold">Cor</div>
                                <div className="font-bold text-sm border-l-2 border-[var(--color-brand)] pl-3 leading-snug truncate">
                                    {car.cor || 'Branco'}
                                </div>
                            </div>
                        </div>

                        <div className="mb-0">
                            <h3 className="text-base text-gray-900 font-bold mb-3 pb-2 border-b border-gray-100">Sobre este carro</h3>
                            <p className="text-gray-500 leading-relaxed whitespace-pre-wrap text-sm">
                                {car.descricao || "Veículo em excelente estado de conservação. Em breve o lojista adicionará mais detalhes sobre este veículo."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Sticky Lead Card (29.5%) */}
                    <aside className="w-full lg:w-[29.5%] lg:max-w-[440px] lg:sticky lg:top-[100px]">
                        <div className="bg-white rounded-2xl md:shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:border border-gray-100 p-0 md:p-6 flex flex-col">

                            {/* Price Area inside Card */}
                            <div className="mb-6">
                                {(() => {
                                    const precoFinal = car.preco_promocional > 0 ? Number(car.preco_promocional) : Number(car.preco);
                                    const isAbaixoFipe = car.preco_fipe && precoFinal < Number(car.preco_fipe) && precoFinal > 0;

                                    if (car.preco_promocional > 0) {
                                        return (
                                            <div className="flex flex-col mb-2">
                                                <span className="text-[#818085] text-sm line-through decoration-gray-300 font-medium mb-1">
                                                    {formatCurrency(car.preco)}
                                                </span>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <div className="text-3xl md:text-[34px] font-bold text-[#333333] tracking-tight leading-none">
                                                        {formatCurrency(precoFinal)}
                                                    </div>
                                                    {isAbaixoFipe && (
                                                        <span className="bg-[#198b5a] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider mt-1">
                                                            ABAIXO DA FIPE
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider self-start mt-3">
                                                    Oferta Especial
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="flex items-center gap-3 flex-wrap mb-2">
                                            <div className="text-3xl md:text-[34px] font-bold text-[#333333] tracking-tight leading-none">
                                                {formatCurrency(precoFinal)}
                                            </div>
                                            {isAbaixoFipe && (
                                                <span className="bg-[#198b5a] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider mt-1">
                                                    ABAIXO DA FIPE
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            <FinancingModalClient
                                lojaId={loja.id}
                                veiculoId={car.id}
                                veiculoNome={`${car.marca} ${car.modelo}`}
                                corPrimaria={corPrimaria}
                            >
                                <button
                                    className="w-full mb-6 py-3.5 px-4 rounded-xl font-bold text-center flex items-center justify-center transition-all shadow-sm active:scale-95 text-white"
                                    style={{ backgroundColor: '#e31f24' }} // Webmotors Red Reference
                                >
                                    Ver parcelas <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><rect width="20" height="14" x="2" y="5" rx="2" ry="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                </button>
                            </FinancingModalClient>

                            <hr className="border-gray-100 mb-6 hidden md:block" />

                            <div className="mb-4 text-sm text-gray-500 font-medium pb-2 border-b border-gray-100 md:border-b-0 md:pb-0">
                                Envie uma mensagem ao vendedor
                            </div>

                            {/* Lead Form Client connected to WhatsApp and Supabase Analytics */}
                            <LeadFormClient
                                lojaId={loja.id}
                                veiculoId={car.id}
                                lojaNome={loja.nome}
                                corPrimaria={corPrimaria}
                                linkWhatsAppBase={`https://wa.me/55${rawWhatsApp}?`}
                            />
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
                basePath={basePath}
                availableCategories={Array.from(availableCategories).sort()}
                categoriaCount={categoriaCount}
            />

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
