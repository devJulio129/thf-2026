import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente para componentes de navegador. Usa la anon key, que es publica por
 * diseno: lo que protege los datos es RLS, no el secreto de esta llave.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
