import { NextRequest, NextResponse } from "next/server";

// -------------------------------------------------------------------------
// EXPLICIT SYSTEM ROUTE ACCESS MATRICES
// -------------------------------------------------------------------------
const ADMIN_ROUTES = ["/admin manage", "/api/admin"];
const OPERATOR_ROUTES = ["/user manage", "/dashboard", "/api/endpoints"];

export async function proxy(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;

  // 1. PERFORMANCE TRACE: Skip middleware evaluation for static optimization assets
  if (
    currentPath.startsWith("/_next") || 
    currentPath.startsWith("/api/auth") || // Better Auth endpoints must remain completely unrestricted
    currentPath.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. DEFINE HIGH-SECURITY HTTP HEADERS MATRIX MAP
  const requestHeaders = new Headers(req.headers);
  const responseHeaders = new Headers();
  
  responseHeaders.set("X-Frame-Options", "DENY");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-XSS-Protection", "1; mode=block");
  responseHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  responseHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ai-cats.net https://typicode.com;"
  );

  try {
    // 3. EDGE COMPLIANT BETTER AUTH INTERCEPTION
    // We send an absolute fetch request down to the server-side proxy route to decrypt headers.
    const sessionResponse = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    const sessionData = await sessionResponse.json();
    const isAuthenticated = !!sessionData?.user;

    // 4. SECURITY MATRIX LAYER A: UNAUTHENTICATED REDIRECTION FILTER
    if (!isAuthenticated) {
      const isProtectedArea = 
        ADMIN_ROUTES.some(path => currentPath.startsWith(path)) ||
        OPERATOR_ROUTES.some(path => currentPath.startsWith(path));

      if (isProtectedArea) {
        console.warn(`[Edge Guard] Intercepted anonymous navigation attempt to: ${currentPath}. Redirecting...`);
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/";
        redirectUrl.searchParams.set("tab", "home"); // Forces back to the home landing authentication view
        
        const res = NextResponse.redirect(redirectUrl);
        responseHeaders.forEach((value, key) => res.headers.set(key, value));
        return res;
      }

      // Safe fallback frame for unauthenticated public traffic
      const res = NextResponse.next({ request: { headers: requestHeaders } });
      responseHeaders.forEach((value, key) => res.headers.set(key, value));
      return res;
    }

    // 5. SECURITY MATRIX LAYER B: POLICY-CENTRIC RBAC VERIFICATION MATCHES
    const rbacResponse = await fetch(`${req.nextUrl.origin}/api/admin/hierarchy`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    const isAdmin = rbacResponse.status === 200;

    // If a standard worker tries to browse administrative paths, bounce them out to their safe tracking panel
    if (ADMIN_ROUTES.some(path => currentPath.startsWith(path)) && !isAdmin) {
      console.warn(`[Edge Guard] Blocked standard user profile from accessing admin route: ${currentPath}`);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("tab", "user manage");
      
      const res = NextResponse.redirect(redirectUrl);
      responseHeaders.forEach((value, key) => res.headers.set(key, value));
      return res;
    }

    // 6. PIPELINE EXIT: Stitch security elements onto network headers
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    responseHeaders.forEach((value, key) => res.headers.set(key, value));
    return res;

  } catch (error: any) {
    console.error("[Edge Runtime Intercept Exception]:", error.message);
    
    // FAIL-SAFE FALLBACK: Ensure the project continues running if external authorization loops lag
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    responseHeaders.forEach((value, key) => res.headers.set(key, value));
    return res;
  }
}

// -------------------------------------------------------------------------
// MATCH PATTERN CONFIGURATIONS
// -------------------------------------------------------------------------
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
