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

export async function updateAccountPassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const passwordConfirm = formData.get('passwordConfirm') as string

    if (!password || password.length < 6) {
        redirect('/admin/config?error=A senha deve ter pelo menos 6 caracteres')
    }

    if (password !== passwordConfirm) {
        redirect('/admin/config?error=As senhas não conferem')
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        console.error("Update Password Error:", error)
        redirect('/admin/config?error=Não foi possível atualizar a senha')
    }

    redirect('/admin/config?message=Senha atualizada com sucesso!')
}

export async function updateAccountEmail(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        redirect('/admin/config?error=O email é obrigatório')
    }

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
        console.error("Update Email Error:", error)
        redirect('/admin/config?error=Não foi possível atualizar o email')
    }

    redirect('/admin/config?message=Verifique seu novo email para confirmar a alteração')
}
