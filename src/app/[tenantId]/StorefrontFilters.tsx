'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'

export default function StorefrontFilters({
    corPrimaria,
    categorias,
    counts,
    marcas,
    marcaCounts,
    totalVeiculos
}: {
    corPrimaria: string,
    categorias: string[],
    counts: Record<string, number>,
    marcas?: string[],
    marcaCounts?: Record<string, number>,
    totalVeiculos: number
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // State inicial baseado na URL
    const [busca, setBusca] = useState(searchParams.get('q') || '')
    const [categoriaAtual, setCategoriaAtual] = useState(searchParams.get('cat') || '')
    const [marcaAtual, setMarcaAtual] = useState(searchParams.get('marca') || '')
    const [ordemAtual, setOrdemAtual] = useState(searchParams.get('sort') || 'marca-modelo')

    // Estado da Sanfona (Accordion)
    const [isExpanded, setIsExpanded] = useState(true)

    // Ref para ignorar scroll automático por um tempo após clique manual
    const skipAutoScrollRef = useState<{ timeout: NodeJS.Timeout | null }>({ timeout: null })[0]

    // Sincronizar estado caso mude pela URL (ex: ao clicar nos botões de categoria acima)
    useEffect(() => {
        setBusca(searchParams.get('q') || '')
        setCategoriaAtual(searchParams.get('cat') || '')
        setMarcaAtual(searchParams.get('marca') || '')
        setOrdemAtual(searchParams.get('sort') || 'marca-modelo')
    }, [searchParams])

    // Efeito para Recolher Automaticamente ao scrolar para baixo
    useEffect(() => {
        let lastScrollY = window.scrollY

        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Se o usuário interagiu manualmente e o timeout ainda existe, ignora o scroll
            if (skipAutoScrollRef.timeout) {
                lastScrollY = currentScrollY
                return
            }

            // Se rolar pra baixo além de 200px, recolhe os filtros
            if (currentScrollY > 200 && currentScrollY > lastScrollY + 10) {
                setIsExpanded(false)
            }

            // Se voltar ao topo quase totalmente, expande novamente
            if (currentScrollY < 100) {
                setIsExpanded(true)
            }

            lastScrollY = currentScrollY > 0 ? currentScrollY : 0
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (skipAutoScrollRef.timeout) clearTimeout(skipAutoScrollRef.timeout)
        }
    }, [])

    const toggleManual = () => {
        setIsExpanded(prev => !prev)

        // Bloqueia a interferência do scroll por 3 segundos após o clique
        if (skipAutoScrollRef.timeout) clearTimeout(skipAutoScrollRef.timeout)
        skipAutoScrollRef.timeout = setTimeout(() => {
            skipAutoScrollRef.timeout = null
        }, 3000)
    }

    const handleFilter = () => {
        startTransition(() => {
            const params = new URLSearchParams()
            if (busca) params.set('q', busca)
            if (categoriaAtual) params.set('cat', categoriaAtual)
            if (marcaAtual) params.set('marca', marcaAtual)
            if (ordemAtual && ordemAtual !== 'marca-modelo') params.set('sort', ordemAtual)

            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const clearFilters = () => {
        setBusca('')
        setCategoriaAtual('')
        setMarcaAtual('')
        setOrdemAtual('marca-modelo')
        startTransition(() => {
            router.push(pathname, { scroll: false })
        })
    }

    const hasFilters = busca || categoriaAtual || marcaAtual

    return (
        <div className="flex flex-col w-full">
            {/* Header da Sanfona (Sempre Visível) */}
            <div className="flex items-center justify-between w-full">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 group flex items-center gap-2 cursor-pointer" onClick={toggleManual}>
                    {totalVeiculos === 1 ? '1 Veículo' : `${totalVeiculos} Veículos`}
                    {!isExpanded && hasFilters && (
                        <span className="hidden md:inline-flex ml-2 items-center justify-center bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                            Filtros Ativos
                        </span>
                    )}
                </h2>

                <button
                    onClick={toggleManual}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm active:scale-95"
                >
                    <SlidersHorizontal size={16} className="text-[var(--color-brand)]" />
                    <span className="hidden sm:inline">Filtros</span>
                    <span className="w-5 flex justify-center">
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </span>
                </button>
            </div>

            {/* Corpo da Sanfona (Oculto ao scrolar) */}
            <div
                className={`flex flex-col transform transition-all duration-300 ease-in-out overflow-hidden origin-top ${isExpanded ? 'max-h-[800px] opacity-100 mt-4 scale-y-100' : 'max-h-0 opacity-0 mt-0 scale-y-95 pointer-events-none'}`}
            >
                <div className="flex flex-col gap-4 pb-2">
                    {/* Linha de Busca e Seletores Principais */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Buscar modelo, marca, cor..."
                            className="bg-white border border-gray-300 rounded-md px-4 py-3 sm:py-2 flex-1 text-gray-900 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
                        />

                        <select
                            value={categoriaAtual}
                            onChange={(e) => setCategoriaAtual(e.target.value)}
                            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                        >
                            <option value="">Todas as Categorias</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat} ({counts[cat] || 0})</option>
                            ))}
                        </select>

                        {marcas && marcas.length > 0 && (
                            <select
                                value={marcaAtual}
                                onChange={(e) => setMarcaAtual(e.target.value)}
                                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
                            >
                                <option value="">Todas as Marcas</option>
                                {marcas.map(marca => (
                                    <option key={marca} value={marca}>{marca} ({marcaCounts?.[marca] || 0})</option>
                                ))}
                            </select>
                        )}

                        <button
                            onClick={handleFilter}
                            disabled={isPending}
                            className="px-6 py-2 rounded-md font-medium whitespace-nowrap transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center min-w-[100px]"
                            style={{ backgroundColor: "var(--color-brand)", color: "#fff" }}
                        >
                            {isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Filtrar'}
                        </button>
                    </div>

                    {/* Linha de Ordenação e Feedback de Filtros Ativos */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mt-2">

                        {/* Ordenação (Match com o Layout do Print) */}
                        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-md px-4 py-2 w-full sm:w-auto">
                            <span className="text-sm font-bold text-gray-500 shrink-0">Ordenar Por:</span>
                            <select
                                value={ordemAtual}
                                onChange={(e) => {
                                    setOrdemAtual(e.target.value)
                                    // Auto-filtrar ao trocar a ordem (UX)
                                    startTransition(() => {
                                        const params = new URLSearchParams()
                                        if (busca) params.set('q', busca)
                                        if (categoriaAtual) params.set('cat', categoriaAtual)
                                        if (marcaAtual) params.set('marca', marcaAtual)
                                        if (e.target.value && e.target.value !== 'marca-modelo') params.set('sort', e.target.value)

                                        router.push(`${pathname}?${params.toString()}`, { scroll: false })
                                    })
                                }}
                                className="bg-transparent text-sm text-gray-900 focus:outline-none w-full appearance-none cursor-pointer"
                                style={{ color: "var(--color-brand)" }}
                            >
                                <option value="marca-modelo" className="bg-white text-gray-900">Marca e Modelo</option>
                                <option value="preco-asc" className="bg-white text-gray-900">Menor Preço</option>
                                <option value="preco-desc" className="bg-white text-gray-900">Maior Preço</option>
                                <option value="ano-desc" className="bg-white text-gray-900">Mais Novos</option>
                            </select>
                        </div>
                        {hasFilters && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Filtros ativos:</span>
                                {busca && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-300">Busca: {busca}</span>}
                                {categoriaAtual && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-300">Categoria: {categoriaAtual}</span>}
                                {marcaAtual && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-300">Marca: {marcaAtual}</span>}
                                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 ml-2 font-bold transition-colors">
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
