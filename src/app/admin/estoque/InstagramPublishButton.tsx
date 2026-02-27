'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Instagram, X, CheckCircle } from 'lucide-react'

type Veiculo = any

interface InstagramPublishButtonProps {
    veiculo: Veiculo
    renderAsIcon?: boolean
}

const TAGS = [
    { label: '🔥 Oferta Imperdível (Foco em preço baixo)', value: '🔥 OFERTA IMPERDÍVEL 🔥' },
    { label: '💎 Raridade / Único Dono (Foco em estado de novo)', value: '💎 RARIDADE 💎' },
    { label: '👨‍👩‍👧 Ideal para Família (Foco em espaço e conforto)', value: '👨‍👩‍👧 IDEAL PARA FAMÍLIA 👨‍👩‍👧' },
    { label: '🏎️ Esportivo / Potência (Foco em performance)', value: '🏎️ ESPORTIVO DE VERDADE 🏎️' },
    { label: '💼 Ideal para Uber/Trabalho (Foco em economia)', value: '💼 MUITO ECONÔMICO 💼' },
    { label: '🇧🇷 Oportunidade (Padrão)', value: '‼️ 🇧🇷 OPORTUNIDADE 🇧🇷 ‼️' }
]

export default function InstagramPublishButton({ veiculo, renderAsIcon }: InstagramPublishButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedImages, setSelectedImages] = useState<string[]>(
        veiculo?.imagens?.slice(0, 5) || [] // Pré-selecionar as primeiras 5 (no max 10 suportado pelo Insta)
    )
    const [selectedTag, setSelectedTag] = useState<string>(TAGS[5].value) // Padrão

    const toggleImage = (url: string) => {
        if (selectedImages.includes(url)) {
            setSelectedImages(prev => prev.filter(i => i !== url))
        } else {
            if (selectedImages.length >= 10) {
                alert('O Instagram permite no máximo 10 fotos por post.')
                return
            }
            setSelectedImages(prev => [...prev, url])
        }
    }

    const handlePublish = () => {
        if (selectedImages.length === 0) {
            alert('Selecione pelo menos 1 foto para postar.')
            return
        }

        startTransition(async () => {
            try {
                const { publishToInstagramService } = await import('./instagramService');
                const result = await publishToInstagramService(veiculo.id, selectedImages, selectedTag);
                if (result?.error) alert(result.error);
                if (result?.success) {
                    alert(result.message);
                    setIsModalOpen(false)
                }
            } catch (e) {
                alert('Erro ao tentar conectar com Instagram.');
            }
        })
    }

    if (!veiculo || !veiculo.id) return null;

    return (
        <>
            {renderAsIcon ? (
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={isPending}
                    className="text-pink-500 hover:text-white transition-colors p-2 text-xs font-bold bg-zinc-800 hover:bg-pink-600 rounded flex items-center gap-1 disabled:opacity-50"
                    title="Postar no Instagram"
                >
                    {isPending ? '⏳' : '📸'} IG
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white text-sm font-bold rounded-lg transition-all shadow-lg disabled:opacity-50"
                >
                    {isPending ? '⏳ Publicando...' : '📸 Postar no Instagram'}
                </button>
            )}

            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto w-full h-full">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[90vh]">

                        {/* HEADER */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Instagram className="text-pink-600" size={20} />
                                    Postar no Instagram
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Personalize as fotos e a chamada (Headline) do anúncio
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-white">

                            {/* TAG SELECTOR */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">1. Escolha a Temática (Headline)</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all cursor-pointer font-medium bg-white text-gray-900"
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                >
                                    {TAGS.map(t => (
                                        <option key={t.value} value={t.value} className="text-gray-900">{t.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">Esta frase aparecerá como título da legenda no Instagram para atrair mais atenção.</p>
                            </div>

                            {/* FOTO SELECTOR */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700">
                                        2. Selecione as Fotos
                                    </label>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${selectedImages.length === 0 ? 'bg-red-100 text-red-700' : selectedImages.length === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {selectedImages.length}/10 selecionadas
                                    </span>
                                </div>

                                {selectedImages.length === 1 && (
                                    <p className="text-xs text-amber-600 mb-3 bg-amber-50 p-2 rounded-md font-medium">
                                        ⚠️ Apenas 1 foto selecionada: O post será de Imagem Única. Adicione mais para postar em Álbum (Carrossel).
                                    </p>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {veiculo.imagens?.map((url: string, idx: number) => {
                                        const isSelected = selectedImages.includes(url)
                                        const isFirst = selectedImages[0] === url

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => toggleImage(url)}
                                                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${isSelected ? 'border-pink-500 shadow-md scale-[0.98]' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'}`}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Foto ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-2 right-2 z-10">
                                                    {isSelected ? (
                                                        <CheckCircle className="text-pink-500 bg-white rounded-full drop-shadow-sm" size={24} fill="white" />
                                                    ) : (
                                                        <div className="w-[24px] h-[24px] rounded-full border-2 border-white bg-black/40 shadow-sm transition-all group-hover:scale-110" />
                                                    )}
                                                </div>

                                                {isFirst && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-pink-500 text-white text-[10px] font-bold text-center py-1 truncate px-1">
                                                        CAPA DO POST
                                                    </div>
                                                )}

                                                {isSelected && !isFirst && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-bold text-center py-1">
                                                        {selectedImages.indexOf(url) + 1}º FOTO
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isPending || selectedImages.length === 0 || selectedImages.length > 10}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white text-sm font-bold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? '⏳ Processando...' : '🚀 Postar Agora'}
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}
        </>
    )
}
