import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TeamsManager } from "@/components/admin/teams-manager";
import { WorkoutManager } from "@/components/admin/workout-manager";
import { isAdmin, listTeams, listWorkouts } from "@/lib/admin";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Panel · THF 2026",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Panel del equipo THF, portado de Tampico Hybrid Fest - Admin.dc.html.
 *
 * Publica el Comp Prep Workout de la landing y valida los pagos por
 * transferencia. Solo entra quien tiene rol staff o admin.
 */
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  if (!(await isAdmin())) {
    return (
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          background: "#080808",
          color: "#f5f3ee",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 20,
        }}
      >
        <div style={{ maxWidth: "46ch", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
          <h1 className="thf-wordmark" style={{ fontSize: 28, textTransform: "uppercase", margin: 0 }}>
            Solo para el equipo THF
          </h1>
          <p style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.7 }}>
            Tu cuenta no tiene permisos de staff. Si deberías tenerlos, pide que te asignen el rol
            desde la base de datos.
          </p>
          <Link
            href="/perfil"
            style={{
              display: "inline-block",
              marginTop: 24,
              borderRadius: 999,
              border: "1px solid rgba(244,90,11,.4)",
              background: "rgba(244,90,11,.05)",
              color: "#f45a0b",
              padding: "12px 22px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Ir a mi perfil →
          </Link>
        </div>
      </div>
    );
  }

  const [teams, workouts] = await Promise.all([listTeams(), listWorkouts()]);

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
          background: "rgba(8,8,8,.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            gap: 12,
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
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
            }}
          >
            Panel de administración
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
            Mi perfil
          </Link>
        </div>
      </header>

      <main style={{ padding: "48px 20px 96px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 48 }}>
          <WorkoutManager workouts={workouts} />
          <TeamsManager teams={teams} />
        </div>
      </main>
    </div>
  );
}
