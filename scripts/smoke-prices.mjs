// Verifica que el precio de la inscripcion no lo pueda decidir el cliente.
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
const user = createClient(SUPABASE_URL, ANON_KEY);

const { data: signUp } = await user.auth.signUp({
  email: `precio-${randomUUID()}@ejemplo.com`,
  password: "prueba-thf-2026",
  options: { data: { display_name: "Atleta Precio" } },
});
const uid = signUp.user.id;

console.log("\nEl precio lo pone la base, no el cliente");

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
  team.amount_mxn === 2300,
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
  afterUpdate.amount_mxn === 2300,
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
  "cambiar a Community baja el precio a 2000",
  afterDivision.division === "CM" && afterDivision.amount_mxn === 2000,
  `${afterDivision.division} / ${afterDivision.amount_mxn}`,
);

await user.from("teams").update({ division: "OP" }).eq("id", team.id);
const { data: backToOpen } = await admin
  .from("teams")
  .select("amount_mxn")
  .eq("id", team.id)
  .single();
check("volver a Open sube el precio a 2300", backToOpen.amount_mxn === 2300, `${backToOpen.amount_mxn}`);

// Un equipo pagado congela su precio y su categoria.
await admin.from("payments").insert({
  id: `pago-${randomUUID()}`,
  team_id: team.id,
  status: "approved",
  amount_mxn: 2300,
});
await admin.from("teams").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", team.id);

await user.from("teams").update({ division: "CM" }).eq("id", team.id);
const { data: afterPaid } = await admin
  .from("teams")
  .select("division, amount_mxn")
  .eq("id", team.id)
  .single();
check(
  "un equipo pagado no puede cambiar de categoria",
  afterPaid.division === "OP" && afterPaid.amount_mxn === 2300,
  `${afterPaid.division} / ${afterPaid.amount_mxn}`,
);

// Los precios del catalogo no los edita un atleta.
const { error: priceError } = await user
  .from("division_prices")
  .update({ price_mxn: 1 })
  .eq("division", "OP");
const { data: catalog } = await admin
  .from("division_prices")
  .select("price_mxn")
  .eq("division", "OP")
  .single();
check(
  "un atleta no puede editar el catalogo de precios",
  catalog.price_mxn === 2300,
  priceError ? `rechazado: ${priceError.code}` : "sigue en 2300",
);

await admin.from("teams").delete().eq("id", team.id);
await admin.auth.admin.deleteUser(uid);

console.log(failures === 0 ? "\nTodo verde." : `\n${failures} verificaciones fallaron.`);
process.exit(failures === 0 ? 0 : 1);
