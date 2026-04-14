import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas que requieren solo estar autenticado
const PROTECTED_ROUTES = ['/checkout', '/orders']

// Rutas que requieren rol de administrador
const ADMIN_ROUTES = ['/admin']

// Rutas de autenticación (redirigir si ya está logueado)
const AUTH_ROUTES = ['/login', '/register']

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Evita que la app sea embebida en iframes (clickjacking)
  response.headers.set('X-Frame-Options', 'DENY')
  // Evita que el navegador adivine el tipo de contenido
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Controla información del referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Permisos del navegador
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  return response
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Obtener usuario autenticado de forma segura
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Si el usuario está autenticado y trata de acceder a login/register
  // lo redirigimos al inicio
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL('/', request.url)
    return addSecurityHeaders(NextResponse.redirect(redirectUrl))
  }

  // Rutas protegidas — requieren autenticación
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user || error) {
      const redirectUrl = new URL('/login', request.url)
      // Guardamos la ruta original para redirigir después del login
      redirectUrl.searchParams.set('redirectTo', pathname)
      return addSecurityHeaders(NextResponse.redirect(redirectUrl))
    }
  }

  // Rutas de admin — requieren autenticación y rol admin
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user || error) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return addSecurityHeaders(NextResponse.redirect(redirectUrl))
    }

    // Verificar rol de administrador desde los metadatos del usuario
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      // Si está autenticado pero no es admin, redirigir al inicio
      return addSecurityHeaders(NextResponse.redirect(new URL('/', request.url)))
    }
  }

  return addSecurityHeaders(supabaseResponse)
}