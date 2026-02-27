'use client'

import { useState } from 'react'
import { fetchPlacaFipe, submitNovoVeiculo } from './actions'
import { compressImageToWebmotorsStandard } from '@/lib/imageCompressor'

export default function VeiculoFormClient() {
    const [loadingPlaca, setLoadingPlaca] = useState(false)
    const [loadingForm, setLoadingForm] = useState(false)
    const [placaInput, setPlacaInput] = useState('')
    const [placaError, setPlacaError] = useState('')
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    // Form states
    const [marca, setMarca] = useState('')
    const [modelo, setModelo] = useState('')
    const [anoFab, setAnoFab] = useState('')
    const [anoMod, setAnoMod] = useState('')
    const [preco, setPreco] = useState('')
    const [km, setKm] = useState('')

    const handleBuscarPlaca = async (e: React.FormEvent) => {
        e.preventDefault()
        setPlacaError('')
        setFormSuccess('')

        if (!placaInput || placaInput.length < 7) {
            setPlacaError('Digite uma placa válida.')
            return
        }

        setLoadingPlaca(true)
        const result = await fetchPlacaFipe(placaInput)

        if (result?.error) {
            setPlacaError(result.error)
            setLoadingPlaca(false)
            return
        }

        const carro = result?.data;
        if (carro) {
            setMarca(carro.marca || '')
            setModelo(carro.modelo || '')
            setAnoFab(carro.anoFabricacao || '')
            setAnoMod(carro.anoModelo || '')
            if (carro.preco_fipe && carro.preco_fipe > 0) {
                setPreco(carro.preco_fipe.toString())
            }
        }

        setLoadingPlaca(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')
        setLoadingForm(true)

        const formData = new FormData(e.currentTarget)

        try {
            // Interceptar e comprimir imagens orignais no client-side
            const originPhotos = formData.getAll('fotos') as File[]
            formData.delete('fotos') // Limpa as fotos originais (pesadas) do payload

            for (const photo of originPhotos) {
                if (photo.size > 0 && photo.type.startsWith('image/')) {
                    const compressedFile = await compressImageToWebmotorsStandard(photo)
                    formData.append('fotos', compressedFile)
                } else if (photo.size > 0) {
                    // Pass-through se por acaso for outro arquivo que o backend deve rejeitar
                    formData.append('fotos', photo)
                }
            }
        } catch (error: any) {
            console.error("Erro na compressão de imagem:", error)
            setFormError("Falha ao processar as imagens antes do envio.")
            setLoadingForm(false)
            return
        }

        const result = await submitNovoVeiculo(formData)

        if (result?.error) {
            setFormError(result.error)
        } else if (result?.success) {
            setFormSuccess('Veículo cadastrado com sucesso!')
            // Reset form
            setPlacaInput('')
            setMarca('')
            setModelo('')
            setAnoFab('')
            setAnoMod('')
            setPreco('')
            setKm('')
            // Also reset the file input if any
            const formElement = e.target as HTMLFormElement;
            formElement.reset();
        }

        setLoadingForm(false)
    }

    return (
        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-6 mb-12">
            <h2 className="text-lg font-bold mb-4">Cadastrar Novo Veículo</h2>

            {/* Seção Placa FIPE */}
            <div className="mb-6 pb-6 border-b border-zinc-800">
                <label className="text-xs font-medium text-zinc-400 block mb-2">Busca Inteligente por Placa</label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        value={placaInput}
                        onChange={(e) => setPlacaInput(e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, ''))}
                        maxLength={7}
                        placeholder="Placa (ex: ABC1234)"
                        className="w-full sm:max-w-[200px] rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 sm:py-2 text-white placeholder-zinc-500"
                    />
                    <button
                        onClick={handleBuscarPlaca}
                        disabled={loadingPlaca}
                        type="button"
                        className="w-full sm:w-auto bg-emerald-600/20 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-600/30 px-4 py-3 sm:py-2 rounded-md font-bold transition-all disabled:opacity-50"
                    >
                        {loadingPlaca ? 'Buscando...' : 'Preencher Magicamente'}
                    </button>
                </div>
                {placaError && <p className="text-red-400 text-xs mt-2">{placaError}</p>}
                <p className="text-zinc-500 text-xs mt-2">Puxa automaticamente dados e valor da tabela FIPE.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Marca</label>
                    <input required name="marca" value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex: Toyota" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Modelo</label>
                    <input required name="modelo" value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: Hilux SRX" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Preço (R$)</label>
                    <input required name="preco" value={preco} onChange={e => setPreco(e.target.value)} type="number" placeholder="250000" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1 hidden lg:block"> {/* Spacer */} </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Ano Fabricação</label>
                    <input required name="ano_fabricacao" value={anoFab} onChange={e => setAnoFab(e.target.value)} type="number" placeholder="2023" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Ano Modelo</label>
                    <input required name="ano_modelo" value={anoMod} onChange={e => setAnoMod(e.target.value)} type="number" placeholder="2024" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">KM</label>
                    <input required name="km" value={km} onChange={e => setKm(e.target.value)} type="number" placeholder="15000" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Categoria</label>
                    <select required name="categoria" defaultValue="Outros" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white">
                        <option value="Carros elétricos">Carros elétricos</option>
                        <option value="Hatches">Hatches</option>
                        <option value="Picapes">Picapes</option>
                        <option value="Sedans">Sedans</option>
                        <option value="SUVs">SUVs</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>

                <div className="space-y-1 lg:col-span-2">
                    <label className="text-xs font-medium text-zinc-400">Fotos do Veículo (Selecione até 8 fotos)</label>
                    <input type="file" name="fotos" multiple accept="image/*" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer text-sm" />
                    <p className="text-xs text-zinc-500 mt-1">Você pode selecionar várias fotos de uma vez segurando o CTRL ou arrastando.</p>
                </div>

                <div className="md:col-span-2 lg:col-span-3 mt-4">
                    {formError && <div className="p-3 mb-4 rounded bg-red-900/20 border border-red-900/50 text-red-500 font-medium text-sm">{formError}</div>}
                    {formSuccess && <div className="p-3 mb-4 rounded bg-emerald-900/20 border border-emerald-900/50 text-emerald-500 font-medium text-sm">{formSuccess}</div>}

                    <button disabled={loadingForm} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-md transition-colors w-full md:w-auto">
                        {loadingForm ? 'Salvando...' : 'Salvar Veículo'}
                    </button>
                </div>
            </form>
        </div>
    )
}
