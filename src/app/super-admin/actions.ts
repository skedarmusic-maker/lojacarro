'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLojaStatus(formData: FormData): Promise<void> {
    const supabase = await createClient()

    // Validação de autenticação
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error('Unauthorized toggle attempt')
        return
    }

    // Validação se é Super Admin Real (Não podemos confiar apenas na revalidação UI)
    const { data: adminCheck } = await supabase
        .from('perfis_lojas')
        .select('is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle()

    if (!adminCheck || adminCheck.is_super_admin !== true) {
        console.error('Forbidden toggle attempt')
        return
    }

    // Executa a alteração
    const lojaId = formData.get('lojaId') as string
    const currentStateStr = formData.get('currentState') as string
    const currentState = currentStateStr === 'true'

    const novoStatus = !currentState

    const { error } = await supabase
        .from('perfis_lojas')
        .update({ ativo: novoStatus })
        .eq('id', lojaId)

    if (error) {
        console.error("Error toggling loja status:", error)
        return
    }

    revalidatePath('/super-admin')
    revalidatePath('/', 'layout') // Garantimos que a cache das lojas seja recarregada 
    return
}
