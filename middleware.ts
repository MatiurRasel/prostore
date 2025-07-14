// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/sign-in' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/api/') ||
    pathname === '/' ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/category/') ||
    pathname.startsWith('/search') ||
    pathname === '/cart' ||
    pathname.startsWith('/shipping-address') ||
    pathname.startsWith('/payment-method') ||
    pathname.startsWith('/place-order')
  ) {
    return NextResponse.next();
  }

  // Check for protected paths
  const protectedPaths = [
    /^\/admin/,
    /^\/profile/,
    /^\/order/,
    /^\/user/,
  ];

  const isProtected = protectedPaths.some((regex) => regex.test(pathname));

  // Check for session token - try multiple cookie names that NextAuth might use
  const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                      req.cookies.get('__Secure-next-auth.session-token')?.value ||
                      req.cookies.get('authjs.session-token')?.value ||
                      req.cookies.get('__Secure-authjs.session-token')?.value ||
                      req.cookies.get('next-auth.csrf-token')?.value;

  // For debugging - log the request details
  console.log('Middleware Debug:', {
    pathname,
    isProtected,
    hasSessionToken: !!sessionToken,
    sessionToken: sessionToken ? 'exists' : 'missing'
  });

  // Redirect to sign-in if accessing protected routes without session
  if (!sessionToken && isProtected) {
    console.log('Middleware: Redirecting to sign-in from', pathname);
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
