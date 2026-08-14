import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Acceso · THF 2026",
};

/**
 * Acceso de atletas, portado de Tampico Hybrid Fest - Login.dc.html: foto de La
 * Velaria al fondo, dos orbes naranjas difuminados y la tarjeta con blur.
 */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const next = typeof query.next === "string" ? query.next : "/perfil";

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#080808",
        color: "#f5f3ee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/p-velaria-sun.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "50% 44%",
          filter: "saturate(.9)",
          opacity: 0.62,
          transform: "scale(1.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(8,8,8,.74), rgba(8,8,8,.6))",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          top: "-15%",
          right: "-15%",
          opacity: 0.45,
          background: "radial-gradient(circle, #f26b1f 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "thf-orb 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          bottom: "-15%",
          left: "-15%",
          opacity: 0.3,
          background: "radial-gradient(circle, #ff7a2e 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "thf-orb 12s ease-in-out infinite 2s",
          pointerEvents: "none",
        }}
      />

      <Link
        href="/"
        style={{
          position: "absolute",
          top: 24,
          left: 20,
          zIndex: 20,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.6)",
        }}
      >
        ← Volver
      </Link>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420 }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 32,
            color: "#f5f3ee",
          }}
        >
          <span
            style={{
              display: "block",
              width: 26,
              height: 26,
              border: "3px solid #f45a0b",
              borderLeftColor: "transparent",
              borderBottomColor: "transparent",
              borderRadius: "50%",
              transform: "rotate(25deg) skewX(-8deg)",
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em" }}>
            TAMPICO <span style={{ color: "#f45a0b" }}>HYBRID FEST</span>
          </span>
        </Link>

        <LoginForm next={next} />

        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,.4)",
          }}
        >
          <span>📅 14 — 15 Nov 2026</span>
          <span style={{ width: 1, height: 12, background: "rgba(255,255,255,.15)" }} />
          <span>📍 La Velaria · Recinto Ferial Tampico</span>
        </div>
      </div>
    </div>
  );
}
