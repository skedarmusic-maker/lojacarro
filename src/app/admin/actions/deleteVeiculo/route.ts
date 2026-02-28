import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const formData = await request.formData()
    const id = formData.get('id') as string

    if (!id) {
        return redirect('/admin/estoque')
    }

    const supabase = await createClient()

    // O RLS do Supabase garante que mesmo recebendo só ID,
    // ele só vai apagar se a linha pertencer à loja do Lojista Logado.
    await supabase.from('veiculos').delete().eq('id', id)

    // Revalidar a página de estoque
    revalidatePath('/admin/estoque')

    // Redirecionar de volta
    return redirect('/admin/estoque')
}
