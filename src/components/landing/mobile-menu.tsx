"use client";

import { useEffect, useState } from "react";

type MenuLink = { label: string; href: string };

/**
 * Menu de navegacion para telefono: el icono de tres lineas abre un panel a
 * pantalla completa con las mismas pestanas que el nav de escritorio (que en
 * pantallas chicas va oculto). Solo se pinta bajo 860px, igual que el corte
 * donde desaparecen los enlaces.
 */
export function MobileMenu({ links, portalHref }: { links: MenuLink[]; portalHref: string }) {
  const [open, setOpen] = useState(false);

  // Con el panel abierto, la pagina de atras no debe scrollear.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="thf-mobile-menu">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 5,
          width: 44,
          height: 44,
          padding: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{ display: "block", height: 2, background: "#090909" }} />
        <span style={{ display: "block", height: 2, background: "#f45a0b" }} />
        <span style={{ display: "block", height: 2, background: "#090909" }} />
      </button>

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#0a0a0a",
            color: "#f5f3ee",
            display: "flex",
            flexDirection: "column",
            padding: "0 24px 32px",
          }}
        >
          <div
            style={{
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="thf-wordmark" style={{ fontSize: 14, fontWeight: 900 }}>
              TAMPICO HYBRID <span style={{ color: "#f45a0b" }}>FEST 2026</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              style={{
                width: 44,
                height: 44,
                background: "none",
                border: "none",
                color: "#f5f3ee",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <nav style={{ display: "grid", gap: 4, marginTop: 24 }}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="thf-wordmark"
                style={{
                  fontSize: 28,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  color: "#f5f3ee",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,.1)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href={portalHref}
            onClick={() => setOpen(false)}
            style={{
              marginTop: "auto",
              display: "block",
              textAlign: "center",
              background: "#f45a0b",
              color: "#000",
              padding: "16px 0",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Entrar al portal →
          </a>
        </div>
      ) : null}
    </div>
  );
}
