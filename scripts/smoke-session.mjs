// Prueba del flujo con sesion iniciada, por HTTP contra el dev server.
//
// En vez de adivinar como se llama la cookie de sesion, dejamos que la propia
// libreria la genere: createServerClient con un almacen de cookies en memoria
// escribe exactamente lo mismo que escribiria el navegador, y de ahi sale el
// header Cookie que mandamos al sitio.
//
//   npm run smoke:session

import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let failures = 0;

function check(name, condition, detail = "") {
  if (!condition) failures++;
  console.log(`  ${condition ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error("Faltan variables de Supabase. Corre con: npm run smoke:session");
  process.exit(1);
}

const jar = new Map();

const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
  cookies: {
    getAll() {
      return [...jar.entries()].map(([name, value]) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      for (const { name, value } of cookiesToSet) jar.set(name, value);
    },
  },
});

function cookieHeader() {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const email = `flujo-${randomUUID()}@ejemplo.com`;
const password = "prueba-thf-2026";

console.log("\nFlujo completo con sesion");

const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { display_name: "Atleta de Prueba" } },
});
check("registro de atleta", !signUpError && Boolean(signUpData.session), signUpError?.message ?? "ok");
check("la libreria escribio la cookie de sesion", jar.size > 0, `cookies: ${jar.size}`);

const userId = signUpData.user.id;

// --- /perfil con sesion ---
{
  const res = await fetch(BASE + "/perfil", { headers: { cookie: cookieHeader() } });
  const html = await res.text();
  check("/perfil con sesion responde 200", res.status === 200, `status ${res.status}`);
  check("/perfil saluda al atleta", html.includes("Atleta de Prueba"), "muestra el nombre");
  check(
    "/perfil ofrece armar el equipo cuando no hay",
    html.includes("Aún no tienes equipo") && html.includes("+ Crear equipo"),
    "aparece la invitacion a crear equipo",
  );
}

// --- checkout sin equipo ---
{
  const res = await fetch(BASE + "/api/checkout", {
    method: "POST",
    headers: { cookie: cookieHeader() },
  });
  const payload = await res.json();
  check(
    "checkout sin equipo no cobra",
    res.status === 400 && String(payload.error).includes("equipo"),
    `status ${res.status}: ${payload.error}`,
  );
}

// --- el atleta arma su equipo ---
const { data: team, error: teamError } = await supabase
  .from("teams")
  .insert({
    name: "Los Alacranes",
    division: "OP",
    gender: "MX",
    captain_id: userId,
    amount_mxn: 2300,
    emblem: { plate: "shield", pattern: "bars", icon: "scorpion" },
  })
  .select("id")
  .single();
check("el atleta crea su equipo", !teamError, teamError?.message ?? "ok");

await supabase.from("team_members").insert([
  { team_id: team.id, name: "Ana Ruiz", email: "ana@ejemplo.com", shirt_size: "M", city: "Tampico" },
  { team_id: team.id, name: "Luis Paz", email: "luis@ejemplo.com", shirt_size: "L", city: "Madero" },
]);

// --- /perfil con equipo ---
{
  const res = await fetch(BASE + "/perfil", { headers: { cookie: cookieHeader() } });
  const html = await res.text();
  check("/perfil muestra el equipo", html.includes("Los Alacranes"), "aparece el nombre del equipo");
  check("/perfil muestra a los dos atletas", html.includes("Ana Ruiz") && html.includes("Luis Paz"), "ok");
  check(
    "/perfil ofrece pagar dentro del perfil",
    html.includes("con Mercado Pago"),
    "el boton de pago vive aqui",
  );
  check("/perfil avisa lo que falta pagar", html.includes("Falta el pago"), "ok");
  check(
    "/perfil no libera la credencial sin pagar",
    html.includes("se libera cuando tu equipo complete el pago"),
    "credencial bloqueada",
  );
  check(
    "/perfil muestra la categoria de la pareja",
    html.includes("Hombre / Mujer"),
    "categoria del equipo",
  );
  check(
    "/perfil ofrece la transferencia como alternativa",
    html.includes("O paga por transferencia bancaria"),
    "ok",
  );
}

// --- checkout con equipo (llega a Mercado Pago) ---
{
  const res = await fetch(BASE + "/api/checkout", {
    method: "POST",
    headers: { cookie: cookieHeader() },
  });
  check(
    "checkout con equipo llega hasta Mercado Pago (502 con token dummy)",
    res.status === 502,
    `status ${res.status}`,
  );
}

// --- confirmacion del pago, como lo haria el webhook ---
{
  await admin.from("payments").insert({
    id: `pago-${randomUUID()}`,
    team_id: team.id,
    status: "approved",
    amount_mxn: 2300,
    payment_method: "visa",
  });
  await admin
    .from("teams")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", team.id);

  const res = await fetch(BASE + "/perfil", { headers: { cookie: cookieHeader() } });
  const html = await res.text();
  check("tras el pago, el perfil dice pagado", html.includes("Equipo pagado al 100%"), "ok");
  check(
    "tras el pago, se libera el QR de la credencial",
    html.includes("repeating-conic-gradient") && html.includes("Inscripción pagada"),
    "ok",
  );

  const pago = await fetch(`${BASE}/pago/exito?team=${team.id}`, {
    headers: { cookie: cookieHeader() },
  });
  const pagoHtml = await pago.text();
  check("la pagina de retorno confirma el pago", pagoHtml.includes("Tu equipo esta dentro"), "ok");
}

// --- un equipo ajeno no se filtra por la pagina de retorno ---
{
  const res = await fetch(`${BASE}/pago/exito?team=${team.id}`);
  const html = await res.text();
  check(
    "sin sesion, la pagina de retorno no revela el equipo",
    !html.includes("Los Alacranes"),
    "no filtra datos",
  );
}

// Limpieza
await admin.from("teams").delete().eq("id", team.id);
await admin.auth.admin.deleteUser(userId);

console.log(failures === 0 ? "\nTodo verde." : `\n${failures} verificaciones fallaron.`);
process.exit(failures === 0 ? 0 : 1);
