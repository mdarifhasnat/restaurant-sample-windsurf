import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for /backend routes (except login)
  if (pathname.startsWith('/backend') && pathname !== '/backend/login') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/backend/login', request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      
      // Verify session has required fields and ADMIN role
      if (!session.userId || !session.email || !session.role || session.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/backend/login', request.url));
      }
    } catch (error) {
      // Invalid session format, redirect to login
      return NextResponse.redirect(new URL('/backend/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/backend/:path*',
};
