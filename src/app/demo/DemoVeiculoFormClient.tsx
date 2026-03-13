'use client'

import { useState } from 'react'
import { fetchPlacaDemoAction, submitDemoVeiculo } from './actions/demo_actions'
import { compressImageToWebmotorsStandard } from '@/lib/imageCompressor'

export default function DemoVeiculoFormClient() {
    const [loadingPlaca, setLoadingPlaca] = useState(false)
    const [loadingForm, setLoadingForm] = useState(false)
    const [placaInput, setPlacaInput] = useState('')
    const [placaError, setPlacaError] = useState('')
    const [formError, setFormError] = useState('')
    
    // Sucesso - Para redirecionar e mostrar o carro
    const [successUrl, setSuccessUrl] = useState('')

    // Form states
    const [marca, setMarca] = useState('')
    const [modelo, setModelo] = useState('')
    const [anoFab, setAnoFab] = useState('')
    const [anoMod, setAnoMod] = useState('')
    const [preco, setPreco] = useState('')
    const [precoFipe, setPrecoFipe] = useState('')
    const [personalizarPreco, setPersonalizarPreco] = useState(false)
    const [km, setKm] = useState('')
    const [cor, setCor] = useState('')
    const [combustivel, setCombustivel] = useState('')
    const [cambio, setCambio] = useState('')
    const [chassi, setChassi] = useState('')
    const [renavam, setRenavam] = useState('')
    const [placa, setPlaca] = useState('')
    const [municipio, setMunicipio] = useState('')
    const [uf, setUf] = useState('')
    const [potencia, setPotencia] = useState('')
    const [cilindradas, setCilindradas] = useState('')

    const handleBuscarPlaca = async (e: React.FormEvent) => {
        e.preventDefault()
        setPlacaError('')
        setSuccessUrl('')

        if (!placaInput || placaInput.length < 7) {
            setPlacaError('Digite uma placa válida.')
            return
        }

        setLoadingPlaca(true)
        const result = await fetchPlacaDemoAction(placaInput)

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
            setCor(carro.cor || '')
            setCombustivel(carro.combustivel || '')
            setCambio(carro.cambio || '')
            setChassi(carro.chassi || '')
            setRenavam(carro.renavam || '')
            setPlaca(carro.placa || placaInput)
            setMunicipio(carro.municipio || '')
            setUf(carro.uf || '')
            setPotencia(carro.potencia || '')
            setCilindradas(carro.cilindradas || '')

            if (carro.preco_fipe && carro.preco_fipe > 0) {
                setPrecoFipe(carro.preco_fipe.toString())
                setPreco(carro.preco_fipe.toString())
            }
        }

        setLoadingPlaca(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormError('')
        setSuccessUrl('')
        setLoadingForm(true)

        const formData = new FormData(e.currentTarget)

        try {
            // Interceptar e comprimir imagens orignais no client-side
            const originPhotos = formData.getAll('fotos') as File[]
            formData.delete('fotos') 

            // Validação visual e bloqueio para Demo
            const arquivosDeFoto = originPhotos.filter(p => p.size > 0 && p.type.startsWith('image/'))
            if (arquivosDeFoto.length > 5) {
               setFormError("Para a demonstração, por favor envie no máximo 5 fotos do veículo.")
               setLoadingForm(false)
               return
            }

            for (const photo of originPhotos) {
                if (photo.size > 0 && photo.type.startsWith('image/')) {
                    const compressedFile = await compressImageToWebmotorsStandard(photo)
                    formData.append('fotos', compressedFile)
                } else if (photo.size > 0) {
                    formData.append('fotos', photo)
                }
            }
        } catch (error: any) {
            console.error("Erro na compressão de imagem:", error)
            setFormError("Falha ao processar as imagens antes do envio.")
            setLoadingForm(false)
            return
        }

        const result = await submitDemoVeiculo(formData)

        if (result?.error) {
            setFormError(result.error)
        } else if (result?.success && result.urlDestino) {
            setSuccessUrl(result.urlDestino)
            // Mostrar a URL de sucesso desabilitando o submit
        }

        setLoadingForm(false)
    }

    if (successUrl) {
        return (
            <div className="bg-[#141414] border border-emerald-900/50 rounded-xl p-8 mb-12 text-center shadow-lg shadow-emerald-900/10">
                <div className="w-16 h-16 bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🎉
                </div>
                <h2 className="text-2xl font-bold mb-2">Veículo Publicado com Sucesso!</h2>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    A mágica aconteceu. O seu veículo de teste já está ativo na nossa vitrine pública, pronto para receber acessos reais.
                </p>

                <a 
                    href={successUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-lg transition-transform hover:scale-105"
                >
                    Ver Meu Veículo Online 
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                </a>

                <div className="mt-8 pt-8 border-t border-zinc-800">
                    <button 
                        onClick={() => window.location.reload()}
                        className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
                    >
                        + Cadastrar outro carro de teste
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-6 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg tracking-widest">
                MODO DE DEMONSTRAÇÃO
            </div>

            <h2 className="text-lg font-bold mb-4 mt-2">Simule o Cadastro</h2>
            <p className="text-zinc-400 text-sm mb-6">Esta é uma demonstração exata da área administrativa que a sua loja terá.</p>

            {/* Seção Placa FIPE */}
            <div className="mb-6 pb-6 border-b border-zinc-800">
                <label className="text-xs font-medium text-zinc-400 block mb-2">Busca Inteligente por Placa</label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        value={placaInput}
                        onChange={(e) => setPlacaInput(e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, ''))}
                        maxLength={7}
                        placeholder="Ex: MUT6002 (Teste do Sistema)"
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
                <p className="text-zinc-500 text-xs mt-2">Puxa automaticamente dados e valor da tabela FIPE. (Placas falsas provisórias para teste: LSU3J43, MUT6002)</p>
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

                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1 border border-zinc-800 p-3 rounded-md bg-zinc-900/50">
                    <label className="text-xs font-medium text-emerald-500 mb-1 flex items-center justify-between">
                        Valor FIPE (R$)
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={personalizarPreco}
                                onChange={(e) => setPersonalizarPreco(e.target.checked)}
                                className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 max-w-4 max-h-4 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                            />
                            <span className="text-[10px] text-zinc-400">Vender Abaixo/Acima</span>
                        </label>
                    </label>
                    <input type="hidden" name="preco_fipe" value={precoFipe} />

                    {!personalizarPreco ? (
                        <input
                            required
                            name="preco"
                            value={precoFipe || preco}
                            readOnly
                            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-emerald-400 font-bold outline-none cursor-not-allowed"
                        />
                    ) : (
                        <div className="flex gap-2 items-center mt-2 pt-2 border-t border-zinc-800">
                            <div className="w-full">
                                <label className="text-[10px] font-medium text-zinc-500 mb-1 block">Seu Preço (R$)</label>
                                <input
                                    required
                                    name="preco"
                                    value={preco}
                                    onChange={e => setPreco(e.target.value)}
                                    type="number"
                                    placeholder="Ex: 85000"
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                                />
                            </div>
                        </div>
                    )}
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
                    <label className="text-xs font-medium text-zinc-400">Cor</label>
                    <input name="cor" value={cor} onChange={e => setCor(e.target.value)} placeholder="Ex: Branco" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Combustível</label>
                    <input name="combustivel" value={combustivel} onChange={e => setCombustivel(e.target.value)} placeholder="Ex: Flex" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Câmbio</label>
                    <select name="cambio" value={cambio} onChange={e => setCambio(e.target.value)} className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white">
                        <option value="">Selecione...</option>
                        <option value="Manual">Manual</option>
                        <option value="Automático">Automático</option>
                        <option value="CVT">CVT</option>
                        <option value="Automatizado">Automatizado</option>
                        <option value="Semi-automático">Semi-automático</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Categoria</label>
                    <select required name="categoria" defaultValue="Outros" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white">
                        <option value="Carros elétricos">Carros elétricos</option>
                        <option value="Hatches">Hatches</option>
                        <option value="Picapes">Picapes</option>
                        <option value="Sedans">Sedans</option>
                        <option value="SUVs">SUVs</option>
                        <option value="Minivans">Minivans</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Placa</label>
                    <input name="placa" value={placa} onChange={e => setPlaca(e.target.value)} placeholder="ABC1D23" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Chassi</label>
                    <input name="chassi" value={chassi} onChange={e => setChassi(e.target.value)} placeholder="Número do Chassi" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Renavam</label>
                    <input name="renavam" value={renavam} onChange={e => setRenavam(e.target.value)} placeholder="Número do Renavam" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Cidade/UF</label>
                    <div className="flex gap-2">
                        <input name="municipio" value={municipio} onChange={e => setMunicipio(e.target.value)} placeholder="Cidade" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                        <input name="uf" value={uf} onChange={e => setUf(e.target.value.toUpperCase())} maxLength={2} placeholder="UF" className="w-16 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white text-center" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Potência (cv) / Cilindradas</label>
                    <div className="flex gap-2">
                        <input name="potencia" value={potencia} onChange={e => setPotencia(e.target.value)} placeholder="Potência" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                        <input name="cilindradas" value={cilindradas} onChange={e => setCilindradas(e.target.value)} placeholder="CC" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white" />
                    </div>
                </div>

                <div className="space-y-1 lg:col-span-2 border border-purple-900/40 p-3 rounded-md bg-purple-900/10">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="text-purple-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        <label className="text-xs font-medium text-purple-300">Fotos do Veículo (Máx. 5 fotos no modo Demo)</label>
                    </div>
                    <input type="file" name="fotos" multiple accept="image/*" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer text-sm" />
                </div>

                <div className="md:col-span-2 lg:col-span-3 mt-4">
                    {formError && <div className="p-3 mb-4 rounded bg-red-900/20 border border-red-900/50 text-red-500 font-medium text-sm">{formError}</div>}
                    
                    <button disabled={loadingForm} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-md transition-transform hover:scale-[1.02] w-full text-lg shadow-lg shadow-purple-900/20">
                        {loadingForm ? 'Processando Automação e Imagens...' : 'Publicar Veículo Magicamente! 🚀'}
                    </button>
                    <p className="text-center text-xs text-zinc-500 mt-3">Você será redirecionado para a vitrine pública assim que as fotos renderizarem.</p>
                </div>
            </form>
        </div>
    )
}
