'use client'

import { useState } from 'react'
import { registrarLead } from '../../actions/analytics'

interface LeadFormClientProps {
    lojaId: string
    veiculoId: string
    lojaNome: string
    corPrimaria: string
    linkWhatsAppBase: string
}

export default function LeadFormClient({ lojaId, veiculoId, lojaNome, corPrimaria, linkWhatsAppBase }: LeadFormClientProps) {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [telefone, setTelefone] = useState('')
    const [mensagem, setMensagem] = useState('Olá, tenho interesse no veículo. Por favor entre em contato.')
    const [enviando, setEnviando] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setEnviando(true)

        // 1. Registra o Lead silenciosamente no Analytics do Supabase
        await registrarLead(lojaId, 'whatsapp', {
            veiculo_id: veiculoId,
            nome_cliente: nome,
            telefone_contato: telefone,
            mensagem: mensagem
        })

        // 2. Redireciona o usuário para o WhatsApp com a mensagem preenchida
        // Usa a base da URL fornecida (que já contém o número) e anexa o texto formatado.
        const textoFormatado = `*Novo Lead do Site*\n\n*Nome:* ${nome}\n*Telefone:* ${telefone}\n*Email:* ${email}\n*Mensagem:* ${mensagem}`
        const finalUrl = `${linkWhatsAppBase}&text=${encodeURIComponent(textoFormatado)}`

        window.open(finalUrl, '_blank')

        // Limpa estado (opcional, como abriu em nova aba, a pag pode manter se o user voltar)
        setEnviando(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
                type="text"
                placeholder="Nome*"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all placeholder:text-gray-400"
            />
            <input
                type="email"
                placeholder="E-mail*"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all placeholder:text-gray-400"
            />
            <input
                type="tel"
                placeholder="Telefone*"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all placeholder:text-gray-400"
            />
            <textarea
                rows={2}
                placeholder="Mensagem*"
                required
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all resize-none placeholder:text-gray-400 text-gray-600"
            ></textarea>

            <div className="flex items-start gap-2 mt-2 mb-3">
                <input type="checkbox" id="terms" defaultChecked className="mt-1 flex-shrink-0 cursor-pointer" />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-tight cursor-pointer">
                    Quero receber contatos da {lojaNome} por e-mail, WhatsApp e outros canais.
                </label>
            </div>

            <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 rounded font-bold text-white tracking-wide text-center flex items-center justify-center transition-colors hover:brightness-110 text-base mt-2 disabled:opacity-50"
                style={{ backgroundColor: "var(--color-brand)" }}
            >
                {enviando ? 'Enviando...' : 'Enviar mensagem'}
            </button>
        </form>
    )
}
