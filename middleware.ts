import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/', '/waiting', '/api/openai', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req });
  // No session → redirect to home (or sign-in page later)
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Pending members cannot access admin or protected writer routes
  const status = token.membershipStatus as string | undefined;
  if (pathname.startsWith('/admin')) {
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/waiting', req.url));
    }
  }

  if (status === 'pending') {
    // Block access to protected app areas when pending
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/events') ||
      pathname.startsWith('/ai')
    ) {
      return NextResponse.redirect(new URL('/waiting', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/|.*\.(?:png|jpg|jpeg|svg|gif|ico|css|js|map)|favicon.ico).*)',
  ],
};
