import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase atado a la sesion del usuario que hizo el request.
 *
 * Todo lo que pase por aqui respeta RLS, que es lo que queremos para lectura y
 * escritura hechas por el propio atleta. Para lo que tiene que saltarse RLS
 * (el webhook de pagos) esta admin.ts, y no se usa en ningun otro lado.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Los Server Components no pueden escribir cookies. No pasa nada:
            // el middleware ya refresco la sesion antes de llegar aqui.
          }
        },
      },
    },
  );
}

/** Devuelve el usuario autenticado, o null. */
export async function getCurrentUser() {
  const supabase = await createClient();
  // getUser() valida el token contra el servidor de auth. getSession() lee la
  // cookie sin verificarla, asi que no sirve para decidir permisos.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
