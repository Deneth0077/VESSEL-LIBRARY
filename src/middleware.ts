import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow Next.js static assets, Webpack chunks, CSS, images, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Public auth routes & API auth routes
  const publicRoutes = ['/login', '/register', '/pending', '/admin/login'];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/api/auth');

  if (isPublicRoute || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 3. Protected routes requirement check
  const token = request.cookies.get('vessel_lib_token')?.value;

  if (!token) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
