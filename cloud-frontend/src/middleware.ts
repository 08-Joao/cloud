import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE_NAME = 'accessToken'

// Define as rotas públicas (que qualquer um pode acessar)
const publicRoutes = [
  '/',
]

// Função para verificar se a rota é pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignora requisições de arquivos estáticos e imagens
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)

  // Detecta ambiente (produção vs local)
  const isProduction = process.env.NODE_ENV === 'production'
  const authBaseUrl = isProduction
    ? 'https://auth.tehkly.com'
    : 'http://localhost:3004'

  // Rotas públicas: permite acesso independente de estar logado ou não
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Usuário não logado tentando acessar rota protegida → redireciona para login
  if (!sessionCookie) {
    const signinUrl = `${authBaseUrl}/signin?redirect=${encodeURIComponent(request.url)}`
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}