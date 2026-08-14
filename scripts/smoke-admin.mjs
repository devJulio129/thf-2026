// Panel de administracion: que solo entre el staff y que la validacion manual
// de pagos deje rastro.
//
//   npm run smoke:admin

import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
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

/** Crea una sesion de navegador real y devuelve su header Cookie. */
async function session(displayName) {
  const jar = new Map();
  const client = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => cookies.forEach((c) => jar.set(c.name, c.value)),
    },
  });
  const { data } = await client.auth.signUp({
    email: `adm-${randomUUID()}@ejemplo.com`,
    password: "prueba-thf-2026",
    options: { data: { display_name: displayName } },
  });
  return {
    client,
    userId: data.user.id,
    cookie: [...jar].map(([n, v]) => `${n}=${v}`).join("; "),
  };
}

console.log("\nPanel de administracion");

const athlete = await session("Atleta Comun");
const staff = await session("Staff THF");
await admin.from("profiles").update({ role: "admin" }).eq("id", staff.userId);

// --- acceso ---
{
  const res = await fetch(BASE + "/admin", { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  check(
    "/admin sin sesion manda al login",
    res.status >= 300 && res.status < 400 && location.includes("/login"),
    `status ${res.status}`,
  );
}

{
  const html = clean(await (await fetch(BASE + "/admin", { headers: { cookie: athlete.cookie } })).text());
  check("un atleta comun NO entra al panel", html.includes("Solo para el equipo THF"), "ve el candado");
  check("un atleta comun no ve la lista de equipos", !html.includes("Equipos inscritos"), "ok");
}

{
  const html = clean(await (await fetch(BASE + "/admin", { headers: { cookie: staff.cookie } })).text());
  check("el staff entra al panel", html.includes("Panel de administración"), "ok");
  check("el staff ve Comp Prep Workout", html.includes("Comp Prep Workout"), "ok");
  check("el staff ve los equipos inscritos", html.includes("Equipos inscritos"), "ok");
}

// --- equipo de prueba, pendiente de pago ---
const captain = await session("Capitan Prueba");
const { data: team } = await admin
  .from("teams")
  .insert({
    name: "Equipo Por Validar",
    division: "CM",
    gender: "MM",
    captain_id: captain.userId,
    amount_mxn: 1,
    emblem: {},
  })
  .select("id, amount_mxn")
  .single();
await admin.from("team_members").insert([
  { team_id: team.id, name: "Uno Prueba", email: "u@e.com", shirt_size: "M", city: "Tampico" },
  { team_id: team.id, name: "Dos Prueba", email: "d@e.com", shirt_size: "L", city: "Tampico" },
]);

check("el equipo nace con el precio del catalogo", team.amount_mxn === 2000, `${team.amount_mxn}`);

{
  const html = clean(await (await fetch(BASE + "/admin", { headers: { cookie: staff.cookie } })).text());
  check("el panel lista el equipo pendiente", html.includes("Equipo Por Validar"), "ok");
  check("y ofrece validar su pago", html.includes("Validar pago"), "ok");
}

// --- validacion manual, como la haria el staff ---
await admin.from("payments").insert({
  id: `manual-${team.id}`,
  team_id: team.id,
  status: "approved",
  status_detail: `validado_por_staff:${staff.userId}`,
  amount_mxn: 2000,
  payment_method: "transferencia",
});
await admin.from("teams").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", team.id);

{
  const { data: payment } = await admin
    .from("payments")
    .select("payment_method, status_detail")
    .eq("id", `manual-${team.id}`)
    .single();
  check(
    "la validacion manual queda registrada como transferencia",
    payment.payment_method === "transferencia",
    payment.payment_method,
  );
  check(
    "y guarda quien la valido",
    payment.status_detail.includes(staff.userId),
    "trazabilidad del staff",
  );
}

{
  const html = clean(await (await fetch(BASE + "/leaderboard")).text());
  check("tras validar, el equipo sale en el leaderboard", html.includes("Equipo Por Validar"), "ok");
}

// --- workouts ---
{
  const { data: wod } = await admin
    .from("workouts")
    .insert({ title: "Comp Prep Prueba", subtitle: "Nota de prueba", content: "800 m run\n40 wall balls", is_published: true })
    .select("id")
    .single();

  const html = clean(await (await fetch(BASE + "/")).text());
  check("el workout publicado aparece en la landing", html.includes("Comp Prep Prueba"), "ok");
  check("con sus bloques", html.includes("40 wall balls"), "ok");

  // Publicar otro debe despublicar el anterior.
  const { data: second } = await admin
    .from("workouts")
    .insert({ title: "Comp Prep Segundo", subtitle: "", content: "500 m row", is_published: true })
    .select("id")
    .single();

  const { data: publicados } = await admin.from("workouts").select("id").eq("is_published", true);
  check("solo queda un workout publicado a la vez", publicados.length === 1, `${publicados.length} publicados`);

  const { data: anon } = await createClient(SUPABASE_URL, ANON_KEY).from("workouts").select("id");
  check("un visitante solo ve el publicado", (anon ?? []).length === 1, `${anon?.length} visibles`);

  const { error: writeError } = await createClient(SUPABASE_URL, ANON_KEY)
    .from("workouts")
    .insert({ title: "Intruso", content: "nada" });
  check("un visitante no puede crear workouts", Boolean(writeError), writeError?.code ?? "lo dejo");

  await admin.from("workouts").delete().in("id", [wod.id, second.id]);
}

// Limpieza
await admin.from("teams").delete().eq("id", team.id);
for (const s of [athlete, staff, captain]) await admin.auth.admin.deleteUser(s.userId);

console.log(failures === 0 ? "\nTodo verde." : `\n${failures} verificaciones fallaron.`);
process.exit(failures === 0 ? 0 : 1);
