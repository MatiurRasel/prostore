// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ Fetch session using next-auth
  const session = await auth();

  // ✅ Allow static files and public pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/sign-in' ||
    pathname === '/unauthorized'
  ) {
    return NextResponse.next();
  }

  // ✅ Define protected paths
  const protectedPaths = [
    /^\/admin/,
    /^\/profile/,
    /^\/shipping-address/,
    /^\/payment-method/,
    /^\/place-order/,
    /^\/order/,
    /^\/user/,
  ];

  const isProtected = protectedPaths.some((regex) => regex.test(pathname));

  // 🔐 Redirect to /sign-in if trying to access protected routes without a session
  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // 🚫 Block non-admin users from /admin
  if (pathname.startsWith('/admin') && session?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

// ✅ Optional matcher to optimize performance
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
