'use client'

import { useState, useRef } from 'react'
import { Star, Trash2, Loader2 } from 'lucide-react'
import { compressImageToWebmotorsStandard } from '@/lib/imageCompressor'

export default function EditImagesClient({ imagensIniciais }: { imagensIniciais: string[] }) {
    const [imagens, setImagens] = useState<string[]>(imagensIniciais || [])
    const [isCompressing, setIsCompressing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSetCover = (index: number) => {
        if (index === 0) return;
        const newImagens = [...imagens];
        const [coverItem] = newImagens.splice(index, 1);
        newImagens.unshift(coverItem); // Move to start
        setImagens(newImagens);
    }

    const handleDelete = (index: number) => {
        if (confirm("Deseja realmente remover esta foto?")) {
            const newImagens = imagens.filter((_, i) => i !== index);
            setImagens(newImagens);
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsCompressing(true)
        try {
            const originFiles = Array.from(e.target.files)
            const dt = new DataTransfer()

            for (const file of originFiles) {
                if (file.type.startsWith('image/')) {
                    // Comprime e redimensiona a imagem no Client-Side
                    const compressed = await compressImageToWebmotorsStandard(file)
                    dt.items.add(compressed)
                } else {
                    dt.items.add(file)
                }
            }

            // Injeta os files levíssimos de volta no input nativo para o FormData do Server Action
            if (fileInputRef.current) {
                fileInputRef.current.files = dt.files
            }
        } catch (error) {
            console.error("Erro ao comprimir imagens:", error)
            alert("Ocorreu um erro ao otimizar as imagens. Tente novamente.")
            if (fileInputRef.current) {
                fileInputRef.current.value = '' // Reseta em caso de erro
            }
        } finally {
            setIsCompressing(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Input escondido para enviar o estado atualizado das fotos para o fluxo Server Action pai */}
            <input type="hidden" name="existing_imagens" value={JSON.stringify(imagens)} />

            {imagens.length > 0 && (
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                        Fotos Atuais ({imagens.length}/8) - <span className="text-emerald-500 font-bold">A primeira foto sempre será a capa</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagens.map((img, idx) => (
                            <div key={`${img}-${idx}`} className={`relative aspect-[4/3] bg-zinc-800 rounded-xl overflow-hidden shadow-lg border-2 transition-all ${idx === 0 ? 'border-emerald-500' : 'border-zinc-800'}`}>
                                <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

                                {/* Etiqueta de Capa Visual */}
                                {idx === 0 && (
                                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1">
                                        <Star size={12} fill="currentColor" /> Capa Oficial
                                    </div>
                                )}

                                {/* Ações Overlay */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                    {idx !== 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetCover(idx)}
                                            className="bg-emerald-500 text-white shadow-lg text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-400 hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            <Star size={14} fill="currentColor" /> Fazer Capa
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(idx)}
                                        className="bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2 border-t border-zinc-800 pt-6">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    Adicionar Novas Fotos
                    {isCompressing && <span className="text-emerald-400 flex items-center gap-1 normal-case"><Loader2 size={12} className="animate-spin" /> Otimizando...</span>}
                </label>
                <input
                    type="file"
                    name="fotos"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isCompressing}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer text-sm disabled:opacity-50"
                />
                <p className="text-xs text-zinc-500 mt-1">As fotos passarão por redimensionamento e compressão automática para garantir carregamento super rápido.</p>
            </div>
        </div>
    )
}
