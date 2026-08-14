/**
 * Lectura de variables de entorno del servidor.
 *
 * Nada de esto puede llevar el prefijo NEXT_PUBLIC_: el access token de Mercado
 * Pago da acceso total a la cuenta y jamas debe llegar al navegador.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env.local y llenala.`,
    );
  }
  return value;
}

export function mpAccessToken(): string {
  return required("MP_ACCESS_TOKEN");
}

/**
 * Secreto del webhook, que se genera en el panel de Mercado Pago al dar de alta
 * la notificacion. Sin el no se puede validar la firma de las notificaciones.
 */
export function mpWebhookSecret(): string {
  return required("MP_WEBHOOK_SECRET");
}

/**
 * URL publica del sitio. En Vercel se resuelve sola; en local hay que ponerla
 * a mano (o al tunel de ngrok, si quieres recibir webhooks reales).
 */
export function baseUrl(): string {
  const explicit = process.env.APP_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * Mercado Pago rechaza back_urls y notification_url que apunten a localhost.
 * Cuando corremos en local las omitimos para que el checkout siga funcionando,
 * y avisamos por consola de que el webhook no va a llegar.
 */
export function isPubliclyReachable(url = baseUrl()): boolean {
  return /^https:\/\//.test(url) && !/localhost|127\.0\.0\.1/.test(url);
}
