import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-thf-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="thf-wordmark text-lg tracking-wide">
            Tampico <span className="text-thf-orange">Hybrid</span> Fest
          </Link>
          <Link
            href="/perfil"
            className="text-xs font-bold uppercase tracking-[0.18em] text-thf-orange hover:text-thf-orange-hi"
          >
            Inscribirme
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-thf-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs text-white/40">
          <span>THF 2026 · Tampico, Tamaulipas · Pagos procesados por Mercado Pago</span>
          {/* TEMPORAL: acceso a los prototipos sin migrar. Quitar al terminar. */}
          <Link href="/prototipo" className="hover:text-white/70">
            Ver prototipos
          </Link>
        </div>
      </footer>
    </>
  );
}
