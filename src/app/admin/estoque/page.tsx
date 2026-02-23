import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import VeiculoFormClient from './VeiculoFormClient'
import AdminEstoqueFiltro from './AdminEstoqueFiltro'
import AdminVeiculoCard from './AdminVeiculoCard'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EstoquePage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams
    const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : ''
    const cat = typeof resolvedSearchParams.cat === 'string' ? resolvedSearchParams.cat : ''
    const marca = typeof resolvedSearchParams.marca === 'string' ? resolvedSearchParams.marca : ''
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    let { data: loja } = await supabase
        .from('perfis_lojas')
        .select('id, nome, slug')
        .eq('user_id', user?.id)
        .maybeSingle()

    if (!loja && user?.email) {
        const defaultSlug = user.email.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000)
        const { data: novaLoja } = await supabase.from('perfis_lojas').insert({
            user_id: user.id,
            nome: 'Minha Loja',
            slug: defaultSlug
        }).select().single()
        loja = novaLoja
    }

    // Busca TODOS os veículos para montar os filtros adequadamente:
    const { data: todosVeiculos } = await supabase
        .from('veiculos')
        .select('marca, categoria')
        .eq('loja_id', loja?.id)

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

    let query = supabase
        .from('veiculos')
        .select('*')
        .eq('loja_id', loja?.id)
        .order('created_at', { ascending: false })

    if (cat) {
        query = query.eq('categoria', cat)
    }

    if (marca) {
        query = query.ilike('marca', marca)
    }

    if (q) {
        query = query.or(`marca.ilike.%${q}%,modelo.ilike.%${q}%,placa.ilike.%${q}%`)
    }

    const { data: veiculos } = await query


    // Action CRUD Deletar
    async function deleteVeiculo(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        if (!id) return
        const supabase = await createClient()
        // O RLS do Supabase garante que mesmo recebendo só ID,
        // ele só vai apagar se a linha pertencer à loja do Lojista Logado.
        await supabase.from('veiculos').delete().eq('id', id)
        revalidatePath('/admin/estoque')
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex text-sm">
            {/* Sidebar (Simplificada aqui para MVP, idealmente movida pro layout.tsx dps) */}
            <aside className="w-64 border-r border-zinc-800 bg-[#0f0f0f] hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="font-bold text-lg">Menu Admin</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"> Visão Geral </a>
                    <a href="/admin/estoque" className="block px-4 py-2.5 bg-zinc-800 text-white rounded-md font-medium"> Meu Estoque </a>
                    <a href="/admin/config" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"> Configurações </a>
                    <a
                        href={`https://wa.me/5511965843545?text=${encodeURIComponent(`Olá! Sou da loja ${loja?.nome} (slug: ${loja?.slug}) e preciso de suporte no Painel Admin.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"
                    >
                        Suporte
                    </a>
                </nav>
            </aside>

            <main className="flex-1 overflow-auto">
                <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between px-8 sticky top-0 backdrop-blur-md">
                    <h1 className="text-xl font-semibold">Meu Estoque</h1>
                    <button
                        className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-zinc-200"
                    // Em um app real abririamos um Dialog/Modal, aqui faremos um scroll ou display da sessao
                    >
                        Novo Veículo
                    </button>
                </header>

                <div className="p-8 max-w-5xl">

                    {/* Form de Cadastro Rapido */}
                    <VeiculoFormClient />

                    {/* Lista de Cadastro */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Veículos Cadastrados ({veiculos?.length || 0})</h2>
                    </div>

                    <AdminEstoqueFiltro
                        categorias={Array.from(availableCategories).sort()}
                        counts={categoriaCount}
                        marcas={Array.from(availableMarcas).sort()}
                        marcaCounts={marcaCount}
                    />

                    {veiculos?.length === 0 ? (
                        <div className="text-center py-12 border border-zinc-800 border-dashed rounded-xl text-zinc-500">
                            Nenhum veículo encontrado no seu estoque.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {veiculos?.map(v => (
                                <AdminVeiculoCard key={v.id} veiculo={v} lojaId={loja?.id} />
                            ))}
                        </div>
                    )}

                </div>
            </main>
        </div>
    )
}
