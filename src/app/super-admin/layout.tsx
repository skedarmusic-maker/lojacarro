import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, Car, LayoutDashboard, Settings, UserSquare2 } from 'lucide-react'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    // Checking Super Admin flag
    const { data: adminProfile } = await supabase
        .from('perfis_lojas')
        .select('is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle()

    if (!adminProfile || adminProfile.is_super_admin !== true) {
        // Redireciona usuários normais para o painel deles
        redirect('/admin/dashboard')
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col md:flex-row">
            {/* Sidebar Super Admin */}
            <aside className="w-full md:w-64 border-r border-zinc-800 bg-[#0A0A0A] flex flex-col shrink-0">
                <div className="p-6 border-b border-zinc-900 bg-[#0f0f0f]">
                    <h2 className="font-black text-xl tracking-tight text-white flex gap-2 items-center">
                        <Activity className="text-emerald-500" /> AutoSaaS Mestre
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1">Super Admin Panel</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <LayoutDashboard size={18} /> Dashboard Global
                    </Link>
                    {/* Placeholder links for future expansion */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-zinc-500 opacity-50 cursor-not-allowed">
                        <UserSquare2 size={18} /> Assinaturas (Em breve)
                    </div>
                </nav>
                <div className="p-4 border-t border-zinc-900">
                    <form action="/admin/actions/logout" method="POST">
                        <button className="w-full text-zinc-500 hover:text-red-400 text-sm font-medium p-2 text-left flex gap-2 items-center transition-colors">
                            Sair do Painel
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main view area for Super Admin */}
            <div className="flex-1 overflow-auto bg-[#0a0a0a]">
                {children}
            </div>
        </div>
    )
}
