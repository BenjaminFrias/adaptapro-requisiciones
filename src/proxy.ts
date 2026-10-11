import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login");

  // Si no está autenticado y busca una ruta protegida
  if (!session && !isAuthPage) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }

  // Si ya está autenticado e intenta ir al login
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si está autenticado, validar permisos RBAC de rutas críticas
  if (session?.user) {
    const userRole = session.user.rol;

    // Rutas exclusivas de ADMINISTRADOR
    if (pathname.startsWith("/admin") && userRole !== "ADMINISTRADOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Rutas de APROBADOR (accesibles también por ADMINISTRADOR)
    if (
      pathname.startsWith("/aprobaciones") &&
      userRole !== "APROBADOR" &&
      userRole !== "ADMINISTRADOR"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Rutas de COMPRAS (accesibles también por ADMINISTRADOR)
    if (
      pathname.startsWith("/compras") &&
      userRole !== "COMPRAS" &&
      userRole !== "ADMINISTRADOR"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Interceptar todas las rutas excepto:
     * - api/auth (endpoints de autenticación)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico y archivos públicos estáticos (svg, png, jpg, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
