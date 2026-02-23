import { createClient } from '@/lib/supabase/server'
import { toggleLojaStatus } from './actions'

export default async function SuperAdminDashboard() {
    const supabase = await createClient()

    // 1. Buscar todas as lojas
    const { data: lojas } = await supabase
        .from('perfis_lojas')
        .select('*')
        .order('created_at', { ascending: false })

    // 2. Buscar contagem de veículos
    // Nota: Em produção pesada, usaríamos um count de verdade ou store de cache.
    const { data: veiculosData } = await supabase
        .from('veiculos')
        .select('loja_id')

    const veiculosPorLoja = veiculosData?.reduce((acc: any, v: any) => {
        acc[v.loja_id] = (acc[v.loja_id] || 0) + 1
        return acc
    }, {}) || {}

    const totalLojas = lojas?.length || 0
    const lojasAtivas = lojas?.filter(l => l.ativo).length || 0
    const totalVeiculos = veiculosData?.length || 0

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black mb-2">Visão Geral da Plataforma</h1>
                <p className="text-zinc-500">Acompanhe e gerencie todos os lojistas cadastrados em seu SaaS.</p>
            </header>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <div className="text-zinc-400 text-sm font-medium mb-1">Total de Lojas</div>
                    <div className="text-3xl font-bold text-white">{totalLojas}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
                    <div className="text-zinc-400 text-sm font-medium mb-1">Lojas Ativas</div>
                    <div className="text-3xl font-bold text-emerald-400">{lojasAtivas}</div>
                    <div className="absolute -right-4 -bottom-4 text-emerald-500/10 font-black text-6xl">
                        ON
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <div className="text-zinc-400 text-sm font-medium mb-1">Total de Veículos</div>
                    <div className="text-3xl font-bold text-white">{totalVeiculos} <span className="text-sm font-normal text-zinc-500 ml-1">cadastrados</span></div>
                </div>
            </div>

            {/* Tabela de Lojistas */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 bg-[#121212] flex justify-between items-center">
                    <h2 className="font-bold text-lg">Gerenciamento de Assinantes</h2>
                    {/* Placeholder search / filters */}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium border-b border-zinc-800">Loja</th>
                                <th className="p-4 font-medium border-b border-zinc-800">Slug / Domínio</th>
                                <th className="p-4 font-medium border-b border-zinc-800">Veículos</th>
                                <th className="p-4 font-medium border-b border-zinc-800">Dono da Plataforma</th>
                                <th className="p-4 font-medium border-b border-zinc-800 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {lojas?.map(loja => (
                                <tr key={loja.id} className="hover:bg-zinc-800/20 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{loja.nome}</div>
                                        <div className="text-xs text-zinc-500 truncate w-32" title={loja.id}>ID: ...{loja.id.slice(-8)}</div>
                                    </td>
                                    <td className="p-4">
                                        <a href={`http://${loja.slug}.localhost:3000`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                            {loja.slug}
                                        </a>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-zinc-800 text-zinc-300 py-1 px-3 rounded-full text-xs font-bold">
                                            {veiculosPorLoja[loja.id] || 0}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {loja.is_super_admin ? (
                                            <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 uppercase">Super Admin</span>
                                        ) : (
                                            <span className="text-xs text-zinc-500 font-medium">Lojista Comum</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <form action={toggleLojaStatus} className="flex justify-center">
                                            <input type="hidden" name="lojaId" value={loja.id} />
                                            <input type="hidden" name="currentState" value={String(loja.ativo)} />
                                            <button
                                                type="submit"
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${loja.ativo
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                                                    }`}
                                                title={loja.ativo ? "Clique para Bloquear" : "Clique para Ativar"}
                                            >
                                                {loja.ativo ? '🟢 ATIVA' : '🔴 BLOQUEADO'}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
