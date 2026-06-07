import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'admin_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('Proxy checking pathname:', pathname);

  // Check if the request is for /backend routes (except login)
  if (pathname.startsWith('/backend') && pathname !== '/backend/login') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    console.log('Session cookie:', sessionCookie ? 'Found' : 'Not found');

    if (!sessionCookie) {
      // Redirect to login if no session
      console.log('Redirecting to login - no session cookie');
      return NextResponse.redirect(new URL('/backend/login', request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      console.log('Session parsed:', session);
      
      // Verify session has required fields
      if (!session.userId || !session.email || !session.role) {
        console.log('Redirecting to login - invalid session');
        return NextResponse.redirect(new URL('/backend/login', request.url));
      }
    } catch (error) {
      // Invalid session format, redirect to login
      console.log('Redirecting to login - parse error', error);
      return NextResponse.redirect(new URL('/backend/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/backend/:path*',
};
