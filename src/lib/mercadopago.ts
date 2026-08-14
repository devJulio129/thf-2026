/**
 * Capa de acceso a Mercado Pago. Solo se importa desde codigo de servidor.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

import { mpAccessToken, mpWebhookSecret } from "./env";

function client() {
  return new MercadoPagoConfig({
    accessToken: mpAccessToken(),
    options: { timeout: 10_000 },
  });
}

export function preferenceClient(): Preference {
  return new Preference(client());
}

export function paymentClient(): Payment {
  return new Payment(client());
}

/** Ventana de tolerancia para el timestamp de la firma, contra ataques de replay. */
const SIGNATURE_MAX_AGE_MS = 10 * 60 * 1000;

export type SignatureVerification =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Valida la firma de una notificacion de Mercado Pago.
 *
 * MP firma un manifiesto armado con el id del recurso (que viene en el query
 * string, NO en el body), el header x-request-id y el timestamp de la firma:
 *
 *     id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * y manda el HMAC-SHA256 en el header x-signature como `ts=...,v1=...`.
 *
 * Esto es lo unico que separa un webhook legitimo de cualquiera que descubra la
 * URL y mande un POST diciendo que un equipo ya pago.
 */
export function verifyWebhookSignature(params: {
  signatureHeader: string | null;
  requestIdHeader: string | null;
  dataId: string | null;
  now?: number;
}): SignatureVerification {
  const { signatureHeader, requestIdHeader, dataId } = params;
  const now = params.now ?? Date.now();

  if (!signatureHeader) return { valid: false, reason: "Falta el header x-signature." };
  if (!dataId) return { valid: false, reason: "Falta data.id en el query string." };

  const parts = new Map<string, string>();
  for (const chunk of signatureHeader.split(",")) {
    const separator = chunk.indexOf("=");
    if (separator === -1) continue;
    parts.set(chunk.slice(0, separator).trim(), chunk.slice(separator + 1).trim());
  }

  const ts = parts.get("ts");
  const received = parts.get("v1");
  if (!ts || !received) {
    return { valid: false, reason: "x-signature no trae ts y v1." };
  }

  const tsMs = Number(ts) * 1000;
  if (!Number.isFinite(tsMs)) {
    return { valid: false, reason: "El ts de la firma no es numerico." };
  }
  if (Math.abs(now - tsMs) > SIGNATURE_MAX_AGE_MS) {
    return { valid: false, reason: "La firma esta fuera de la ventana de tolerancia." };
  }

  // Los ids alfanumericos se firman en minusculas.
  const normalizedId = /^\d+$/.test(dataId) ? dataId : dataId.toLowerCase();

  const manifest =
    `id:${normalizedId};` +
    (requestIdHeader ? `request-id:${requestIdHeader};` : "") +
    `ts:${ts};`;

  const expected = createHmac("sha256", mpWebhookSecret()).update(manifest).digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) {
    return { valid: false, reason: "La firma no coincide." };
  }
  if (!timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return { valid: false, reason: "La firma no coincide." };
  }

  return { valid: true };
}
