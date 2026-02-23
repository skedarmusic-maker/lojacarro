import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
    const supabase = await createClient()

    // Validação de auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const id = formData.get('id') as string
        const preco_promocional = formData.get('preco_promocional') as string

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // Se for string vazia ou undefined, definimos como null. Senão convertemos pra numero
        const valPromo = preco_promocional ? parseInt(preco_promocional, 10) : null

        const { error } = await supabase
            .from('veiculos')
            .update({ preco_promocional: valPromo })
            .eq('id', id)
        // Apolicy do Supabase já vai barrar se o id não pertencer ao lojista logado.

        if (error) {
            console.error('Update Promocao Error:', error)
            return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
        }

        revalidatePath('/admin/estoque')
        revalidatePath('/', 'layout') // Revalida a vitrine pública e todas as rotas
        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error('POST Promocao Exception:', e)
        return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }
}
