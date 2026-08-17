// Verifica que el precio de la inscripcion no lo pueda decidir el cliente y que
// suba solo al cambiar de fase.
//
//   npm run smoke:prices

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function nuevoAtleta(prefijo) {
  const user = createClient(SUPABASE_URL, ANON_KEY);
  const { data } = await user.auth.signUp({
    email: `${prefijo}-${randomUUID()}@ejemplo.com`,
    password: "prueba-thf-2026",
    options: { data: { display_name: "Atleta Precio" } },
  });
  return { user, uid: data.user.id };
}

// La fase vigente decide los precios esperados. No los quemamos en la prueba:
// si manana cambia el catalogo, esto sigue midiendo lo correcto.
const { data: fase, error: faseError } = await admin
  .from("current_phase")
  .select("*")
  .single();

if (!fase) {
  console.error("No se pudo leer la fase vigente:", faseError);
  process.exit(1);
}

console.log("\nEl precio lo pone la base, no el cliente");
console.log(`  (fase vigente: ${fase.label} · ${fase.paid_pairs} parejas pagadas)`);

const { user, uid } = await nuevoAtleta("precio");

// Intento de alta barata: manda 1 peso para la division Open.
const { data: team } = await user
  .from("teams")
  .insert({
    name: "Los Baratos",
    division: "OP",
    gender: "MX",
    captain_id: uid,
    amount_mxn: 1,
    emblem: {},
  })
  .select("id, division, amount_mxn")
  .single();

check(
  "al crear el equipo se ignora el monto que manda el cliente",
  team.amount_mxn === fase.price_op,
  `mando 1, quedo ${team.amount_mxn}`,
);

// Intento de rebaja despues del alta.
await user.from("teams").update({ amount_mxn: 1 }).eq("id", team.id);
const { data: afterUpdate } = await admin
  .from("teams")
  .select("amount_mxn")
  .eq("id", team.id)
  .single();
check(
  "no se puede rebajar el monto por la API",
  afterUpdate.amount_mxn === fase.price_op,
  `quedo ${afterUpdate.amount_mxn}`,
);

// Cambio legitimo de categoria: el precio sigue a la division.
await user.from("teams").update({ division: "CM" }).eq("id", team.id);
const { data: afterDivision } = await admin
  .from("teams")
  .select("division, amount_mxn")
  .eq("id", team.id)
  .single();
check(
  "cambiar a Community baja el precio de la fase",
  afterDivision.division === "CM" && afterDivision.amount_mxn === fase.price_cm,
  `${afterDivision.division} / ${afterDivision.amount_mxn}`,
);

await user.from("teams").update({ division: "OP" }).eq("id", team.id);
const { data: backToOpen } = await admin
  .from("teams")
  .select("amount_mxn")
  .eq("id", team.id)
  .single();
check(
  "volver a Open sube al precio de la fase",
  backToOpen.amount_mxn === fase.price_op,
  `${backToOpen.amount_mxn}`,
);

// Un equipo pagado congela su precio y su categoria.
await admin.from("payments").insert({
  id: `pago-${randomUUID()}`,
  team_id: team.id,
  status: "approved",
  amount_mxn: fase.price_op,
});
await admin
  .from("teams")
  .update({ status: "paid", paid_at: new Date().toISOString() })
  .eq("id", team.id);

await user.from("teams").update({ division: "CM" }).eq("id", team.id);
const { data: afterPaid } = await admin
  .from("teams")
  .select("division, amount_mxn")
  .eq("id", team.id)
  .single();
check(
  "un equipo pagado no puede cambiar de categoria",
  afterPaid.division === "OP" && afterPaid.amount_mxn === fase.price_op,
  `${afterPaid.division} / ${afterPaid.amount_mxn}`,
);

// -------------------------------------------- el cambio de fase es manual --

console.log("\nLa fase la decide el staff con un boton, no un contador");

// El conteo de pagadas existe como referencia para el staff.
const { data: pagadas } = await admin.rpc("paid_pairs");
check("las parejas pagadas se cuentan como referencia", pagadas >= 1, `${pagadas} pagadas`);

// Un equipo sin pagar NO suma al conteo.
const { user: colado, uid: uidColado } = await nuevoAtleta("colado");
await colado.from("teams").insert({
  name: "Los Que No Pagan",
  division: "CM",
  gender: "MX",
  captain_id: uidColado,
  amount_mxn: 1,
  emblem: {},
});
const { data: pagadasDespues } = await admin.rpc("paid_pairs");
check(
  "un equipo sin pagar no suma al conteo",
  pagadasDespues === pagadas,
  `sigue en ${pagadasDespues}`,
);

