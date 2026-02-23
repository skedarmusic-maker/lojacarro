import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Car } from 'lucide-react'

// Layout genérico para a vitrine
// Responsável por buscar os dados do tenant no banco e injetar as variáveis CSS, e bloquear lojas inativas

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ tenantId: string }>
}) {
    const { tenantId } = await params
    const supabase = await createClient()

    const { data: loja } = await supabase
        .from('perfis_lojas')
        .select('*')
        .or(`slug.eq.${tenantId},custom_domain.eq.${tenantId}`)
        .maybeSingle()

    // Se a loja não existe, erro 404 nativo
    if (!loja) {
        notFound()
    }

    // Se a Loja está Inativa (Bloqueada pelo Super Admin)
    if (loja.ativo === false) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-white shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Car className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-black mb-2">Plataforma Indisponível</h1>
                    <p className="text-zinc-400 mb-8">
                        A vitrine de veículos de <strong>{loja.nome}</strong> está temporariamente suspensa por questões administrativas.
                    </p>
                    <a href="https://wa.me/5511965843545" target="_blank" rel="noopener noreferrer" className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-zinc-700 w-full">
                        Entrar em Contato com o Suporte
                    </a>
                </div>
            </div>
        )
    }

    // Passou em tudo: Aplica o tema dinâmico e renderiza os filhos (page.tsx de lista ou de detalhes)
    // Extrai as cores (usando padrão se nao vier do banco)
    const px = loja.config_visual?.cor_primaria || '#3b82f6'

    return (
        <div style={{ "--color-brand": px } as React.CSSProperties}>
            {children}
        </div>
    )
}
