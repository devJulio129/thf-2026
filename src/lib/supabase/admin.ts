import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service role: SE SALTA RLS POR COMPLETO.
 *
 * Existe para un solo caso: el webhook de Mercado Pago, que confirma pagos y por
 * definicion no actua en nombre de ningun usuario logueado. No lo importes en
 * ningun otro lugar, y menos en codigo que llegue al navegador — el import de
 * "server-only" hace que el build truene si alguien lo intenta.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para el cliente admin.",
    );
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
