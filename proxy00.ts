 
 import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;

  // Asset skip parameters loop logic optimizer
  if (currentPath.startsWith("/_next") || currentPath.startsWith("/api/auth") || currentPath.includes(".")) {
    return NextResponse.next();
  }

  // Define strict security parameters headers matrix map
  const securityHeaders = new Headers();
  
  // 1. Defends against Clickjacking framing parameters vulnerabilities
  securityHeaders.set("X-Frame-Options", "DENY");
  
  // 2. Blocks browsers from executing sniffing loops on payload type overrides
  securityHeaders.set("X-Content-Type-Options", "nosniff");
  
  // 3. XSS Filter enforcement matrix for fallback legacy web agents
  securityHeaders.set("X-XSS-Protection", "1; mode=block");
  
  // 4. Force strict browser HTTPS connections
  securityHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  
  // 5. Strict Content Security Policy (CSP) baseline matrix rule framework bounds
  securityHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ai-cats.net https://typicode.com;"
  );

  // Clone active response tree to stitch meta matrix elements cleanly
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Inject security configurations onto network pipelines on exit
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
