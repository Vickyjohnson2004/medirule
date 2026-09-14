import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const protectedPrefixes = ['/dashboard', '/assessment', '/history', '/results', '/admin', '/settings'];
  const needsAuth = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!needsAuth) return NextResponse.next();
  if (!request.cookies.get('medirule_access')?.value) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/assessment/:path*', '/history/:path*', '/results/:path*', '/admin/:path*', '/settings/:path*'] };
