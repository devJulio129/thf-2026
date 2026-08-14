import type { Metadata } from "next";

import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Prototipos · THF 2026",
  robots: { index: false, follow: false },
};

/**
 * Indice de los prototipos originales, servidos tal cual desde /public/prototipo.
 *
 * TEMPORAL: existe para poder revisar el diseno y el sitio nuevo en el mismo
 * localhost. Se borra (junto con public/prototipo) cuando terminemos de migrar
 * las paginas.
 */

const PAGES = [
  { file: "Tampico Hybrid Fest - Landing.dc.html", name: "Landing", note: "Portada y hub de navegacion" },
  { file: "Tampico Hybrid Fest - Login.dc.html", name: "Login", note: "Acceso de atletas y de staff" },
  { file: "Tampico Hybrid Fest - Profile.dc.html", name: "Profile", note: "Equipo, emblema y PAGO" },
  { file: "Tampico Hybrid Fest - Open.dc.html", name: "Open", note: "Division Open" },
  { file: "Tampico Hybrid Fest - Community.dc.html", name: "Community", note: "Division Community" },
  { file: "Tampico Hybrid Fest - Quiz.dc.html", name: "Quiz", note: "Quiz de division" },
  { file: "Tampico Hybrid Fest - THF Game.dc.html", name: "THF Game", note: "Minijuego" },
  { file: "Tampico Hybrid Fest - Leaderboard.dc.html", name: "Leaderboard", note: "Tabla de posiciones" },
  { file: "Tampico Hybrid Fest - Sponsors.dc.html", name: "Sponsors", note: "Patrocinadores" },
  { file: "Tampico Hybrid Fest - Admin.dc.html", name: "Admin", note: "WODs y validacion de pagos" },
  { file: "map-velaria.html", name: "Mapa Velaria", note: "Croquis de la sede" },
];

export default function PrototipoPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="thf-wordmark text-3xl">Prototipos originales</h1>
        <p className="mt-3 max-w-[60ch] text-sm text-white/55">
          Son los archivos <code className="text-thf-orange">.dc.html</code> tal cual, sin
          migrar. Tardan un par de segundos en pintar porque compilan React en el navegador.
          Esta seccion es solo para revisar el diseno y desaparece cuando terminemos la
          migracion.
        </p>

        <ul className="mt-10 divide-y divide-thf-line rounded-2xl border border-thf-line bg-thf-panel">
          {PAGES.map((page) => (
            <li key={page.file}>
              <a
                href={`/prototipo/${encodeURIComponent(page.file)}`}
                className="flex items-baseline justify-between gap-4 px-5 py-4 transition hover:bg-white/5"
              >
                <span className="font-medium text-thf-cream">{page.name}</span>
                <span className="text-right text-xs text-white/45">{page.note}</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-white/40">
          Secuencia del prototipo: Landing → Login → Profile, y el cobro ocurre dentro del
          Profile como ultimo paso del armado de equipo.
        </p>
      </section>
    </SiteShell>
  );
}
