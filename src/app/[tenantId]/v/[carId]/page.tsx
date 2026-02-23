import { createClient } from '@/lib/supabase/server'
import { notFound } from "next/navigation"
import type { Metadata, ResolvingMetadata } from 'next'
import { Phone, MessageCircle } from 'lucide-react'
import StorefrontFooter from '../../StorefrontFooter'
import FinancingModalClient from './FinancingModalClient'

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

// 2. Renderização da Página do Carro (Server Side)
export default async function DetalhesVeiculoPage({ params }: CarPageProps) {
    const { tenantId, carId } = await params
    const supabase = await createClient()

    const { data: loja } = await supabase.from('perfis_lojas').select('*').or(`slug.eq.${tenantId},custom_domain.eq.${tenantId}`).single()
    const { data: car } = await supabase.from('veiculos').select('*').eq('id', carId).single()

    if (!loja || !car) notFound()

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
                        <a href="/" style={{ color: "var(--color-brand)" }}>{loja.nome}</a>
                    </div>
                    <nav className="hidden md:flex gap-6 font-medium text-gray-600">
                        <a href="/" className="hover:text-gray-900 transition-colors">Estoque</a>
                        <a href="/sobre" className="hover:text-gray-900 transition-colors">Sobre Nós</a>
                        <a href="/localizacao" className="hover:text-gray-900 transition-colors">Localização</a>
                        <a href="/contato" className="hover:text-gray-900 transition-colors">Contato</a>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 pb-24 md:pb-12 md:py-12 md:px-4">

                {/* Lado Esquerdo - Galeria (Edge to edge no mobile) */}
                <div className="w-full relative">
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbars md:rounded-xl md:border md:border-gray-200 bg-gray-100 aspect-[4/3] lg:aspect-auto h-[350px] lg:h-[500px]">
                        {car.imagens && car.imagens.length > 0 ? (
                            car.imagens.map((imgUrl: string, idx: number) => (
                                <div key={idx} className="shrink-0 w-full h-full snap-start relative">
                                    <img src={imgUrl} alt={`${car.modelo} - Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                    {/* Indicador de fotos estilo mobile */}
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 md:hidden">
                                        {car.imagens.map((_: any, dotIdx: number) => (
                                            <div key={dotIdx} className={`w-1.5 h-1.5 rounded-full ${idx === dotIdx ? 'bg-white scale-125 shadow-sm' : 'bg-white/50'}`} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium w-full h-full">
                                Sem fotos
                            </div>
                        )}
                    </div>

                    {/* Grid de miniaturas para Desktop */}
                    {car.imagens?.length > 1 && (
                        <div className="hidden md:grid grid-cols-4 gap-4 mt-4">
                            {car.imagens.map((imgUrl: string, idx: number) => (
                                <div key={idx} className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors">
                                    <img src={imgUrl} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lado Direito - Infos (Com padding no mobile) */}
                <div className="px-4 py-6 md:px-0 md:py-0">
                    <div className="mb-6 md:mb-8 border-b border-gray-200 pb-6 md:pb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl md:text-4xl font-black uppercase text-gray-500">{car.marca}</h1>
                            <h2 className="text-2xl md:text-4xl font-black text-[var(--color-brand)]">{car.modelo}</h2>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-6 uppercase tracking-wide">
                            {car.categoria ? `${car.categoria} AUTOMÁTICO` : 'VERSÃO NÃO INFORMADA'} {/* Placeholder para versão */}
                        </p>
                        {car.preco_promocional > 0 ? (
                            <div className="flex flex-col mb-4">
                                <span className="text-gray-400 text-lg line-through decoration-gray-300 font-bold mb-1">
                                    R$ {Number(car.preco).toLocaleString('pt-BR')}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl md:text-5xl font-black text-gray-900">
                                        R$ {Number(car.preco_promocional).toLocaleString('pt-BR')}
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                        Oferta
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                R$ {Number(car.preco).toLocaleString('pt-BR')}
                            </div>
                        )}

                        {/* Desktop CTA (Mobile CTA is sticky at bottom) */}
                        <div className="hidden md:flex gap-4">
                            <FinancingModalClient
                                lojaId={loja.id}
                                veiculoId={car.id}
                                veiculoNome={`${car.marca} ${car.modelo}`}
                                corPrimaria={corPrimaria}
                            >
                                <button className="flex-1 py-3 px-6 rounded-lg font-bold text-center flex items-center justify-center transition-colors border-2 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white">
                                    Simular Financiamento
                                </button>
                            </FinancingModalClient>
                            <a
                                href={linkWhatsApp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 px-6 rounded-lg font-bold text-white text-center flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: "var(--color-brand)" }}
                            >
                                Falar com Vendedor
                            </a>
                        </div>
                    </div>

                    {/* Especificações - Grid Denso (Webmotors style) */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
                        <div>
                            <div className="text-gray-500 text-xs md:text-sm mb-1">Cidade</div>
                            <div className="font-bold text-sm md:text-base text-gray-900">São Paulo - SP</div> {/* Placeholder */}
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs md:text-sm mb-1">Ano</div>
                            <div className="font-bold text-sm md:text-base text-gray-900">{car.ano_fabricacao}/{car.ano_modelo}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs md:text-sm mb-1">KM</div>
                            <div className="font-bold text-sm md:text-base text-gray-900">{car.quilometragem.toLocaleString('pt-BR')}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs md:text-sm mb-1">Câmbio</div>
                            <div className="font-bold text-sm md:text-base text-gray-900">Automática</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs md:text-sm mb-1">Carroceria</div>
                            <div className="font-bold text-sm md:text-base text-gray-900">{car.categoria || '-'}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs md:text-sm mb-1">Combustível</div>
                            <div className="font-bold text-sm md:text-base text-gray-900">Gasolina e elétrico</div> {/* Placeholder */}
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs md:text-sm mb-1">Cor</div>
                            <div className="font-bold text-sm md:text-base text-gray-900">{car.cor || '-'}</div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-xl text-gray-900 font-bold mb-4">Sobre este carro</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                            {car.descricao || "Veículo em excelente estado de conservação. Em breve o lojista adicionará mais detalhes sobre este veículo."}
                        </p>
                    </div>
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

            <StorefrontFooter
                lojaNome={loja.nome}
                logoUrl={loja.config_visual?.logo_url || ''}
                corPrimaria={corPrimaria}
                contato={loja.dados_contato || {}}
            />
        </div>
    )
}
