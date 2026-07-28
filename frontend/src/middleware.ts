import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const isGuest = request.cookies.get('guest_session_id')?.value;
  
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  if (isAuthRoute) {
    if (token) {
      if (role === 'project_manager') return NextResponse.redirect(new URL('/dashboard/project-manager', request.url));
      if (role === 'team_member') return NextResponse.redirect(new URL('/dashboard/team-member', request.url));
      return NextResponse.redirect(new URL('/dashboard/client', request.url));
    }
    if (isGuest) {
      return NextResponse.redirect(new URL('/dashboard/client', request.url));
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token && !isGuest) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isGuest && request.nextUrl.pathname !== '/dashboard/client') {
      return NextResponse.redirect(new URL('/dashboard/client', request.url));
    }
    if (token && role === 'team_member' && request.nextUrl.pathname.startsWith('/dashboard/project-manager')) {
      return NextResponse.redirect(new URL('/dashboard/team-member', request.url));
    }
    if (token && role === 'client' && request.nextUrl.pathname !== '/dashboard/client') {
       return NextResponse.redirect(new URL('/dashboard/client', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
