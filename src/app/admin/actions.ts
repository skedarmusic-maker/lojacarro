'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Valores reais em producao (isso é mockup/validacao simples)
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/admin/login?message=Não foi possível autenticar o usuário')
    }

    revalidatePath('/admin/dashboard', 'layout')
    redirect('/admin/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error, data: authData } = await supabase.auth.signUp(data)

    if (error) {
        console.error("Signup Auth Error:", error)
        redirect('/admin/login?message=Não foi possível criar a conta')
    }

    if (authData?.user?.id) {
        const defaultSlug = data.email.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000)

        const { error: insertError } = await supabase.from('perfis_lojas').insert({
            user_id: authData.user.id,
            nome: 'Minha Nova Loja',
            slug: defaultSlug
        });

        if (insertError) {
            console.error("Insert Perfil Loja Error:", insertError)
        }
    }
    revalidatePath('/admin/dashboard', 'layout')
    redirect('/admin/dashboard')
}
