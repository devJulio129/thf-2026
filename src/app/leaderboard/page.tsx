import type { Metadata } from "next";
import Link from "next/link";

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { getLeaderboard } from "@/lib/leaderboard";
import { ROUTES } from "@/lib/landing-data";

export const metadata: Metadata = {
  title: "Leaderboard · THF 2026",
  description: "Parejas inscritas y confirmadas para el Tampico Hybrid Fest 2026.",
};

/** Se actualiza conforme entran pagos, asi que no se cachea. */
export const dynamic = "force-dynamic";

/** Cupos de la primera fase, con kit Founder Edition. */
const FOUNDER_SLOTS = 50;

export default async function LeaderboardPage() {
  const teams = await getLeaderboard();
  const community = teams.filter((team) => team.division === "CM").length;
  const open = teams.filter((team) => team.division === "OP").length;

  const stats = [
    {
      label: "Parejas inscritas",
      value: String(teams.length),
      note: `de ${FOUNDER_SLOTS} en Fase 1 · Founders`,
      noteColor: "rgba(255,255,255,.45)",
    },
    {
      label: "Community",
      value: String(community),
      note: "Hybrid Race · sábado 14",
      noteColor: "rgba(255,255,255,.45)",
    },
    {
      label: "Open",
      value: String(open),
      note: "Dos días · ranking THF",
      noteColor: "rgba(255,255,255,.45)",
    },
    {
      label: "Cupos Founder",
      value: String(Math.max(0, FOUNDER_SLOTS - teams.length)),
      note: "Kit Founder Edition disponible",
      noteColor: "#f45a0b",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#080808",
        color: "#f5f3ee",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,.1)",
          background: "rgba(8,8,8,.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="thf-lb-nav"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "0 20px",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.6)",
            }}
          >
            ← Inicio
          </Link>
          <div className="thf-tabs">
            <span style={{ background: "#f45a0b", color: "#000" }}>Leaderboard</span>
            <a href={ROUTES.game} style={{ color: "rgba(255,255,255,.6)" }}>
              THF Game
            </a>
          </div>
          <Link
            href="/perfil"
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.6)",
            }}
          >
            Inscribirme →
          </Link>
        </div>
      </header>

      <section
        style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 20px 40px" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/assets/p-velaria-in.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "50% 62%",
            filter: "saturate(.85)",
            opacity: 0.62,
            transform: "scale(1.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(8,8,8,.66), rgba(8,8,8,.95))",
          }}
        />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
              margin: "0 0 16px",
            }}
          >
            THF 2026
          </p>
          <h1
            className="thf-wordmark"
            style={{
              // El piso en 2.4rem es para que "Leaderboard." quepa en 390px;
              // en escritorio el clamp resuelve igual que antes.
              fontSize: "clamp(2.4rem,7vw,6rem)",
              textTransform: "uppercase",
              lineHeight: 0.88,
              margin: 0,
              maxWidth: "20ch",
            }}
          >
            Leader<span style={{ color: "#f45a0b" }}>board.</span>
          </h1>

          <div
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.02)",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.4)",
                  }}
                >
                  {stat.label}
                </div>
                <div className="thf-wordmark" style={{ marginTop: 10, fontSize: 30 }}>
                  {stat.value}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: stat.noteColor }}>{stat.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 20px 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <LeaderboardTable teams={teams} />

          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", margin: 0, maxWidth: "60ch" }}>
              La lista se actualiza cuando el equipo THF valida datos y pago. Las primeras{" "}
              {FOUNDER_SLOTS} parejas conservan el kit Founder Edition.
            </p>
            <Link
              href="/perfil"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 999,
                background: "#f45a0b",
                color: "#000",
                padding: "16px 26px",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Sumar a mi pareja →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
