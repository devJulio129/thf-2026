import path from "node:path";
import type { NextConfig } from "next";

/**
 * Content-Security-Policy del sitio.
 *
 * Los limites que importan: nada de scripts de terceros, nada de iframes que
 * nos embeban (anti-clickjacking), conexiones solo a nosotros y a Supabase
 * (auth, base y las fotos de perfil en Storage).
 *
 * 'unsafe-inline' esta a proposito: el diseno portado de los prototipos vive
 * en estilos inline, y Next inyecta sus propios scripts inline. Quitarlo
 * exigiria nonces en todo el arbol; el valor marginal no paga romper el sitio.
 */
function strictCsp(): string {
  // En Vercel es el proyecto de produccion; en local, el Supabase de Docker.
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabase}`,
    `connect-src 'self' ${supabase}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/**
 * Los prototipos .dc.html y el mapa de La Velaria son documentos estaticos que
 * cargan Google Fonts, Leaflet (unpkg) y los tiles de OpenStreetMap. Ademas la
 * landing embebe el mapa en un iframe, asi que aqui frame-ancestors debe ser
 * 'self' y no 'none'.
 */
function prototypeCsp(): string {
  return [
    "default-src 'self'",
    // unsafe-eval SOLO aqui: el runtime de DC del THF Game evalua expresiones.
    // El sitio principal no lo lleva.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

const baseHeaders = [
  // El navegador no debe adivinar tipos de contenido.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Al salir del sitio (p. ej. a Mercado Pago) solo viaja el origen.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No usamos camara, microfono ni ubicacion; que quede prohibido.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // El proyecto vive dentro de OneDrive, debajo de C:\Users\Admin, donde hay un
  // package-lock.json suelto. Sin esto Turbopack sube demasiado a buscar la raiz.
  turbopack: { root: path.resolve(".") },

  // No hay por que anunciar el framework en cada respuesta.
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Todo el sitio salvo los prototipos y el mapa.
        source: "/((?!prototipo|map-velaria\\.html).*)",
        headers: [
          ...baseHeaders,
          // Nadie puede meternos en un iframe (clickjacking sobre el pago).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: strictCsp() },
        ],
      },
      {
        source: "/prototipo/:path*",
        headers: [
          ...baseHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: prototypeCsp() },
        ],
      },
      {
        source: "/map-velaria.html",
        headers: [
          ...baseHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: prototypeCsp() },
        ],
      },
    ];
  },
};

export default nextConfig;
