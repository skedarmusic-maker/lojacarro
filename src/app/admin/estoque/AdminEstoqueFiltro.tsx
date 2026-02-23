'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function AdminEstoqueFiltro({
    categorias,
    counts,
    marcas,
    marcaCounts
}: {
    categorias: string[],
    counts: Record<string, number>,
    marcas: string[],
    marcaCounts: Record<string, number>
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [busca, setBusca] = useState(searchParams.get('q') || '')
    const [categoriaAtual, setCategoriaAtual] = useState(searchParams.get('cat') || '')
    const [marcaAtual, setMarcaAtual] = useState(searchParams.get('marca') || '')

    useEffect(() => {
        setBusca(searchParams.get('q') || '')
        setCategoriaAtual(searchParams.get('cat') || '')
        setMarcaAtual(searchParams.get('marca') || '')
    }, [searchParams])

    const handleFilter = () => {
        startTransition(() => {
            const params = new URLSearchParams()
            if (busca) params.set('q', busca)
            if (categoriaAtual) params.set('cat', categoriaAtual)
            if (marcaAtual) params.set('marca', marcaAtual)

            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mb-6 relative">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                    placeholder="Placa, marca, modelo..."
                    className="w-full sm:w-[250px] bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {busca && (
                    <button
                        onClick={() => {
                            setBusca('')
                            const params = new URLSearchParams(searchParams.toString())
                            params.delete('q')
                            startTransition(() => {
                                router.push(`${pathname}?${params.toString()}`, { scroll: false })
                            })
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <select
                value={categoriaAtual}
                onChange={(e) => {
                    setCategoriaAtual(e.target.value)
                    // Auto-filter on change
                    const params = new URLSearchParams(searchParams.toString())
                    if (e.target.value) params.set('cat', e.target.value)
                    else params.delete('cat')
                    startTransition(() => {
                        router.push(`${pathname}?${params.toString()}`, { scroll: false })
                    })
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
                <option value="">Todas Categorias</option>
                {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat} ({counts[cat] || 0})</option>
                ))}
            </select>

            <select
                value={marcaAtual}
                onChange={(e) => {
                    setMarcaAtual(e.target.value)
                    // Auto-filter on change
                    const params = new URLSearchParams(searchParams.toString())
                    if (e.target.value) params.set('marca', e.target.value)
                    else params.delete('marca')
                    startTransition(() => {
                        router.push(`${pathname}?${params.toString()}`, { scroll: false })
                    })
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
                <option value="">Todas Marcas</option>
                {marcas.map(marca => (
                    <option key={marca} value={marca}>{marca} ({marcaCounts[marca] || 0})</option>
                ))}
            </select>

            <button
                onClick={handleFilter}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg border border-emerald-500 transition-colors flex items-center justify-center font-bold"
            >
                {isPending ? 'Buscando...' : 'Filtrar'}
            </button>
        </div>
    )
}
