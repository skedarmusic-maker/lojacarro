import { login, signup } from '../actions'

type Props = {
    searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
    const params = await searchParams;
    const message = params?.message;

    return (
        <div className="flex h-screen items-center justify-center bg-zinc-950 text-white font-sans">
            <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-[#0f0f0f] p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Painel Lojista</h1>
                    <p className="text-sm text-zinc-400 mt-2">
                        Faça login para gerenciar o estoque da sua loja.
                    </p>
                </div>

                {message && (
                    <div className="mb-6 rounded-md bg-red-950/50 p-3 text-sm text-red-400 border border-red-900/50 text-center">
                        {message}
                    </div>
                )}

                <form className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email</label>
                        <input
                            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="exemplo@loja.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-300" htmlFor="password">Senha</label>
                        <input
                            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                            id="password"
                            name="password"
                            type="password"
                            required
                        />
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        {/* O uso do formAction aciona a Server Action injetando o FormData automaticamente */}
                        <button
                            formAction={login}
                            className="w-full rounded-md bg-white text-black py-2.5 font-medium hover:bg-zinc-200 transition-colors"
                        >
                            Entrar
                        </button>

                        <button
                            formAction={signup}
                            className="w-full rounded-md bg-transparent border border-zinc-700 py-2.5 font-medium hover:bg-zinc-800 transition-colors text-zinc-300"
                        >
                            Criar Nova Loja
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
