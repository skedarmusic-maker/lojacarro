import { headers } from 'next/headers'
import Image from 'next/image'

export default async function PlataformaHome() {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-4">
            <div className="mb-6">
                <Image 
                    src="/logo-vite.png" 
                    alt="VITE Logo" 
                    width={180} 
                    height={45} 
                    className="object-contain"
                />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-center">Gestão Inteligente de Estoque</h1>
            <p className="text-zinc-400 text-center max-w-lg mb-8">
                Bem-vindo ao <strong>VITE</strong>. Faça login para gerenciar o seu showroom de veículos.
            </p>

            <div className="flex gap-4">
                <a href="/admin/login" className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 rounded-md font-medium transition-colors text-lg">
                    Entrar como Lojista
                </a>
            </div>
        </div>
    );
}
