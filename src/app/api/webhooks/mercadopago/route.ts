import { NextResponse } from "next/server";

import { paymentClient, verifyWebhookSignature } from "@/lib/mercadopago";
import { recordPayment, type PaymentStatus } from "@/lib/store";

export const runtime = "nodejs";
/** Nada de cache: cada notificacion se procesa en vivo. */
export const dynamic = "force-dynamic";

/**
 * Webhook de Mercado Pago. ESTA es la fuente de verdad de un pago.
 *
 * Las back_urls a las que vuelve el usuario son solo experiencia de usuario: se
 * pueden falsificar escribiendo la URL a mano, y el usuario puede cerrar la
 * pestana antes de volver. Un equipo se marca pagado aqui y en ningun otro lado.
 *
 * Reglas que Mercado Pago impone y que hay que respetar:
 *  - Responder rapido. Si tardamos o fallamos, MP reintenta con backoff.
 *  - Devolver 2xx para dar la notificacion por recibida; cualquier otra cosa
 *    provoca reintentos, asi que un 5xx se reserva para fallas reales nuestras.
 *  - Puede llegar mas de una notificacion por el mismo pago. El store es
 *    idempotente justamente por esto.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");

  const verification = verifyWebhookSignature({
    signatureHeader: request.headers.get("x-signature"),
    requestIdHeader: request.headers.get("x-request-id"),
    dataId,
  });

  if (!verification.valid) {
    console.warn(`[webhook] firma rechazada: ${verification.reason}`);
    return NextResponse.json({ error: "Firma invalida." }, { status: 401 });
  }

  // MP notifica varios recursos (merchant_order, plan, subscription...). Solo
  // nos interesan los pagos; el resto se acusa de recibido y se ignora.
  if (topic !== "payment") {
    return NextResponse.json({ ignored: topic }, { status: 200 });
  }

  let payment;
  try {
    // Consultamos el pago contra la API en vez de creerle al body: el body no
    // esta firmado campo por campo, y el estado pudo cambiar desde que se emitio.
    payment = await paymentClient().get({ id: dataId! });
  } catch (error) {
    console.error(`[webhook] no se pudo consultar el pago ${dataId}`, error);
    // 500 a proposito: queremos que Mercado Pago reintente.
    return NextResponse.json({ error: "No se pudo consultar el pago." }, { status: 500 });
  }

  const teamId = payment.external_reference;
  if (!teamId) {
    console.warn(`[webhook] el pago ${dataId} no trae external_reference`);
    return NextResponse.json({ ok: true, note: "sin external_reference" }, { status: 200 });
  }

  const result = await recordPayment(
    teamId,
    {
      id: String(payment.id),
      status: (payment.status ?? "pending") as PaymentStatus,
      statusDetail: payment.status_detail ?? null,
      amountMXN: payment.transaction_amount ?? 0,
      paymentMethod: payment.payment_method_id ?? null,
      processedAt: new Date().toISOString(),
    },
    // Guardamos la respuesta completa: si algo se disputa despues, esto es el
    // respaldo de que fue lo que dijo Mercado Pago.
    payment,
  );

  if (result.outcome === "unknown_team") {
    // Puede pasar si se borro el equipo o si el pago viene de otro entorno.
    // Se acusa de recibido igual, porque reintentar no lo va a arreglar.
    console.warn(`[webhook] pago ${payment.id} apunta al equipo inexistente ${teamId}`);
    return NextResponse.json({ ok: true, note: "equipo desconocido" }, { status: 200 });
  }

  if (result.outcome === "applied") {
    console.info(
      `[webhook] pago ${payment.id} (${payment.status}) aplicado al equipo ${teamId}; ` +
        `estado del equipo: ${result.status}`,
    );
  }

  return NextResponse.json({ ok: true, teamStatus: result.status }, { status: 200 });
}

/**
 * Mercado Pago pega un GET al dar de alta la URL en el panel para comprobar que
 * responde. Sin esto la configuracion del webhook no se puede guardar.
 */
export async function GET() {
  return NextResponse.json({ ok: true });
}
