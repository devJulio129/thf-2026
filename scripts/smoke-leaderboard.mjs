// Leaderboard publico: que muestre lo que debe y calle lo que no.
//
//   npm run smoke:leaderboard

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const clean = (html) => html.replace(/<!--[\s\S]*?-->/g, "");

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const anon = createClient(SUPABASE_URL, ANON_KEY);

console.log("\nLeaderboard publico");

// Dos equipos: uno pagado (debe salir) y otro sin pagar (no debe salir).
const made = [];
async function makeTeam({ name, division, paid, athlete, email }) {
  const { data: signUp } = await anon.auth.signUp({
    email: `lb-${randomUUID()}@ejemplo.com`,
    password: "prueba-thf-2026",
    options: { data: { display_name: athlete } },
  });
  const uid = signUp.user.id;
  const { data: team } = await admin
    .from("teams")
    .insert({ name, division, gender: "MX", captain_id: uid, amount_mxn: 1, emblem: { plate: "shield" } })
    .select("id")
    .single();
  await admin.from("team_members").insert([
    { team_id: team.id, name: athlete, email, shirt_size: "M", city: "Tampico" },
    { team_id: team.id, name: `Pareja de ${athlete}`, email: `p-${email}`, shirt_size: "L", city: "Tampico" },
  ]);
  if (paid) {
    await admin.from("payments").insert({
      id: `pago-${randomUUID()}`,
      team_id: team.id,
      status: "approved",
      amount_mxn: 2300,
    });
    await admin.from("teams").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", team.id);
  }
  made.push({ teamId: team.id, uid });
  return team.id;
}

await makeTeam({
  name: "Alacranes Confirmados",
  division: "OP",
  paid: true,
  athlete: "Mauricio Rodriguez",
  email: "secreto-pagado@ejemplo.com",
});
await makeTeam({
  name: "Pendientes De Pago",
  division: "OP",
  paid: false,
  athlete: "Nadie Deberia Verme",
  email: "secreto-pendiente@ejemplo.com",
});

const html = clean(await (await fetch(BASE + "/leaderboard")).text());

check("la pagina responde con el titulo del prototipo", html.includes("Leader") && html.includes("board."), "ok");
check("muestra el equipo pagado", html.includes("Alacranes Confirmados"), "ok");
check("muestra a sus atletas", html.includes("Mauricio Rodriguez"), "ok");
check("NO muestra equipos sin pagar", !html.includes("Pendientes De Pago"), "solo pagados");
check("NO filtra atletas de equipos sin pagar", !html.includes("Nadie Deberia Verme"), "ok");
check("NO expone correos", !html.includes("secreto-pagado@ejemplo.com"), "sin correos");
check("cuenta la pareja en las estadisticas", html.includes("Parejas inscritas"), "ok");
check("ofrece el buscador", html.includes("Buscar equipo, atleta o ciudad"), "ok");

// La vista publica tampoco debe dejar ver de mas por API directa.
const { data: viaApi } = await anon.from("public_leaderboard").select("*");
const rows = viaApi ?? [];
check(
  "la vista solo devuelve equipos pagados",
  rows.length === 1 && rows[0].name === "Alacranes Confirmados",
  `${rows.length} filas`,
);
check(
  "la vista no trae columnas privadas",
  rows[0] && !("captain_id" in rows[0]) && !("amount_mxn" in rows[0]) && !("preference_id" in rows[0]),
  "sin captain_id, amount_mxn ni preference_id",
);
check(
  "los integrantes salen sin correo",
  rows[0] && rows[0].members.every((m) => !("email" in m)),
  "solo nombre y ciudad",
);

for (const { teamId, uid } of made) {
  await admin.from("teams").delete().eq("id", teamId);
  await admin.auth.admin.deleteUser(uid);
}

console.log(failures === 0 ? "\nTodo verde." : `\n${failures} verificaciones fallaron.`);
process.exit(failures === 0 ? 0 : 1);
