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

                    <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-white font-semibold">Minha Vitrine Online</h3>
                                <p className="text-zinc-400 text-sm">Links para compartilhar no Instagram ou WhatsApp.</p>
                            </div>
                            <a
                                href={loja?.custom_domain
                                    ? `https://${loja.custom_domain}`
                                    : (host.includes('hostingersite.com') || host.includes('localhost')
                                        ? `https://${host}/v/${loja?.slug}`
                                        : `https://${loja?.slug}.${host}`)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <span>Visualizar Loja</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
                            </a>
                        </div>

                        <div className="space-y-4">
                            {loja?.custom_domain && (
                                <a
                                    href={`https://${loja.custom_domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-lg block hover:bg-purple-950/30 transition-all group"
                                >
                                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mb-1">Domínio Oficial (Clique para testar)</span>
                                    <div className="flex items-center justify-between gap-2">
                                        <code className="text-purple-300 font-mono text-sm underline decoration-purple-500/30">https://{loja.custom_domain}</code>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-purple-500/20 text-purple-400 text-[9px] px-2 py-0.5 rounded">DNS CONFIGURADO</span>
                                            <svg className="text-purple-400 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
                                        </div>
                                    </div>
                                </a>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-lg">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Link Universal (Recomendado)</span>
                                    <code className="text-blue-400 font-mono text-xs break-all block mb-2">
                                        {host.includes('localhost')
                                            ? `http://localhost:3000/v/${loja?.slug}`
                                            : `https://${host}/v/${loja?.slug}`
                                        }
                                    </code>
                                    <p className="text-[10px] text-zinc-500 italic">Funciona em qualquer lugar sem erros de segurança.</p>
                                </div>

                                <div className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-lg opacity-60">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Link Subdomínio</span>
                                    <code className="text-emerald-500 font-mono text-xs break-all block mb-2">
                                        {host.includes('localhost')
                                            ? `http://${loja?.slug}.localhost:3000`
                                            : `https://${loja?.slug}.${host}`
                                        }
                                    </code>
                                    <p className="text-[10px] text-yellow-500/70">⚠️ Pode apresentar erro de SSL em domínios temporários.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    )
}
