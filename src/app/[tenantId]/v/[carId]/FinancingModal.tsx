'use client'

import { useState } from 'react'
import { X, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'

type FinancingModalProps = {
    isOpen: boolean
    onClose: () => void
    lojaId: string
    veiculoId: string
    veiculoNome: string
    corPrimaria: string
}

export default function FinancingModal({ isOpen, onClose, lojaId, veiculoId, veiculoNome, corPrimaria }: FinancingModalProps) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [leadId, setLeadId] = useState<string | null>(null)

    // Form Data
    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        email: '',
        cpf: '',
        data_nascimento: '',
        renda_mensal: '',
        valor_entrada: '',
        possui_cnh: '',
        concorda_termos: false
    })

    if (!isOpen) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.nome || !formData.whatsapp || !formData.cpf) {
            alert('Por favor, preencha nome, whatsapp e CPF para continuar.')
            return
        }

        setIsSubmitting(true)
        setStatus('idle')

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loja_id: lojaId,
                    veiculo_id: veiculoId,
                    nome: formData.nome,
                    whatsapp: formData.whatsapp,
                    email: formData.email,
                    cpf: formData.cpf
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Erro ao enviar dados iniciais')

            setLeadId(data.leadId)
            setStep(2)
        } catch (error: any) {
            setStatus('error')
            setErrorMessage(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.concorda_termos) {
            alert('Você precisa concordar com os termos para enviar a simulação.')
            return
        }

        setIsSubmitting(true)
        setStatus('idle')

        try {
            const res = await fetch('/api/leads', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: leadId,
                    loja_id: lojaId,
                    veiculo_id: veiculoId,
                    nome: formData.nome,
                    whatsapp: formData.whatsapp,
                    email: formData.email,
                    cpf: formData.cpf,
                    data_nascimento: formData.data_nascimento,
                    renda_mensal: formData.renda_mensal,
                    valor_entrada: formData.valor_entrada,
                    possui_cnh: formData.possui_cnh === 'sim'
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Erro ao atualizar simulação')

            setStatus('success')
        } catch (error: any) {
            setStatus('error')
            setErrorMessage(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const skipStep2 = () => {
        setStatus('success')
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="pr-8">
                        <h2 className="text-xl font-bold text-gray-900">Simular Financiamento</h2>
                        <p className="text-sm text-gray-500 mt-1">Para o <span className="font-semibold text-gray-700">{veiculoNome}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors absolute right-4 top-4"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ficha enviada!</h3>
                            <p className="text-gray-600 mb-6">Sua solicitação de pré-análise foi enviada com sucesso para a loja. Em breve um consultor entrará em contato.</p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: corPrimaria }}
                            >
                                Concluir
                            </button>
                        </div>
                    ) : (
                        <div>

                            {/* Stepper Indicators */}
                            <div className="flex gap-2 mb-8">
                                <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            </div>

                            {status === 'error' && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 text-sm">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p>{errorMessage}</p>
                                </div>
                            )}

                            {/* Step 1: Info Básica */}
                            <div className={step === 1 ? 'block' : 'hidden'}>
                                <form onSubmit={handleStep1Submit} className="space-y-4">
                                    <p className="text-gray-600 text-sm mb-4">Insira seus dados básicos e o vendedor entrará em contato.</p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                                        <input required name="nome" value={formData.nome} onChange={handleChange} placeholder="Digite seu nome completo (conforme RG/CPF)" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                                            <input required name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                                            <input required name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-8 py-3.5 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: corPrimaria }}
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Falar com Vendedor'} <ChevronRight size={18} />
                                    </button>
                                </form>
                            </div>

                            {/* Step 2: Dados de Crédito */}
                            <div className={step === 2 ? 'block' : 'hidden'}>
                                <form onSubmit={handleStep2Submit}>
                                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                        <p className="text-emerald-800 font-medium text-sm">
                                            ✨ Quase lá! Seu interesse já foi enviado ao vendedor.
                                        </p>
                                        <p className="text-emerald-700 text-sm mt-1 leading-relaxed">
                                            Quer agilizar a sua aprovação? Preencha os dados abaixo para uma pré-análise de crédito prioritária.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                                            <input required type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 flex-1 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Renda Mensal Estimada *</label>
                                                <input required name="renda_mensal" value={formData.renda_mensal} onChange={handleChange} placeholder="R$ 0,00" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor de Entrada *</label>
                                                <input required name="valor_entrada" value={formData.valor_entrada} onChange={handleChange} placeholder="R$ 0,00" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Possui CNH? *</label>
                                            <select required name="possui_cnh" value={formData.possui_cnh} onChange={handleChange as any} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all">
                                                <option value="" disabled>Selecione uma opção</option>
                                                <option value="sim">Sim, possuo CNH</option>
                                                <option value="nao">Não possuo</option>
                                            </select>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    required
                                                    type="checkbox"
                                                    name="concorda_termos"
                                                    checked={formData.concorda_termos}
                                                    onChange={handleChange}
                                                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                                />
                                                <span className="text-xs text-gray-600 leading-relaxed">
                                                    Autorizo o envio dos meus dados para a loja administradora e concordo com a política de privacidade. Os dados serão utilizados exclusivamente para simulação e pré-análise de crédito.
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={skipStep2}
                                            className="px-6 py-3.5 rounded-lg font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors text-sm"
                                        >
                                            Pular esta etapa
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-3.5 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: corPrimaria }}
                                        >
                                            {isSubmitting ? 'Enviando...' : 'Enviar para Análise'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
