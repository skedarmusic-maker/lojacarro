import Link from 'next/link'

interface StorefrontCategoriesProps {
    basePath: string
    availableCategories: string[]
    categoriaCount: Record<string, number>
    activeCategory?: string
}

export default function StorefrontCategories({ basePath, availableCategories, categoriaCount, activeCategory }: StorefrontCategoriesProps) {
    // Mock das imagens de categoria (em um projeto real poderíamos salvar no storage)
    const categoryImages: Record<string, string> = {
        'Carros elétricos': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&auto=format&fit=crop&q=60',
        'Hatches': 'https://images.unsplash.com/photo-1512749454157-550ffdae605d?w=500&auto=format&fit=crop&q=60',
        'Picapes': 'https://images.unsplash.com/photo-1559404288-66f81078d101?w=500&auto=format&fit=crop&q=60',
        'Sedans': 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&auto=format&fit=crop&q=60',
        'SUVs': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&auto=format&fit=crop&q=60',
        'Outros': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop&q=60'
    }

    if (!availableCategories || availableCategories.length === 0) {
        return null;
    }

    return (
        <section className="py-12 border-b border-gray-200 bg-gray-50">
            <div className="max-w-[1440px] mx-auto px-4 overflow-hidden">
                <h3 className="text-gray-600 font-bold mb-6">Categorias</h3>
                <div className="flex overflow-x-auto gap-4 pb-6 pt-2 snap-x snap-mandatory hide-scrollbars touch-pan-x animate-hint-swipe">
                    {availableCategories.map(categoria => (
                        <Link
                            key={categoria}
                            href={`${basePath || '/'}?cat=${encodeURIComponent(categoria)}`}
                            scroll={false}
                            className={`snap-center flex-none w-[200px] h-[200px] rounded-xl overflow-hidden relative group transition-all border-2 bg-white ${activeCategory === categoria ? 'border-[var(--color-brand)] scale-105 shadow-xl z-10' : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'}`}
                        >
                            <img
                                src={categoryImages[categoria] || categoryImages['Outros']}
                                alt={categoria}
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex items-end p-4">
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-1 group-hover:-translate-y-1 transition-transform capitalize">{categoria}</h4>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white lowercase">
                                        {categoriaCount[categoria]} veículos
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
