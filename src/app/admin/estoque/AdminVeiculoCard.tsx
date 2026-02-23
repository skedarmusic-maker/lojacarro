'use client'

import { useState, useTransition } from 'react'

type Veiculo = any // Simplificação, usar type real depois
type LojistaType = any // Simplificação

export default function AdminVeiculoCard({ veiculo, lojaId }: { veiculo: Veiculo, lojaId: string }) {
    const [isPending, startTransition] = useTransition()
    const [emPromocao, setEmPromocao] = useState(!!veiculo.preco_promocional && veiculo.preco_promocional > 0)
    const [precoPromo, setPrecoPromo] = useState(veiculo.preco_promocional ? veiculo.preco_promocional.toString() : '')
    const [salvo, setSalvo] = useState(false)

    // Data formatada para Anunciado Desde
    const dataCadastro = new Date(veiculo.created_at).toLocaleDateString('pt-BR')

    const salvarPromocao = async () => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append('id', veiculo.id)
            if (emPromocao && precoPromo) {
                // Remover formatação se o usuário digitou pontuação (opcional, assume limpo aqui)
                formData.append('preco_promocional', precoPromo.replace(/\D/g, ''))
            } else {
                formData.append('preco_promocional', '')
            }

            // Usaremos a server action atualizada em actions.ts (vamos criá-la)
            const res = await fetch('/api/admin/veiculos/promo', {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                setSalvo(true)
                setTimeout(() => setSalvo(false), 2000)
            }
        })
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">

            {/* Esquerda: Info Principal */}
            <div className="flex gap-4 items-start md:items-center">
                {/* Thumbnail / Image */}
                <div className="w-24 h-24 md:h-16 shrink-0 bg-zinc-800 rounded flex items-center justify-center text-xs text-zinc-600 overflow-hidden">
                    {veiculo.imagens && veiculo.imagens.length > 0 ? (
                        <img src={veiculo.imagens[0]} alt={veiculo.modelo} className="w-full h-full object-cover" />
                    ) : (
                        <span>Sem Foto</span>
                    )}
                </div>

                <div className="flex flex-col justify-between h-full py-1">
                    <div>
                        <h4 className="font-bold text-base">{veiculo.marca} {veiculo.modelo}</h4>
                        <div className="text-zinc-400 text-xs flex gap-3 mt-1">
                            <span>{veiculo.ano_fabricacao}/{veiculo.ano_modelo}</span>
                            <span>•</span>
                            <span>{veiculo.quilometragem} km</span>
                        </div>
                    </div>
                    {/* NOVO: Tempo no Estoque */}
                    <div className="text-xs text-zinc-500 mt-2 font-medium bg-zinc-950/50 inline-block px-2 py-1 rounded w-fit border border-zinc-800/50">
                        Anunciado desde: {dataCadastro}
                    </div>
                </div>
            </div>

            {/* Direita: Preços e Ações */}
            <div className="flex flex-col md:items-end justify-between border-t border-zinc-800 md:border-0 pt-4 md:pt-0 gap-3 md:gap-0 mt-2 md:mt-0">

                {/* Area de Preço e Promoção Toggle */}
                <div className="flex flex-col md:items-end gap-2 w-full">
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full">
                        <div className="text-right">
                            {emPromocao ? (
                                <>
                                    <div className="text-zinc-500 text-xs line-through">
                                        R$ {Number(veiculo.preco).toLocaleString('pt-BR')}
                                    </div>
                                    <div className="text-emerald-500 font-bold text-lg leading-tight">
                                        R$ {precoPromo ? Number(precoPromo).toLocaleString('pt-BR') : '...'}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-emerald-600/50 bg-emerald-950/30 px-1 rounded inline-block">OFERTA</span>
                                </>
                            ) : (
                                <div className="text-zinc-300 font-bold text-lg">
                                    R$ {Number(veiculo.preco).toLocaleString('pt-BR')}
                                </div>
                            )}
                        </div>

                        {/* Toggle Promoção */}
                        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-md border border-zinc-800">
                            <label className="text-xs text-zinc-400 font-medium cursor-pointer flex items-center gap-1.5">
                                <input
                                    type="checkbox"
                                    className="accent-emerald-500"
                                    checked={emPromocao}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked
                                        setEmPromocao(isChecked)
                                        if (!isChecked) {
                                            setPrecoPromo('')
                                            // Se desmarcou, salva imediatamente como "sem promoção"
                                            startTransition(async () => {
                                                const formData = new FormData()
                                                formData.append('id', veiculo.id)
                                                formData.append('preco_promocional', '')
                                                const res = await fetch('/api/admin/veiculos/promo', {
                                                    method: 'POST',
                                                    body: formData
                                                })
                                                if (res.ok) {
                                                    setSalvo(true)
                                                    setTimeout(() => setSalvo(false), 2000)
                                                }
                                            })
                                        }
                                    }}
                                />
                                PROMOÇÃO
                            </label>
                        </div>
                    </div>

                    {/* Feedback visual de salvamento quando desativa */}
                    {!emPromocao && salvo && (
                        <div className="text-[10px] text-emerald-500 font-bold animate-pulse mt-1">
                            PROMOÇÃO REMOVIDA COM SUCESSO!
                        </div>
                    )}

                    {/* Caixa de Input quando a Promoção está ativada */}
                    {emPromocao && (
                        <div className="flex items-center gap-2 mt-2 w-full md:w-auto bg-zinc-950 p-2 rounded border border-emerald-900/30">
                            <span className="text-zinc-500 text-sm pl-2">R$</span>
                            <input
                                type="number"
                                value={precoPromo}
                                onChange={(e) => setPrecoPromo(e.target.value)}
                                placeholder="Novo preço"
                                className="bg-transparent text-white w-24 outline-none text-sm font-bold placeholder:font-normal"
                            />
                            <button
                                onClick={salvarPromocao}
                                disabled={isPending}
                                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${salvo ? 'bg-emerald-600 text-white' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                            >
                                {isPending ? '...' : salvo ? 'SALVO' : 'SALVAR'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Acões Originais (Editar / Excluir) */}
                <form action="/admin/actions/deleteVeiculo" method="POST" className="flex items-center justify-end gap-2 mt-4">
                    <input type="hidden" name="id" value={veiculo.id} />
                    <a href={`/admin/estoque/${veiculo.id}`} className="text-zinc-500 hover:text-blue-400 transition-colors p-2 text-xs font-medium bg-zinc-800 rounded">
                        Editar
                    </a>
                    <button type="submit" className="text-zinc-500 hover:text-red-400 transition-colors p-2 text-xs font-medium bg-zinc-800 rounded">
                        Excluir
                    </button>
                </form>
            </div>
        </div>
    )
}
