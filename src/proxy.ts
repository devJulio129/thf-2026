import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca el token de sesion en cada navegacion y protege las rutas privadas.
 *
 * Los Server Components no pueden escribir cookies, asi que si el refresco no
 * ocurriera aqui la sesion se caeria al expirar el access token.
 *
 * En Next 16 esto se llama "proxy"; era "middleware" en versiones anteriores.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // /admin comprueba ademas el rol dentro de la propia pagina; aqui solo se
  // exige haber iniciado sesion.
  if (!user && (pathname.startsWith("/perfil") || pathname.startsWith("/admin"))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    // Para devolverlo a donde iba despues de entrar.
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (user && pathname === "/login") {
    const perfil = request.nextUrl.clone();
    perfil.pathname = "/perfil";
    perfil.search = "";
    return NextResponse.redirect(perfil);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Todo salvo estaticos y los prototipos. Importante dejar fuera
     * /api/webhooks: Mercado Pago no trae cookies de sesion y no debe pasar por
     * el refresco de auth.
     */
    "/((?!_next/static|_next/image|favicon.ico|prototipo|api/webhooks|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|js|css)$).*)",
  ],
};
