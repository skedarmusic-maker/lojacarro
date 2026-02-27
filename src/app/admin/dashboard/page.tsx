import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export default async function AdminDashboard() {
    const supabase = await createClient()
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'

    // Middleware já nos protegeu, mas garantimos os dados do User aqui
    const { data: { user } } = await supabase.auth.getUser()

    // Pegar dados da Loja desse usuário
    let { data: loja } = await supabase
        .from('perfis_lojas')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

    // Auto-recuperação: Se a loja não existir (ex: erro no cadastro anterior), nós criamos agora!
    if (!loja && user?.email) {
        const defaultSlug = user.email.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000)
        const { data: novaLoja } = await supabase.from('perfis_lojas').insert({
            user_id: user.id,
            nome: 'Minha Loja',
            slug: defaultSlug
        }).select().single()
        loja = novaLoja
    }

    // Action local para Logout
    async function signOut() {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        revalidatePath('/', 'layout')
        redirect('/admin/login')
    }

    // Buscar total de veículos
    const { count: totalVeiculos } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('loja_id', loja?.id)

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex text-sm">

            {/* Sidebar Lateral (Mobile-first adaptável dps) */}
            <aside className="w-64 border-r border-zinc-800 bg-[#0f0f0f] hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="font-bold text-lg">{loja?.nome || 'Carregando Loja...'}</h2>
                    <p className="text-zinc-500 text-xs mt-1">Painel Administrativo</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="block px-4 py-2.5 bg-zinc-800 text-white rounded-md font-medium">
                        Visão Geral
                    </a>
                    <a href="/admin/estoque" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors">
                        Meu Estoque
                    </a>
                    <a href="/admin/config" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors">
                        Configurações da Loja
                    </a>
                    <a
                        href={`https://wa.me/5511965843545?text=${encodeURIComponent(`Olá! Sou da loja ${loja?.nome} (slug: ${loja?.slug}) e preciso de suporte no Painel Admin.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"
                    >
                        Suporte
                    </a>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <form action={signOut}>
                        <button className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md font-medium transition-colors">
                            Sair do Sistema
                        </button>
                    </form>
                </div>
            </aside>

            {/* Area Principal */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 flex items-center px-8 sticky top-0 backdrop-blur-md">
                    <h1 className="text-xl font-semibold">Visão Geral</h1>
                </header>

                <div className="p-8 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Cards de Estatísticas */}
                        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-zinc-400 font-medium mb-2">Veículos no Estoque</h3>
                            <p className="text-4xl font-black">{totalVeiculos || 0}</p>
                        </div>
                        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-zinc-400 font-medium mb-2">Acessos à Vitrine</h3>
                            <p className="text-4xl font-black">0</p>
                        </div>
                        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-zinc-400 font-medium mb-2">Leads Recebidos</h3>
                            <p className="text-4xl font-black">0</p>
                        </div>
                    </div>

                    {(!totalVeiculos || totalVeiculos === 0) ? (
                        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800 text-2xl">
                                🚗
                            </div>
                            <h2 className="text-xl font-bold mb-2">Seu estoque está vazio</h2>
                            <p className="text-zinc-400 mb-6">
                                Adicione seu primeiro veículo agora mesmo para ele aparecer instantaneamente na sua vitrine pública.
                            </p>
                            <a href="/admin/estoque" className="inline-block bg-white text-black px-6 py-2.5 rounded-md font-medium hover:bg-zinc-200 transition-colors">
                                + Adicionar Novo Veículo
                            </a>
                        </div>
                    ) : (
                        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-8 mt-12 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-1">Seu estoque está ativo!</h2>
                                <p className="text-zinc-400">Você tem {totalVeiculos} veículos cadastrados e visíveis.</p>
                            </div>
                            <a href="/admin/estoque" className="bg-zinc-800 text-white px-6 py-2.5 rounded-md font-medium hover:bg-zinc-700 transition-colors">
                                Gerenciar Estoque
                            </a>
                        </div>
                    )}

                    <div className="mt-12 p-6 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                        <h3 className="text-emerald-500 font-semibold mb-2">Links da Vitrine</h3>
                        <p className="text-zinc-300 text-sm mb-4">Compartilhe estes links com seus clientes no Instagram ou WhatsApp.</p>

                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-zinc-500 block mb-1">Via Subdomínio (Elegante)</span>
                                <code className="bg-black border border-emerald-900 px-4 py-2 rounded text-emerald-400 block break-all">
                                    {host.includes('localhost')
                                        ? `http://${loja?.slug}.localhost:3000`
                                        : `https://${loja?.slug}.${host}`
                                    }
                                </code>
                            </div>
                            <div>
                                <span className="text-xs text-zinc-500 block mb-1">Via Caminho (Universal / Sem erro de DNS)</span>
                                <code className="bg-black border border-zinc-800 px-4 py-2 rounded text-blue-400 block break-all">
                                    {host.includes('localhost')
                                        ? `http://localhost:3000/v/${loja?.slug}`
                                        : `https://${host}/v/${loja?.slug}`
                                    }
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    )
}
