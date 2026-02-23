import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import EditImagesClient from './EditImagesClient'

type PageProps = {
    params: Promise<{ veiculoId: string }>
}

export default async function EditarVeiculoPage({ params }: PageProps) {
    const { veiculoId } = await params
    const supabase = await createClient()

    // Buscar dados do veículo
    const { data: veiculo } = await supabase
        .from('veiculos')
        .select('*')
        .eq('id', veiculoId)
        .single()

    if (!veiculo) {
        redirect('/admin/estoque')
    }

    // Server Action para salvar as edições
    async function updateVeiculo(formData: FormData) {
        'use server'
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const fotos = formData.getAll('fotos') as File[];

        // Pega as imagens existentes e reordenadas do Client Component
        const existingImagensJson = formData.get('existing_imagens') as string | null;
        let imagens: string[] = existingImagensJson ? JSON.parse(existingImagensJson) : (veiculo.imagens || []);

        // Limita ao máximo de 8 fotos considerando o que já existe
        const fotosToUpload = fotos.filter(f => f.size > 0).slice(0, Math.max(0, 8 - imagens.length));

        if (fotosToUpload.length > 0 && user) {
            const uploadPromises = fotosToUpload.map(async (foto) => {
                const fileExt = foto.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                const fileBuffer = await foto.arrayBuffer()

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('veiculos')
                    .upload(fileName, fileBuffer, {
                        contentType: foto.type,
                        upsert: false
                    })

                if (!uploadError && uploadData) {
                    const { data: publicUrlData } = supabase.storage.from('veiculos').getPublicUrl(uploadData.path)
                    return publicUrlData.publicUrl
                }
                return null
            })

            const uploadedUrls = await Promise.all(uploadPromises)
            imagens = [...imagens, ...(uploadedUrls.filter(url => url !== null) as string[])]
        }

        const updatedData = {
            marca: formData.get('marca') as string,
            modelo: formData.get('modelo') as string,
            ano_fabricacao: Number(formData.get('ano_fabricacao')),
            ano_modelo: Number(formData.get('ano_modelo')),
            preco: Number(formData.get('preco')),
            quilometragem: Number(formData.get('km')) || 0,
            categoria: formData.get('categoria') as string || 'Outros',
            descricao: formData.get('descricao') as string,
            status: formData.get('status') as string,
            imagens: imagens
        }

        const { error } = await supabase
            .from('veiculos')
            .update(updatedData)
            .eq('id', veiculoId)

        if (!error) {
            revalidatePath('/admin/estoque')
            revalidatePath(`/[tenantId]/v/${veiculoId}`, 'page')
            redirect('/admin/estoque')
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex text-sm">
            <aside className="w-64 border-r border-zinc-800 bg-[#0f0f0f] hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="font-bold text-lg">Menu Admin</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"> Visão Geral </a>
                    <a href="/admin/estoque" className="block px-4 py-2.5 bg-zinc-800 text-white rounded-md font-medium"> Meu Estoque </a>
                    <a href="/admin/config" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md font-medium transition-colors"> Configurações </a>
                </nav>
            </aside>

            <main className="flex-1 overflow-auto">
                <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between px-8 sticky top-0 backdrop-blur-md">
                    <h1 className="text-xl font-semibold">Editar Veículo</h1>
                    <a href="/admin/estoque" className="text-zinc-400 hover:text-white transition-colors">Voltar</a>
                </header>

                <div className="p-8 max-w-3xl">
                    <div className="bg-[#141414] border border-zinc-800 rounded-xl p-8 shadow-xl">
                        <form action={updateVeiculo} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Marca</label>
                                    <input required name="marca" defaultValue={veiculo.marca} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Modelo</label>
                                    <input required name="modelo" defaultValue={veiculo.modelo} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ano Fabr.</label>
                                    <input required name="ano_fabricacao" type="number" defaultValue={veiculo.ano_fabricacao} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ano Mod.</label>
                                    <input required name="ano_modelo" type="number" defaultValue={veiculo.ano_modelo} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Quilometragem</label>
                                    <input required name="km" type="number" defaultValue={veiculo.quilometragem} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
                                    <select required name="categoria" defaultValue={veiculo.categoria || 'Outros'} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all">
                                        <option value="Carros elétricos">Carros elétricos</option>
                                        <option value="Hatches">Hatches</option>
                                        <option value="Picapes">Picapes</option>
                                        <option value="Sedans">Sedans</option>
                                        <option value="SUVs">SUVs</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Preço (R$)</label>
                                    <input required name="preco" type="number" defaultValue={veiculo.preco} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</label>
                                    <select name="status" defaultValue={veiculo.status} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all">
                                        <option value="disponivel">Disponível</option>
                                        <option value="vendido">Vendido</option>
                                        <option value="oculto">Oculto</option>
                                    </select>
                                </div>
                            </div>

                            {/* Componente Interativo de Reordenação e Exclusão de Fotos */}
                            <EditImagesClient imagensIniciais={veiculo.imagens || []} />

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição/Detalhes</label>
                                <textarea name="descricao" rows={4} defaultValue={veiculo.descricao} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Adicionar Mais Fotos (Até 8 no total)</label>
                                <input type="file" name="fotos" multiple accept="image/*" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer text-sm" />
                                <p className="text-xs text-zinc-500 mt-1">As fotos enviadas aqui serão adicionadas ao final da galeria atual.</p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="submit" className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all">
                                    Salvar Alterações
                                </button>
                                <a href="/admin/estoque" className="flex-1 bg-zinc-900 text-zinc-400 font-bold py-4 rounded-xl text-center border border-zinc-800 hover:text-white transition-all">
                                    Cancelar
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
