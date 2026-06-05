import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const isAuth = !!user
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/results') ||
        request.nextUrl.pathname.startsWith('/phases') ||
        request.nextUrl.pathname.startsWith('/matches')

    if (!isAuth && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuth && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isAdminRoute && isAuth) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}