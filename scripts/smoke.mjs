// Pruebas de humo contra el entorno local. Requieren:
//
//   npx supabase start     (base de datos y auth)
//   npm run dev            (el sitio)
//
// y luego, en otra terminal:
//
//   npm run smoke
//
// Con un MP_ACCESS_TOKEN falso, los casos que salen a Mercado Pago fallan a
// proposito (502 y 500), y eso es justo lo que se verifica: que el codigo llega
// hasta alla en vez de inventarse una respuesta.

import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const SECRET = process.env.MP_WEBHOOK_SECRET ?? "secreto-de-prueba-local";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let failures = 0;

function group(name) {
  console.log(`\n${name}`);
}

function check(name, condition, detail = "") {
  if (!condition) failures++;
  console.log(`  ${condition ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

// ============================================================ paginas =======
group("Paginas publicas");

for (const path of ["/", "/login", "/prototipo", "/quiz"]) {
  const res = await fetch(BASE + path);
  check(`GET ${path} responde 200`, res.status === 200, `status ${res.status}`);
}

{
  const res = await fetch(BASE + "/perfil", { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  check(
    "/perfil sin sesion redirige a /login",
    res.status >= 300 && res.status < 400 && location.includes("/login"),
    `status ${res.status} → ${location}`,
  );
}

{
  const res = await fetch(BASE + "/inscripcion", { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  check(
    "/inscripcion redirige al flujo nuevo",
    res.status >= 300 && res.status < 400 && (location.includes("/perfil") || location.includes("/login")),
    `status ${res.status} → ${location}`,
  );
}

{
  const res = await fetch(BASE + "/api/checkout", { method: "POST" });
  check(
    "checkout sin sesion no cobra",
    res.status === 400 || res.status === 401 || (res.status >= 300 && res.status < 400),
    `status ${res.status}`,
  );
}

// ========================================================== categorias =======
group("Paginas de categoria");

{
  const html = (await (await fetch(BASE + "/community")).text()).replace(/<!--[\s\S]*?-->/g, "");
  check("Community responde y trae su hero", html.includes("Community.") && html.includes("Un día."), "ok");
  check("Community lista sus 9 estaciones", html.includes("80 wall ball shots"), "cierra con 80 wall balls");
  check("Community usa sus cargas (35 lb)", html.includes("kettlebells de 35 lb"), "ok");
  check("Community muestra su precio", html.includes("$2,000 MXN por pareja"), "ok");
  check("Community no trae la seccion de dos dias", !html.includes("Zone Challenge"), "es de un solo dia");
  check("Community enlaza a Open", html.includes('href="/open"'), "ok");
}

{
  const html = (await (await fetch(BASE + "/open")).text()).replace(/<!--[\s\S]*?-->/g, "");
  check("Open responde y trae su hero", html.includes("Open.") && html.includes("Dos días."), "ok");
  check("Open lista sus 9 estaciones", html.includes("100 wall ball shots"), "cierra con 100 wall balls");
  check("Open usa sus cargas (54 lb)", html.includes("kettlebells de 54 lb"), "ok");
  check("Open muestra su precio", html.includes("$2,300 MXN por pareja"), "ok");
  check("Open trae la seccion de los dos dias", html.includes("Zone Challenge"), "ok");
  check("Open enlaza a Community", html.includes('href="/community"'), "ok");
}

{
  const html = await (await fetch(BASE + "/")).text();
  check(
    "la landing enlaza a las categorias migradas",
    html.includes('href="/community"') && html.includes('href="/open"'),
    "ok",
  );
}

// =============================================================== quiz =======
group("Quiz de categoria");

{
  // React separa los nodos de texto con comentarios (`Pregunta <!-- -->1`), asi
  // que se quitan antes de comparar frases que mezclan texto y variables.
  const raw = await (await fetch(BASE + "/quiz")).text();
  const html = raw.replace(/<!--[\s\S]*?-->/g, "");
  check("arranca en la pregunta 1 de 5", html.includes("Pregunta 1 de 5"), "ok");
  check(
    "muestra la primera pregunta del prototipo",
    html.includes("¿Hace cuánto entrenas de forma constante?"),
    "ok",
  );
  check("ofrece todas las respuestas", html.includes("Más de 6 años"), "ok");
  check(
    "no revela el resultado antes de contestar",
    !html.includes("Tu categoría recomendada"),
    "ok",
  );
}

{
  const { QUESTIONS, scoreQuiz } = await import("../src/lib/quiz-data.ts");
  const novato = QUESTIONS.map(() => 0);
  const avanzado = QUESTIONS.map((q) => q.options.length - 1);
  check("perfil principiante cae en Community", scoreQuiz(novato) === "CM", scoreQuiz(novato));
  check("perfil avanzado cae en Open", scoreQuiz(avanzado) === "OP", scoreQuiz(avanzado));
  check("sin respuestas no revienta", scoreQuiz([]) === "CM", scoreQuiz([]));
}

{
  const html = await (await fetch(BASE + "/")).text();
  check("la landing enlaza al quiz migrado", html.includes('href="/quiz"'), "ok");
}

// ============================================================ webhook =======
group("Webhook de Mercado Pago");

function signedHeaders({ dataId, secret = SECRET, ts = Math.floor(Date.now() / 1000) }) {
  const requestId = "req-de-prueba-1";
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  return { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId };
}

const webhookCases = [
  ["sin firma da 401", {}, "?type=payment&data.id=123", 401],
  [
    "con firma de otro secreto da 401",
    signedHeaders({ dataId: "123", secret: "secreto-equivocado" }),
    "?type=payment&data.id=123",
    401,
  ],
  [
    "con firma de otro data.id da 401",
    signedHeaders({ dataId: "123" }),
    "?type=payment&data.id=999",
    401,
  ],
  [
    "con firma vieja da 401 (anti-replay)",
    signedHeaders({ dataId: "123", ts: Math.floor(Date.now() / 1000) - 3600 }),
    "?type=payment&data.id=123",
    401,
  ],
  [
    "con firma valida y topic ajeno da 200 e ignora",
    signedHeaders({ dataId: "abc123" }),
    "?type=merchant_order&data.id=abc123",
    200,
  ],
  [
    "con firma valida consulta el pago y pide reintento (500 con token dummy)",
    signedHeaders({ dataId: "123" }),
    "?type=payment&data.id=123",
    500,
  ],
];

for (const [name, headers, query, expected] of webhookCases) {
  const res = await fetch(`${BASE}/api/webhooks/mercadopago${query}`, {
    method: "POST",
    headers,
    body: "{}",
  });
  check(name, res.status === expected, `status ${res.status}, esperado ${expected}`);
}

{
  const res = await fetch(BASE + "/api/webhooks/mercadopago");
  check("GET responde 200 (alta en el panel de MP)", res.status === 200, `status ${res.status}`);
}

// ================================================================ RLS =======
if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.log("\nSin variables de Supabase: se omiten las pruebas de RLS.");
} else {
  group("Politicas de acceso a datos (RLS)");

  const password = "prueba-thf-2026";
  const emailA = `atleta-a-${randomUUID()}@ejemplo.com`;
  const emailB = `atleta-b-${randomUUID()}@ejemplo.com`;

  async function signUpClient(email, displayName) {
    const client = createClient(SUPABASE_URL, ANON_KEY);
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw new Error(`No se pudo registrar ${email}: ${error.message}`);
    return client;
  }

  const clientA = await signUpClient(emailA, "Atleta A");
  const clientB = await signUpClient(emailB, "Atleta B");
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user: userA },
  } = await clientA.auth.getUser();

  check("el registro crea el perfil automaticamente", Boolean(userA), userA ? "ok" : "sin usuario");

  {
    const { data: profile } = await clientA
      .from("profiles")
      .select("display_name")
      .eq("id", userA.id)
      .maybeSingle();
    check(
      "el perfil guarda el nombre del registro",
      profile?.display_name === "Atleta A",
      `display_name = ${profile?.display_name}`,
    );
  }

  // --- A crea su equipo ---
  const { data: teamA, error: createError } = await clientA
    .from("teams")
    .insert({
      name: "Los Alacranes",
      division: "OP",
      captain_id: userA.id,
      amount_mxn: 2300,
      emblem: { plate: "shield" },
    })
    .select("id, status")
    .single();

  check("un atleta puede crear su equipo", !createError && Boolean(teamA), createError?.message ?? "ok");
  check("el equipo nace sin pagar", teamA?.status === "awaiting_payment", `status ${teamA?.status}`);

  // --- lo que NO debe poder hacer ---
  {
    const { error } = await clientA
      .from("teams")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", teamA.id);

    const { data: after } = await admin
      .from("teams")
      .select("status")
      .eq("id", teamA.id)
      .single();

    check(
      "el capitan NO puede marcar su equipo como pagado",
      after.status === "awaiting_payment",
      error ? `rechazado: ${error.code}` : `status quedo en ${after.status}`,
    );
  }

  {
    const { error } = await clientA.from("payments").insert({
      id: `falso-${randomUUID()}`,
      team_id: teamA.id,
      status: "approved",
      amount_mxn: 2300,
    });
    check("un atleta NO puede inventar un pago", Boolean(error), error?.message ?? "lo dejo insertar");
  }

  {
    const { error } = await clientA
      .from("teams")
      .insert({
        name: "Segundo equipo",
        division: "CM",
        captain_id: userA.id,
        amount_mxn: 2000,
        emblem: {},
      });
    check("un atleta NO puede tener dos equipos", Boolean(error), error?.message ?? "lo dejo crear");
  }

  {
    const { data } = await clientB.from("teams").select("id").eq("id", teamA.id);
    check("otro atleta NO ve el equipo ajeno", (data ?? []).length === 0, `filas visibles: ${data?.length}`);
  }

  {
    await clientB.from("teams").delete().eq("id", teamA.id);
    const { data: after } = await admin.from("teams").select("id").eq("id", teamA.id);
    check("otro atleta NO puede borrar el equipo ajeno", (after ?? []).length === 1, "sigue existiendo");
  }

  // --- lo que el webhook SI puede hacer (service role) ---
  group("Confirmacion de pago (service role, como el webhook)");

  {
    const paymentId = `pago-${randomUUID()}`;
    const { error: payError } = await admin.from("payments").insert({
      id: paymentId,
      team_id: teamA.id,
      status: "approved",
      amount_mxn: 2300,
      payment_method: "visa",
    });
    check("el webhook puede registrar el pago", !payError, payError?.message ?? "ok");

    const { error: updateError } = await admin
      .from("teams")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", teamA.id);
    check("el webhook puede marcar el equipo como pagado", !updateError, updateError?.message ?? "ok");

    // Idempotencia: la misma notificacion repetida no duplica el pago.
    await admin.from("payments").upsert({
      id: paymentId,
      team_id: teamA.id,
      status: "approved",
      amount_mxn: 2300,
      payment_method: "visa",
    });
    const { data: rows } = await admin.from("payments").select("id").eq("team_id", teamA.id);
    check("reprocesar la misma notificacion no duplica el pago", rows?.length === 1, `filas: ${rows?.length}`);
  }

  {
    const { data } = await clientA
      .from("teams")
      .select("status, payments ( status )")
      .eq("id", teamA.id)
      .single();
    check("el capitan ya ve su equipo como pagado", data?.status === "paid", `status ${data?.status}`);
    check("el capitan puede ver sus pagos", (data?.payments ?? []).length === 1, `pagos: ${data?.payments?.length}`);
  }

  {
    const { error } = await clientA.from("teams").delete().eq("id", teamA.id);
    const { data: after } = await admin.from("teams").select("id").eq("id", teamA.id);
    check(
      "un equipo pagado NO se puede eliminar",
      (after ?? []).length === 1,
      error ? `rechazado: ${error.code}` : "sigue existiendo",
    );
  }

  // Limpieza
  await admin.from("teams").delete().eq("id", teamA.id);
  await admin.auth.admin.deleteUser(userA.id);
  const {
    data: { user: userB },
  } = await clientB.auth.getUser();
  if (userB) await admin.auth.admin.deleteUser(userB.id);
}

console.log(failures === 0 ? "\nTodo verde." : `\n${failures} verificaciones fallaron.`);
process.exit(failures === 0 ? 0 : 1);
