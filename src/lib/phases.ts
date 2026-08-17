import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { DIVISIONS } from "./thf";

/**
 * Fase de precios vigente, leida de la vista current_phase.
 *
 * La fase la decide el staff con los botones del panel de admin; aqui solo se
 * consulta. Todo precio que se PINTE en la interfaz debe salir de aqui, para
 * que lo mostrado coincida siempre con lo que el trigger va a cobrar.
 */
export type CurrentPhase = {
  phase: number;
  label: string;
  priceCM: number;
  priceOP: number;
  paidPairs: number;
  /** Tope del tramo segun el catalogo, null en la fase final. */
  toPairs: number | null;
  /** Lugares que quedan del tramo; referencia para el staff, no un candado. */
  remainingPairs: number | null;
};

export async function getCurrentPhase(): Promise<CurrentPhase> {
  // Cliente sin cookies a proposito: la vista es publica (anon puede leerla) y
  // asi las paginas que solo pintan precios pueden cachearse con revalidate.
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase.from("current_phase").select("*").maybeSingle();

  if (error || !data) {
    // Sin fase activa la pagina no debe caerse: se pinta el precio base del
    // catalogo estatico. El alta de equipos si fallaria (el trigger no
    // encuentra precio), que es el comportamiento correcto.
    return {
      phase: 1,
      label: "Fase 1 · Founders",
      priceCM: DIVISIONS.CM.priceMXN,
      priceOP: DIVISIONS.OP.priceMXN,
      paidPairs: 0,
      toPairs: 50,
      remainingPairs: null,
    };
  }

  return {
    phase: data.phase,
    label: data.label,
    priceCM: data.price_cm,
    priceOP: data.price_op,
    paidPairs: data.paid_pairs,
    toPairs: data.to_pairs,
    remainingPairs: data.remaining_pairs,
  };
}

/** Precios por division en el formato que consumen los componentes. */
export type DivisionPrices = { CM: number; OP: number };

export function toPrices(phase: CurrentPhase): DivisionPrices {
  return { CM: phase.priceCM, OP: phase.priceOP };
}
