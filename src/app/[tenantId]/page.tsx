import { createClient } from '@/lib/supabase/server'
import { notFound } from "next/navigation"
import Link from 'next/link'
import { headers } from 'next/headers'
import { Calendar, MapPin, Gauge, MessageCircle, X } from 'lucide-react'

import StorefrontHeader from './StorefrontHeader'

import StorefrontFilters from './StorefrontFilters'
import HeroCarousel from './HeroCarousel'
import VehicleImageSlider from './VehicleImageSlider'
import StorefrontFooter from './StorefrontFooter'
import StorefrontCategories from './StorefrontCategories'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type TenantPageProps = {
    params: Promise<{ tenantId: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TenantShowroom({ params, searchParams }: TenantPageProps) {
    const { tenantId } = await params
    const resolvedSearchParams = await searchParams

    const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : ''
    const cat = typeof resolvedSearchParams.cat === 'string' ? resolvedSearchParams.cat : ''
    const marca = typeof resolvedSearchParams.marca === 'string' ? resolvedSearchParams.marca : ''
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'marca-modelo'

    const headersList = await headers()
    const basePath = headersList.get('x-base-path') || ''

    if (!tenantId || tenantId === 'favicon.ico') {
        notFound()
    }

    const supabase = await createClient()

    // 1. Busca os dados da loja pelo SLUG ou CUSTOM_DOMAIN
    const { data: loja } = await supabase
        .from('perfis_lojas')
        .select('*')
        .or(`slug.eq.${tenantId},custom_domain.eq.${tenantId}`)
        .single()

    if (!loja) {
        notFound()
    }

    // 2. Busca TODOS os Veículos associados àquela loja para contagem e extração de categorias
    const { data: todosVeiculos } = await supabase
        .from('veiculos')
        .select('marca, modelo, cor, categoria')
        .eq('loja_id', loja.id)
        .eq('status', 'disponivel')

    // Contagem de categorias e marcas para os filtros
    const categoriaCount: Record<string, number> = {}
    const marcaCount: Record<string, number> = {}
    const availableCategories = new Set<string>()
    const availableMarcas = new Set<string>()

    todosVeiculos?.forEach(v => {
        const c = v.categoria || 'Outros'
        const m = v.marca || 'Outros'

        categoriaCount[c] = (categoriaCount[c] || 0) + 1
        marcaCount[m] = (marcaCount[m] || 0) + 1

        availableCategories.add(c)
        if (v.marca) availableMarcas.add(m)
    })

    // 3. Aplica filtros na Query principal
    let query = supabase
        .from('veiculos')
        .select('*')
        .eq('loja_id', loja.id)
        .eq('status', 'disponivel')

    // Aplicar Filtros Básicos
    if (cat) query = query.eq('categoria', cat)
    if (marca) query = query.ilike('marca', marca)
    if (q) query = query.or(`marca.ilike.%${q}%,modelo.ilike.%${q}%,cor.ilike.%${q}%`)

    // Executa a query sem ordenação via banco AINDA para evitar conflitos na ORM
    const { data: veiculos_brutos } = await query

    // 4. Ordenação Customizada em Memória (Mais flexível para lógicas complexas e preco_promocional)
    let veiculos = veiculos_brutos || []

    veiculos.sort((a, b) => {
        const precoA = a.preco_promocional > 0 ? Number(a.preco_promocional) : Number(a.preco)
        const precoB = b.preco_promocional > 0 ? Number(b.preco_promocional) : Number(b.preco)

        switch (sort) {
            case 'preco-asc':
                return precoA - precoB
            case 'preco-desc':
                return precoB - precoA
            case 'ano-desc':
                return Number(b.ano_modelo) - Number(a.ano_modelo)
            case 'marca-modelo':
            default:
                // Sort by Marca then Modelo
                const marcaCompare = (a.marca || '').localeCompare(b.marca || '')
                if (marcaCompare !== 0) return marcaCompare
                return (a.modelo || '').localeCompare(b.modelo || '')
        }
    })

    const corPrimaria = loja.config_visual?.cor_primaria || '#3b82f6'



    // Array estático de logos suportados em /public/images/
    const supportedBrandLogos = [
        'audi', 'bmw', 'byd', 'chevrolet', 'citroen', 'fiat', 'ford', 'honda', 'hyundai',
        'jeep', 'kia', 'mitsubishi', 'nissan', 'peugeot', 'renault', 'suzuki', 'toyota', 'volkswagen'
    ]

    // Pega as marcas ativas no estoque que também possem suas respectivas logos (case-insensitive)
    const activeBrandLogos = Array.from(availableMarcas).filter(m =>
        supportedBrandLogos.includes(m.toLowerCase())
    ).sort()

    return (
        <div
            className="min-h-screen bg-gray-50 text-gray-900 font-sans"
            style={{
                "--color-brand": corPrimaria,
            } as React.CSSProperties}
        >
            <StorefrontHeader
                nome={loja.nome}
                logo_url={loja.config_visual?.logo_url}
                cor_primaria={corPrimaria}
                basePath={basePath}
                activePath="estoque"
            />

            {/* Hero Banner Dinâmico Premium */}
            <HeroCarousel lojaNome={loja.nome} corPrimaria={corPrimaria} />

            {/* Descubra por Marca Section */}
            {activeBrandLogos.length > 0 && (
                <section className="py-10 border-b border-gray-200 bg-white">
                    <div className="max-w-7xl mx-auto px-4 overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-gray-900 font-bold text-xl">Descubra por marca</h3>
                            {marca && (
                                <Link
                                    href="?"
                                    scroll={false}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full border border-gray-200 transition-all shadow-sm active:scale-95 group"
                                >
                                    <span>Marca: {marca}</span>
                                    <X size={14} className="text-gray-400 group-hover:text-gray-600" />
                                </Link>
                            )}
                        </div>
                        <div className="flex overflow-x-auto gap-4 md:gap-8 pb-4 pt-2 snap-x snap-mandatory hide-scrollbars touch-pan-x">
                            {activeBrandLogos.map(m => (
                                <Link
                                    key={m}
                                    href={`?marca=${encodeURIComponent(m)}`}
                                    scroll={false}
                                    className={`snap-center flex-none w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border ${marca === m ? 'border-[var(--color-brand)] shadow-md scale-105' : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'} flex items-center justify-center p-4 transition-all group`}
                                >
                                    <img
                                        src={`/images/logo-${m.toLowerCase()}.webp`}
                                        alt={`Logo ${m}`}
                                        className={`w-full h-full object-contain transition-all ${marca === m ? 'grayscale-0 opacity-100' : 'filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Visual Categories Section */}
            <StorefrontCategories
                basePath={basePath}
                availableCategories={Array.from(availableCategories).sort()}
                categoriaCount={categoriaCount}
                activeCategory={cat}
            />

            {/* Filtros Livres e Interativos (Vitrine Frontend) - Sticky Header Dinâmico */}
            <section id="estoque" className="py-3 md:py-4 border-b border-gray-200 bg-white sticky top-20 z-40 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4">
                    <StorefrontFilters
                        corPrimaria={corPrimaria}
                        categorias={Array.from(availableCategories).sort()}
                        counts={categoriaCount}
                        marcas={Array.from(availableMarcas).sort()}
                        marcaCounts={marcaCount}
                        totalVeiculos={veiculos?.length || 0}
                    />
                </div>
            </section>

            <section className="py-16 max-w-7xl mx-auto px-4">
                {!veiculos || veiculos.length === 0 ? (
                    <div className="text-center py-20 bg-white shadow-sm rounded-2xl border border-gray-200">
                        <div className="text-4xl mb-4">🛣️</div>
                        <h3 className="text-xl font-bold mb-2">Estoque Vazio</h3>
                        <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {veiculos.map((car: any) => (
                            <div key={car.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group flex flex-row md:flex-col shadow-sm">

                                {/* Thumbnail: Pequena na esquerda (Mobile) / Larga no topo (Desktop) */}
                                <Link href={`/${tenantId}/v/${car.id}`} className="w-[130px] md:w-full h-auto min-h-[140px] md:aspect-[4/3] shrink-0 bg-gray-100 block overflow-hidden relative">
                                    <div className="absolute inset-0">
                                        <VehicleImageSlider
                                            images={car.imagens || []}
                                            modelo={car.modelo}
                                        />
                                    </div>
                                </Link>

                                {/* Info Box: Direita (Mobile) / Embaixo (Desktop) */}
                                <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <Link href={`/${tenantId}/v/${car.id}`} className="flex-1">
                                                <div className="text-[10px] md:text-sm font-bold tracking-widest text-gray-400 uppercase mb-0.5">{car.marca}</div>
                                                <h3 className="text-sm md:text-xl font-bold text-gray-900 leading-tight group-hover:text-[var(--color-brand)] transition-colors line-clamp-2 md:mb-2">{car.modelo}</h3>
                                                <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 line-clamp-1 hidden md:block">{car.categoria ? `Categoria: ${car.categoria}` : car.status}</p>
                                            </Link>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-y-1 md:gap-y-2 gap-x-2 md:gap-x-4 text-[10px] md:text-sm font-semibold text-gray-500 mt-2 md:mt-4 mb-2 md:mb-6">
                                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> {car.ano_fabricacao}/{car.ano_modelo}</div>
                                            <div className="flex items-center gap-1.5"><Gauge size={14} className="text-gray-400" /> {car.quilometragem.toLocaleString('pt-BR')} km</div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-2 md:pt-4 flex flex-col md:flex-col justify-between gap-2 md:gap-4 border-t border-gray-100">
                                        <Link href={`/${tenantId}/v/${car.id}`}>
                                            {car.preco_promocional > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs line-through decoration-gray-300 block mb-0.5">
                                                        R$ {Number(car.preco).toLocaleString('pt-BR')}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-base md:text-2xl font-black" style={{ color: "var(--color-brand)" }}>
                                                            R$ {Number(car.preco_promocional).toLocaleString('pt-BR')}
                                                        </div>
                                                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                            Oferta
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-base md:text-2xl font-black" style={{ color: "var(--color-brand)" }}>
                                                    R$ {Number(car.preco).toLocaleString('pt-BR')}
                                                </div>
                                            )}
                                        </Link>

                                        {/* Botões: Lado-a-lado Mobile e Desktop */}
                                        <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full mt-2">
                                            <button className="py-2 px-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-bold text-[10px] md:text-xs hover:bg-gray-100 transition-colors flex items-center justify-center truncate">
                                                <span className="hidden md:inline">Ver parcelas</span>
                                                <span className="md:hidden">Financiar</span>
                                            </button>
                                            <a
                                                href={`https://wa.me/55${loja?.dados_contato?.whatsapp ? loja.dados_contato.whatsapp.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`Olá! Vi o ${car.marca} ${car.modelo} (${car.ano_fabricacao}/${car.ano_modelo}) no site e gostaria de mais informações.`)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="py-2 px-1 rounded-lg text-white font-bold text-[10px] md:text-xs transition-colors flex items-center justify-center gap-1.5 truncate shadow-sm hover:shadow"
                                                style={{ backgroundColor: "var(--color-brand)" }}
                                            >
                                                <MessageCircle size={14} className="shrink-0" />
                                                <span className="truncate">Vendedor</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

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
