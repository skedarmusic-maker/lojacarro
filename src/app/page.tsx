export default function PlataformaHome() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-4">
            <h1 className="text-4xl font-bold mb-4">Plataforma Auto Showroom</h1>
            <p className="text-zinc-400 text-center max-w-lg mb-8">
                Esta é a raiz da plataforma SaaS. Se você fosse um lojista, estaria logado aqui.
            </p>

            <div className="flex gap-4">
                <a href="/admin/login" className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-md font-medium transition-colors">
                    Entrar como Lojista
                </a>
            </div>

            <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-lg max-w-xl w-full">
                <h2 className="text-xl font-semibold mb-2">Simulação de Domínios (White-label)</h2>
                <p className="text-zinc-400 text-sm mb-4">
                    Para ver como o site de uma loja específica ficaria, altere a URL no seu navegador ou acesse:
                </p>
                <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                    <li><strong>http://marinhos.localhost:3000</strong></li>
                    <li><strong>http://supercarros.localhost:3000</strong></li>
                </ul>
            </div>
        </div>
    );
}
