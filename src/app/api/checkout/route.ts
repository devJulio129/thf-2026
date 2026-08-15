import { NextResponse } from "next/server";

import { baseUrl, isPubliclyReachable } from "@/lib/env";
import { preferenceClient } from "@/lib/mercadopago";
import { attachPreference, getMyTeam, refreshTeamPrice } from "@/lib/store";
import { CURRENCY, DIVISIONS } from "@/lib/thf";

export const runtime = "nodejs";

/**
 * Crea la preference de pago del equipo del atleta logueado y devuelve la URL
 * de Checkout Pro.
 *
 * El request no lleva datos: el equipo se resuelve desde la sesion y el monto
 * desde la base. No hay forma de pedir un cobro por otro importe ni de pagar el
 * equipo de alguien mas.
 */
export async function POST() {
  const team = await getMyTeam();

  if (!team) {
    return NextResponse.json(
      { error: "Primero arma tu equipo en el perfil." },
      { status: 400 },
    );
  }

  if (team.status === "paid") {
    return NextResponse.json({ error: "Este equipo ya esta pagado." }, { status: 409 });
  }

  // El precio se fija aqui, no cuando se armo el equipo: se recalcula con la
  // fase vigente antes de mandarle un importe a Mercado Pago.
  const amountMXN = await refreshTeamPrice(team.id, team.amountMXN);

  const info = DIVISIONS[team.division];
  const site = baseUrl();
  const reachable = isPubliclyReachable(site);

  if (!reachable) {
    console.warn(
      `[checkout] ${site} no es alcanzable desde internet: se omiten notification_url y ` +
        `auto_return. El webhook NO va a llegar y el pago no se va a confirmar solo. ` +
        `Levanta un tunel (ngrok) y pon APP_BASE_URL para probar el flujo completo.`,
    );
  }

  try {
    const preference = await preferenceClient().create({
      body: {
        items: [
          {
            id: `thf-2026-${team.division.toLowerCase()}`,
            title: `Inscripcion THF 2026 · ${info.name}`,
            description: `Equipo ${team.name} · ${team.athletes.map((a) => a.name).join(" y ")}`,
            category_id: "tickets",
            quantity: 1,
            unit_price: amountMXN,
            currency_id: CURRENCY,
          },
        ],
        // El hilo que amarra el pago con el equipo cuando vuelve el webhook.
        external_reference: team.id,
        metadata: { team_id: team.id, division: team.division },
        payer: team.athletes[0]
          ? { name: team.athletes[0].name, email: team.athletes[0].email }
          : undefined,
        statement_descriptor: "THF2026",
        back_urls: {
          success: `${site}/pago/exito?team=${team.id}`,
          pending: `${site}/pago/pendiente?team=${team.id}`,
          failure: `${site}/pago/error?team=${team.id}`,
        },
        ...(reachable
          ? {
              auto_return: "approved" as const,
              notification_url: `${site}/api/webhooks/mercadopago`,
            }
          : {}),
      },
      requestOptions: { idempotencyKey: team.id },
    });

    if (!preference.id || !preference.init_point) {
      throw new Error("Mercado Pago no devolvio init_point.");
    }

    await attachPreference(team.id, preference.id);

    return NextResponse.json({
      teamId: team.id,
      amountMXN,
      checkoutUrl: preference.init_point,
    });
  } catch (error) {
    console.error("[checkout] fallo al crear la preference", error);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Intenta de nuevo en un momento." },
      { status: 502 },
    );
  }
}
