import DemoVeiculoFormClient from './DemoVeiculoFormClient'

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex text-sm">
            
            {/* Sidebar Fixa do Modo Demo */}
            <aside className="w-64 border-r border-zinc-800 bg-[#0f0f0f] hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                        <h2 className="font-bold text-lg text-purple-400">Ambiente Demo</h2>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1">Convidado Especial</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="block px-4 py-2.5 bg-zinc-800 text-white rounded-md font-medium cursor-default">
                        Novo Veículo (Ativo)
                    </div>
                    <div className="block px-4 py-2.5 text-zinc-600 rounded-md font-medium cursor-not-allowed">
                        Visão Geral (Bloqueado)
                    </div>
                    <div className="block px-4 py-2.5 text-zinc-600 rounded-md font-medium cursor-not-allowed">
                        Meu Estoque (Bloqueado)
                    </div>
                    <div className="block px-4 py-2.5 text-zinc-600 rounded-md font-medium cursor-not-allowed">
                        Configurações (Bloqueado)
                    </div>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 text-center">
                        Simulação do painel do lojista. Algumas áreas estão restritas.
                    </p>
                </div>
            </aside>

            {/* Area Principal */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 flex items-center px-8 sticky top-0 backdrop-blur-md z-10">
                    <h1 className="text-xl font-semibold">Test Drive do Sistema</h1>
                </header>

                <div className="p-4 md:p-8 max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-black mb-3">Bem-vindo(a) à Plataforma!</h1>
                        <p className="text-zinc-400 text-base md:text-lg max-w-2xl">
                            Experimente o nosso publicador inteligente na prática. Digite uma placa FIPE e veja o sistema preencher a ficha técnica para você automaticamente.
                        </p>
                    </div>

                    <DemoVeiculoFormClient />

                    <div className="mt-8 p-6 bg-emerald-900/10 border border-emerald-900/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-emerald-400 mb-2">Já quer ver uma vitrine pronta?</h3>
                            <p className="text-zinc-400 max-w-lg">
                                Acesse nosso estoque de demonstração e veja como os seus veículos vão ficar maravilhosos após o cadastro.
                            </p>
                        </div>

                        <a 
                            href="https://silver-starling-801980.hostingersite.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 bg-transparent border-2 border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-lg font-bold transition-colors w-full md:w-auto text-center relative z-10"
                        >
                            Ver Vitrine Completa
                        </a>
                    </div>
                </div>
            </main>
        </div>
    )
}
