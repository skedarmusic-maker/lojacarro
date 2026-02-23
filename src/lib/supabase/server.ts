import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // As instruções set() irão falhar em Server Components
                        // Isso geralmente é ignorável, pois os dados vêm de Middleware antes
                    }
                },
            },
        }
    )
}

export async function getLojaBySlug(slug: string) {
    const supabase = await createClient()

    const { data: loja } = await supabase
        .from('perfis_lojas')
        .select('*')
        .or(`slug.eq.${slug},custom_domain.eq.${slug}`)
        .maybeSingle()

    return loja
}
