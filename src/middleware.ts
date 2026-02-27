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

    // 2. Definir domínios conhecidos como RAIZ (Plataforma Master)
    const rootDomains = [
        'localhost:3000',
        '127.0.0.1:3000',
        'silver-starling-801980.hostingersite.com',
        'hostingersite.com',
        'plataforma.com'
    ]

    // Se o hostname for exatamente um dos rootDomains, é a plataforma principal
    const isRootDomain = rootDomains.includes(hostname)

    // 3. Estruturar o Tenant Slug para Multi-tenant (subdomínios)
    let tenantSlug = ''

    if (!isRootDomain) {
        // Tenta descobrir qual o domínio base que o usuário está usando
        const baseDomain = rootDomains.find(rd => hostname.endsWith(`.${rd}`))

        if (baseDomain) {
            // Se for um subdomínio de um domínio raiz (ex: loja.localhost:3000)
            tenantSlug = hostname.replace(`.${baseDomain}`, '')
        } else {
            // Se for um domínio customizado que não está na lista raiz (ex: lojadocarro.com.br)
            tenantSlug = hostname
        }
    }

    // 4. Fallback: Suporte para rota /v/:slug (ex: plataforma.com/v/marinhos)
    // Útil quando o subdomínio não está configurado no DNS
    if (isRootDomain && url.pathname.startsWith('/v/')) {
        const segments = url.pathname.split('/')
        const pathSlug = segments[2]

        if (pathSlug) {
            // Remove o prefixo /v/:slug do path real para passar pro reescritor
            const remainingPath = '/' + segments.slice(3).join('/')
            return NextResponse.rewrite(new URL(`/${pathSlug}${remainingPath}${url.search}`, req.url))
        }
    }

    // 5. Redirecionamento/Reescrita via Subdomínio
    if (!isRootDomain && tenantSlug) {
        // Evita loop infinito: se o pathname já começa com o tenantSlug, não reescreve de novo
        if (url.pathname.startsWith(`/${tenantSlug}`)) {
            return NextResponse.next()
        }

        // É uma vitrine! Redireciona de forma invisível para o folder genérico app/[tenantId]
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
