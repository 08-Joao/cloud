import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// O nome do seu cookie de autenticação
const AUTH_COOKIE_NAME = 'accessToken';

// 1. Especifique as rotas públicas (que não exigem login)
const PUBLIC_ROUTES = ['/signin', '/signup', '/signout'];

// 2. Função para verificar se a rota é pública
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isPublic = isPublicRoute(pathname);

  // Lógica de redirecionamento para usuários LOGADOS
  // Se o cookie de sessão existe e o usuário tenta acessar uma rota pública...
  if (sessionCookie && isPublic) {
    // ...redireciona para o dashboard.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Lógica de redirecionamento para usuários DESLOGADOS
  // Se o cookie não existe e o usuário tenta acessar uma rota privada...
  if (!sessionCookie && !isPublic) {
    // ...redireciona para a página de login.
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Se nenhuma das condições acima for atendida, permite que a requisição continue.
  return NextResponse.next();
}

// O matcher define em QUAIS rotas o middleware será executado.
// Isso evita que o middleware rode em requisições desnecessárias (ex: imagens, arquivos estáticos).
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto as que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (ícone de favoritos)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
