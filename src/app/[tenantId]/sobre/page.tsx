import { getLojaBySlug } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StorefrontFooter from '../StorefrontFooter'
import { ShieldCheck, Award, ThumbsUp } from 'lucide-react'

// Forza essa página a ser renderizada dinamicamente caso os dados mudem (Next.js App Router)
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ tenantId: string }> }) {
    const resolvedParams = await params
    const loja = await getLojaBySlug(resolvedParams.tenantId)
    if (!loja) return { title: 'Sobre Nós' }

    return {
        title: `Sobre Nós | ${loja.nome}`,
        description: `Conheça a história da ${loja.nome}. Qualidade, procedência e os melhores seminovos em ${loja.dados_contato?.cidade || 'sua região'}.`,
    }
}

export default async function SobreLojaPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const resolvedParams = await params
    const loja = await getLojaBySlug(resolvedParams.tenantId)

    if (!loja) {
        notFound()
    }

    const { dados_contato, config_visual, sobre_loja, nome } = loja

    // Gerador de Texto Automático para SEO e placeholder profissional caso o lojista ikke preencha
    const textoDinamicoBckup = `
        Bem-vindo à **${nome}**, onde o seu sonho de ter um carro novo com total segurança e procedência se torna realidade.
        
        Localizados em **${dados_contato?.cidade || 'sua região'}**, nós nos dedicamos a entregar a melhor experiência no processo de compra, venda e troca do seu veículo. Entendemos que adquirir um carro não é apenas uma transação financeira, mas a conquista de um objetivo. É por isso que trabalhamos apenas com um estoque rigorosamente selecionado.
        
        Todos os nossos veículos passam por um criterioso processo de avaliação estrutural, mecânica e documental. **Nosso compromisso não é apenas vender carros, mas construir relações de confiança de longo prazo** com cada um dos nossos clientes.
        
        Trabalhamos com as melhores taxas de financiamento do mercado para facilitar a sua aquisição, avaliamos o seu veículo usado de forma justa na troca e garantimos total transparência em todas as etapas da negociação.
        
        Venha nos fazer uma visita em nossa loja física, localizada em ${dados_contato?.endereco ? `**${dados_contato.endereco}**` : 'nosso novo endereço'}, ou entre em contato pelo nosso central de atendimento para tirar todas as suas dúvidas. Será um prazer atendê-lo!
    `

    // Verifica se a loja escreveu algo. Se sim, exibe. Se não, exibe o fallback dinâmico.
    const conteudoExibido = sobre_loja ? sobre_loja : textoDinamicoBckup

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 border-t-4" style={{ borderTopColor: config_visual?.cor_primaria || '#e5e7eb' }}>
            <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="text-2xl font-black tracking-tight flex items-center gap-3">
                        {config_visual?.logo_url && (
                            <img src={config_visual.logo_url} alt={`Logo ${nome}`} className="h-10 w-auto" />
                        )}
                        <Link href="/" style={{ color: "var(--color-brand)" }}>{nome}</Link>
                    </div>
                    <nav className="hidden md:flex gap-6 font-medium text-gray-600">
                        <Link href="/" className="hover:text-gray-900 transition-colors">Estoque</Link>
                        <Link href="/sobre" className="text-gray-900 font-bold">Sobre Nós</Link>
                        <Link href="/localizacao" className="hover:text-gray-900 transition-colors">Localização</Link>
                        <Link href="/contato" className="hover:text-gray-900 transition-colors">Contato</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Header Institucional */}
                <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
                    {/* Linhas diagonais sutis para dar textura premium */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black z-0"></div>

                    <div className="container mx-auto px-4 relative z-20">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                                Nossa <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${config_visual?.cor_primaria || '#fff'}, #fff)` }}>História</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-300 font-light max-w-lg">
                                Tradição, qualidade e compromisso com a sua satisfação em cada detalhe.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Conteúdo Principal */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">

                            {/* Bloco de Texto Principal */}
                            <div className="lg:col-span-7 prose prose-lg prose-gray max-w-none">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
                                    Sobre a {nome}
                                </h2>

                                {loja.imagem_sobre && (
                                    <div className="mb-8 rounded-2xl overflow-hidden shadow-md border border-gray-100 max-h-[450px]">
                                        <img src={loja.imagem_sobre} alt={`Especial de ${nome}`} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="text-gray-700 leading-relaxed font-light whitespace-pre-line text-[17px]">
                                    {conteudoExibido.split('\n').map((line, index) => {
                                        // Simple markdown bold parser for the fallback text
                                        if (line.includes('**')) {
                                            const parts = line.split('**')
                                            return (
                                                <p key={index} className="mb-4">
                                                    {parts.map((part, i) => i % 2 !== 0 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part)}
                                                </p>
                                            )
                                        }
                                        return <p key={index} className="mb-4">{line}</p>
                                    })}
                                </div>
                            </div>

                            {/* Sidebar / Trust Indicators */}
                            <div className="lg:col-span-5">
                                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm sticky top-24">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Porque comprar com a {nome}?</h3>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-800" style={{ color: config_visual?.cor_primaria }}>
                                                <ShieldCheck size={28} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Veículos Inspecionados</h4>
                                                <p className="text-sm text-gray-600 mt-1">100% do nosso estoque passa por uma rigorosa avaliação antes de chegar até você.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-800" style={{ color: config_visual?.cor_primaria }}>
                                                <Award size={28} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Garantia de Procedência</h4>
                                                <p className="text-sm text-gray-600 mt-1">Trabalhamos apenas com automóveis com documentação cristalina e histórico limpo.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-800" style={{ color: config_visual?.cor_primaria }}>
                                                <ThumbsUp size={28} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Taxas Competitivas</h4>
                                                <p className="text-sm text-gray-600 mt-1">Parceria com os maiores bancos para garantir o crédito ideal para o seu bolso.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {dados_contato?.whatsapp && (
                                        <div className="mt-8 pt-8 border-t border-gray-200">
                                            <a
                                                href={`https://wa.me/55${dados_contato.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida.`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full flex items-center justify-center py-3.5 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
                                                style={{ backgroundColor: config_visual?.cor_primaria || '#111827' }}
                                            >
                                                Falar com Consultor
                                            </a>
                                        </div>
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

            <StorefrontFooter
                lojaNome={nome}
                logoUrl={config_visual?.logo_url}
                corPrimaria={config_visual?.cor_primaria || '#2563eb'}
                contato={dados_contato || {}}
            />
        </div>
    )
}