const { data: fase2 } = await admin.from("price_phases").select("*").eq("phase", 2).single();

// El staff activa la Fase 2 (lo que hace el boton del panel).
await admin.from("price_phases").update({ active: true }).eq("phase", 2);

const { data: fase1Tras } = await admin
  .from("price_phases")
  .select("active")
  .eq("phase", 1)
  .single();
check("solo una fase queda activa a la vez", fase1Tras.active === false, "fase 1 se desactivo");

const { user: siguiente, uid: uidSiguiente } = await nuevoAtleta("fase2");
const { data: teamFase2 } = await siguiente
  .from("teams")
  .insert({
    name: "Los De La Fase Dos",
    division: "OP",
    gender: "MX",
    captain_id: uidSiguiente,
    amount_mxn: 1,
    emblem: {},
  })
  .select("id, amount_mxn")
  .single();

check(
  "con la fase nueva activa, el equipo nuevo paga el precio nuevo",
  teamFase2.amount_mxn === fase2.price_op,
  `esperaba ${fase2.price_op}, quedo ${teamFase2.amount_mxn}`,
);

// El equipo ya pagado conserva el precio viejo aunque la fase haya cambiado.
const { data: viejoTrasCambio } = await admin
  .from("teams")
  .select("amount_mxn")
  .eq("id", team.id)
  .single();
check(
  "el que ya pago conserva el precio de su fase",
  viejoTrasCambio.amount_mxn === fase.price_op,
  `sigue en ${viejoTrasCambio.amount_mxn}`,
);

// El precio se fija al pagar: al recalcular antes del checkout, un equipo sin
// pagar toma el precio de la fase vigente, no el de cuando se armo.
await siguiente
  .from("teams")
  .update({ amount_mxn: teamFase2.amount_mxn })
  .eq("id", teamFase2.id);
const { data: recalculado } = await admin
  .from("teams")
  .select("amount_mxn")
  .eq("id", teamFase2.id)
  .single();
check(
  "al ir a pagar se recalcula con la fase vigente",
  recalculado.amount_mxn === fase2.price_op,
  `${recalculado.amount_mxn}`,
);

// Un atleta no puede activar fases ni editar precios.
await user.from("price_phases").update({ active: true }).eq("phase", 4);
const { data: fase4 } = await admin
  .from("price_phases")
  .select("active")
  .eq("phase", 4)
  .single();
check("un atleta no puede cambiar la fase activa", fase4.active === false, "fase 4 sigue inactiva");

const { error: priceError } = await user
  .from("price_phases")
  .update({ price_op: 1 })
  .eq("phase", 1);
const { data: catalogo } = await admin
  .from("price_phases")
  .select("price_op")
  .eq("phase", 1)
  .single();
check(
  "un atleta no puede editar el catalogo de fases",
  catalogo.price_op === 2300,
  priceError ? `rechazado: ${priceError.code}` : `sigue en ${catalogo.price_op}`,
);

// Sin ninguna fase activa, el alta se rechaza en vez de inventar un precio.
await admin.from("price_phases").update({ active: false }).eq("phase", 2);
const { user: sinFase, uid: uidSinFase } = await nuevoAtleta("sinfase");
const { error: sinFaseError } = await sinFase.from("teams").insert({
  name: "Los Sin Fase",
  division: "CM",
  gender: "MX",
  captain_id: uidSinFase,
  amount_mxn: 1,
  emblem: {},
});
check(
  "sin fase activa no se puede crear un equipo",
  Boolean(sinFaseError),
  sinFaseError ? `rechazado: ${sinFaseError.message.slice(0, 55)}` : "se creo igual",
);

// Se restaura la Fase 1 como activa, que es el estado normal.
await admin.from("price_phases").update({ active: true }).eq("phase", 1);

// ------------------------------------------------------------- limpieza --

await admin.from("teams").delete().eq("id", team.id);
await admin.from("teams").delete().eq("id", teamFase2.id);
await admin.from("teams").delete().eq("captain_id", uidColado);
for (const id of [uid, uidColado, uidSiguiente, uidSinFase]) {
  await admin.auth.admin.deleteUser(id);
}

console.log(failures === 0 ? "\nTodo verde." : `\n${failures} verificaciones fallaron.`);
process.exit(failures === 0 ? 0 : 1);
