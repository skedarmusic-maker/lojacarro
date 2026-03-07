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
import FavoriteButton from './FavoriteButton'
import { formatCurrency } from '@/lib/utils'
import { registrarPageView } from './actions/analytics'

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

    // Resgistra Analytics silencioso no Node.js
    registrarPageView(loja.id, tenantId, 'vitrine');

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
            <HeroCarousel lojaNome={loja.nome} corPrimaria={corPrimaria} banners={loja.config_visual?.banners_home} />

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
                        <div className="flex overflow-x-auto gap-4 md:gap-8 pb-4 pt-2 snap-x snap-mandatory hide-scrollbars">
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
                            <div key={car.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group flex flex-col shadow-sm">

                                {/* Thumbnail: Topo do Card (Mobile e Desktop) com proporção controlada */}
                                <div className="w-full aspect-[3/2] shrink-0 bg-gray-100 block overflow-hidden relative">
                                    <Link href={`/${tenantId}/v/${car.id}`} className="absolute inset-0 z-10">
                                        <VehicleImageSlider
                                            images={car.imagens || []}
                                            modelo={car.modelo}
                                        />
                                    </Link>
                                    <FavoriteButton carId={car.id} />
                                </div>

                                {/* Info Box: Base do Container */}
                                <div className="p-3 md:p-4 flex-1 flex flex-col">
                                    <Link href={`/${tenantId}/v/${car.id}`} className="block flex-1">
                                        {(() => {
                                            const modeloStr = car.modelo || '';
                                            const modeloParts = modeloStr.split(' ');
                                            const modeloPrincipal = modeloParts[0] || '';
                                            const modeloResto = modeloParts.slice(1).join(' ').toLowerCase();

                                            const versaoFinal = modeloResto;

                                            return (
                                                <>
                                                    {/* Linha 1: Marca + Modelo Principal */}
                                                    <h3 className="text-[17px] font-bold text-[#333333] tracking-tight leading-tight transition-colors uppercase">
                                                        {car.marca} {modeloPrincipal}
                                                    </h3>
                                                    {/* Linha 2: Versão + Dados Técnicos (Estilo Webmotors) */}
                                                    <div className="text-[13px] text-[#818085] mt-1 line-clamp-2 capitalize leading-relaxed min-h-[40px]">
                                                        {versaoFinal}
                                                    </div>
                                                </>
                                            )
                                        })()}

                                        {/* Linha 3: Ano e KM com ícones (Cinza mais claro) */}
                                        <div className="flex items-center gap-4 text-[13px] text-[#818085] mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={15} className="text-[#b1b1b4]" />
                                                <span>{car.ano_fabricacao}/{car.ano_modelo}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Gauge size={15} className="text-[#b1b1b4]" />
                                                <span>{car.quilometragem.toLocaleString('pt-BR')} Km</span>
                                            </div>
                                        </div>

                                        {/* Linha 4: Localização */}
                                        {(car.municipio || car.uf) && (
                                            <div className="flex items-center gap-1.5 text-[13px] text-[#818085] mt-2 mb-1">
                                                <MapPin size={15} className="text-[#b1b1b4]" />
                                                <span className="capitalize">{car.municipio ? `${car.municipio.toLowerCase()} ` : ''}{car.uf ? `(${car.uf.toUpperCase()})` : ''}</span>
                                            </div>
                                        )}

                                        {/* Linha 5: Preço */}
                                        {(() => {
                                            const precoFinal = car.preco_promocional > 0 ? Number(car.preco_promocional) : Number(car.preco);
                                            const isAbaixoFipe = car.preco_fipe && precoFinal < Number(car.preco_fipe) && precoFinal > 0;

                                            return (
                                                <div className="mt-4 mb-2">
                                                    {car.preco_promocional > 0 && (
                                                        <span className="text-zinc-400 text-xs font-semibold line-through block mb-0.5">
                                                            {formatCurrency(car.preco)}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <div className="text-[22px] font-bold tracking-tight text-[#333333] leading-none">
                                                            {formatCurrency(precoFinal)}
                                                        </div>
                                                        {car.preco_promocional > 0 && (
                                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                Oferta
                                                            </span>
                                                        )}
                                                        {isAbaixoFipe && (
                                                            <span className="bg-[#198b5a] text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full whitespace-nowrap hidden lg:block xl:block">
                                                                ABAIXO DA FIPE
                                                            </span>
                                                        )}
                                                        {isAbaixoFipe && (
                                                            <span className="bg-[#198b5a] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap lg:hidden xl:hidden block">
                                                                DA FIPE
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </Link>

                                    {/* Botões: Base do Card */}
                                    <div className="w-full mt-3 pt-3 border-t border-gray-100">
                                        <a
                                            href={`https://wa.me/55${loja?.dados_contato?.whatsapp ? loja.dados_contato.whatsapp.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`Olá! Vi o ${car.marca} ${car.modelo} (${car.ano_fabricacao}/${car.ano_modelo}) no site e gostaria de mais informações.`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full py-3.5 px-4 rounded-xl text-white font-semibold tracking-wide text-[15px] transition-colors flex items-center justify-center gap-2 active:scale-[0.98] bg-[#22c55e] hover:bg-[#16a34a]"
                                        >
                                            <MessageCircle size={18} className="shrink-0" />
                                            <span>Falar no WhatsApp</span>
                                        </a>
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
