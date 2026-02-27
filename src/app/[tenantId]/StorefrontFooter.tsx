import Link from 'next/link'
import { Instagram, MapPin, Mail, Phone, MessageCircle, Clock } from 'lucide-react'

type StorefrontFooterProps = {
    slug: string
    lojaNome: string
    logoUrl?: string
    corPrimaria: string
    contato: {
        whatsapp?: string
        telefone_fixo?: string
        email?: string
        instagram?: string
        facebook?: string
        endereco?: string
        cidade?: string
        estado?: string
        cep?: string
        horario_funcionamento?: string
    }
}

export default function StorefrontFooter({ slug, lojaNome, logoUrl, corPrimaria, contato }: StorefrontFooterProps) {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8 text-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand / Sobre */}
                    <div className="flex flex-col gap-4">
                        <Link href={`/${slug}`} className="inline-block">
                            {logoUrl ? (
                                <img src={logoUrl} alt={`Logo ${lojaNome}`} className="h-12 w-auto" />
                            ) : (
                                <span className="text-2xl font-black tracking-tight" style={{ color: "var(--color-brand, #3b82f6)" }}>
                                    {lojaNome}
                                </span>
                            )}
                        </Link>
                        <p className="text-gray-500 leading-relaxed mt-2">
                            A sua melhor escolha em veículos seminovos e novos. Qualidade, procedência e as melhores taxas do mercado.
                        </p>

                        {/* Redes Sociais */}
                        <div className="flex items-center gap-4 mt-4">
                            {contato?.facebook && (
                                <a
                                    href={contato.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:scale-110 hover:-translate-y-1 transition-all"
                                    title="Siga no Facebook"
                                >
                                    <img src="/images/facebook.png" alt="Facebook" className="w-8 h-8 object-contain drop-shadow-sm" />
                                </a>
                            )}
                            {contato?.instagram && (
                                <a
                                    href={`https://instagram.com/${contato.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:scale-110 hover:-translate-y-1 transition-all"
                                    title="Siga no Instagram"
                                >
                                    <img src="/images/instagram logo.png" alt="Instagram" className="w-8 h-8 object-contain drop-shadow-sm" />
                                </a>
                            )}
                            {contato?.whatsapp && (
                                <a
                                    href={`https://wa.me/55${contato.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:scale-110 hover:-translate-y-1 transition-all"
                                    title="Fale conosco no WhatsApp"
                                >
                                    <img src="/images/logo whatsapp.png" alt="WhatsApp" className="w-8 h-8 object-contain drop-shadow-sm" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Navegação Rápida */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Acesso Rápido</h4>
                        <ul className="flex flex-col gap-3">
                            <li><Link href={`/${slug}`} className="text-gray-500 hover:text-gray-900 transition-colors">Ver Estoque</Link></li>
                            <li><Link href={`/${slug}/sobre`} className="text-gray-500 hover:text-gray-900 transition-colors">Sobre a Loja</Link></li>
                            <li><Link href={`/${slug}/localizacao`} className="text-gray-500 hover:text-gray-900 transition-colors">Nossa Localização</Link></li>
                            <li><Link href={`/${slug}/contato`} className="text-gray-500 hover:text-gray-900 transition-colors">Fale Conosco</Link></li>
                        </ul>
                    </div>

                    {/* Contatos Diversos */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Atendimento</h4>
                        <ul className="flex flex-col gap-4">
                            {contato?.whatsapp && (
                                <li>
                                    <a href={`https://wa.me/${contato.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-gray-500 hover:text-gray-900 group transition-colors">
                                        <div className="mt-0.5"><MessageCircle size={16} className="text-gray-400 group-hover:text-green-500 transition-colors" /></div>
                                        <span>{contato.whatsapp}</span>
                                    </a>
                                </li>
                            )}
                            {contato?.telefone_fixo && (
                                <li>
                                    <a href={`tel:${contato.telefone_fixo.replace(/\D/g, '')}`} className="flex items-start gap-3 text-gray-500 hover:text-gray-900 group transition-colors">
                                        <div className="mt-0.5"><Phone size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" /></div>
                                        <span>{contato.telefone_fixo}</span>
                                    </a>
                                </li>
                            )}
                            {contato?.email && (
                                <li>
                                    <a href={`mailto:${contato.email}`} className="flex items-start gap-3 text-gray-500 hover:text-gray-900 group transition-colors">
                                        <div className="mt-0.5"><Mail size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" /></div>
                                        <span className="truncate">{contato.email}</span>
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Localização & Horário */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Onde Estamos</h4>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <div className="flex items-start gap-3 text-gray-500">
                                    <div className="mt-0.5"><MapPin size={16} className="text-gray-400 shrink-0" /></div>
                                    <div>
                                        <p>{contato?.endereco ? contato.endereco : 'Endereço não cadastrado'}</p>
                                        {(contato?.cidade || contato?.estado) && (
                                            <p className="mt-1 text-xs">{contato.cidade} - {contato.estado}</p>
                                        )}
                                    </div>
                                </div>
                            </li>
                            {contato?.horario_funcionamento && (
                                <li>
                                    <div className="flex items-start gap-3 text-gray-500">
                                        <div className="mt-0.5"><Clock size={16} className="text-gray-400 shrink-0" /></div>
                                        <p className="whitespace-pre-line text-xs">{contato.horario_funcionamento}</p>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} {lojaNome}. Todos os direitos reservados.</p>
                    <p>Orgulhosamente desenvolvido por <span className="font-semibold text-gray-900">Auto Showroom SaaS</span></p>
                </div>
            </div>
        </footer>
    )
}
