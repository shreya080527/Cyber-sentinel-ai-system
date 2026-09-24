import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cyber-sentinel-super-secret-jwt-key-2026-secure-production-hash'
);

function getRoleDefaultDashboard(role: string): string {
  switch (role) {
    case 'student_user':
      return '/student/dashboard';
    case 'senior_citizen':
      return '/senior/dashboard';
    case 'cybersecurity_analyst':
      return '/analyst/dashboard';
    case 'administrator':
      return '/admin/dashboard';
    case 'registered_user':
    default:
      return '/registered/dashboard';
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cyber_sentinel_token')?.value;

  let session: any = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET_KEY);
      session = verified.payload;
    } catch {
      session = null;
    }
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPath = 
    pathname.startsWith('/registered') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/senior') ||
    pathname.startsWith('/analyst') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/report-incident');

  // 1. Unauthenticated user trying to access protected routes
  if (isProtectedPath && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to access login/register pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL(getRoleDefaultDashboard(session.role), request.url));
  }

  // 3. Strict Role-Based Access Control (RBAC) & Boundary Enforcement
  if (session) {
    // Administrator has access to all admin routes & monitoring
    if (pathname.startsWith('/admin') && session.role !== 'administrator') {
      return NextResponse.redirect(new URL(getRoleDefaultDashboard(session.role), request.url));
    }

    // Cybersecurity Analyst routes
    if (pathname.startsWith('/analyst') && session.role !== 'cybersecurity_analyst' && session.role !== 'administrator') {
      return NextResponse.redirect(new URL(getRoleDefaultDashboard(session.role), request.url));
    }

    // Senior Citizen routes
    if (pathname.startsWith('/senior') && session.role !== 'senior_citizen' && session.role !== 'administrator') {
      return NextResponse.redirect(new URL(getRoleDefaultDashboard(session.role), request.url));
    }

    // Student User routes
    if (pathname.startsWith('/student') && session.role !== 'student_user' && session.role !== 'administrator') {
      return NextResponse.redirect(new URL(getRoleDefaultDashboard(session.role), request.url));
    }

    // Registered User routes
    if (pathname.startsWith('/registered') && session.role !== 'registered_user' && session.role !== 'administrator') {
      return NextResponse.redirect(new URL(getRoleDefaultDashboard(session.role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/registered/:path*',
    '/student/:path*',
    '/senior/:path*',
    '/analyst/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/report-incident/:path*',
    '/login',
    '/register',
  ],
};
