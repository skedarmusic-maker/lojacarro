import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
// import { updateSession } from '@/lib/supabase/middleware' // Para o futuro Auth

export async function middleware(req: NextRequest) {
    const url = req.nextUrl
    const hostname = req.headers.get('host') || ''

    // 1. Logica de Sessão do Admin
    let response = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Se tentar acessar rota protegida (/admin/* ou /super-admin/*) sem ser login
    if ((url.pathname.startsWith('/admin') || url.pathname.startsWith('/super-admin')) && !url.pathname.startsWith('/admin/login')) {
        if (!user) {
            // Força login se não tem sessao
            const destination = new URL('/admin/login', req.url)
            return NextResponse.redirect(destination)
        }
    }

    // 2. Limpar e estruturar hostnames para Multi-tenant
    // Dominio base, ex: 'plataforma.com' (usando o local temporariamente)
    const currentHost = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
        ? hostname.replace(`.venda-carros.vercel.app`, '')
        : hostname.replace(`.localhost:3000`, '')

    const isLocalhost = hostname.includes('localhost')

    // 3. Definir o Tenant Slug
    // Regra SaaS:
    // - Se currentHost == 'localhost:3000' ou 'base.com': Rota principal (institucional ou login do Painel Master)
    // - Se currentHost tiver subdominio ou dominio custom: Rota do lojista (ex: marinhosveiculos.base.com -> tenant_slug = 'marinhosveiculos')
    let tenantSlug = currentHost

    // Se for o dominio provisorio da Hostinger ou localhost, consideramos como RAIZ
    const isRootDomain =
        hostname.includes('localhost') ||
        hostname.includes('hostingersite.com') ||
        hostname === 'plataforma.com'

    if (!isRootDomain) {
        // Evita loop infinito: se o pathname já começa com o tenantSlug, não reescreve de novo
        if (url.pathname.startsWith(`/${tenantSlug}`)) {
            return NextResponse.next()
        }

        // É uma vitrine! Redireciona de forma invisível para o folder genérico app/[tenantId]
        // A pagina no tenantSlug vai pegar e bater no banco pra ler a loja e checar se está ATIVA.
        // O layout do [tenantId] faz a checagem 'ativo' e exibe tela de Suspenso, então deixamos passar
        return NextResponse.rewrite(new URL(`/${tenantSlug}${url.pathname}${url.search}`, req.url))
    }

    // Se for raiz, vai normal (cairá no app/page.tsx, /admin, ou /super-admin)
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         * - public (qualquer asset estático na raiz)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:ico|png|jpg|jpeg|svg|webp)$).*)',
    ],
}
