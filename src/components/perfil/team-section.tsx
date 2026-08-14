"use client";

import { useState } from "react";

import { TeamBuilder } from "@/components/perfil/team-builder";
import { TeamPanel } from "@/components/perfil/team-panel";

type Team = {
  name: string;
  division: "CM" | "OP";
  divisionLabel: string;
  genderLabel: string;
  amountMXN: number;
  status: "awaiting_payment" | "paid";
  emblem: unknown;
  athletes: { name: string; email: string; shirtSize: string }[];
};

/**
 * Tarjeta "Mi equipo" del prototipo, con sus tres estados: sin equipo, alta en
 * curso, y equipo registrado con su bloque de pago.
 */
export function TeamSection({
  team,
  defaultName,
  defaultEmail,
}: {
  team: Team | null;
  defaultName: string;
  defaultEmail: string;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="thf-card" style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ color: "#f45a0b" }}>👥</span>
        <h2 className="thf-wordmark" style={{ fontSize: 22, textTransform: "uppercase", margin: 0 }}>
          Mi equipo
        </h2>
      </div>

      {team ? (
        <TeamPanel team={team} />
      ) : creating ? (
        <TeamBuilder
          defaultName={defaultName}
          defaultEmail={defaultEmail}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1px solid rgba(244,90,11,.3)",
              background: "rgba(244,90,11,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 22,
            }}
          >
            👥
          </div>
          <h3
            className="thf-wordmark"
            style={{ fontSize: 24, textTransform: "uppercase", margin: "0 0 12px" }}
          >
            Aún no tienes equipo
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,.6)",
              maxWidth: "44ch",
              margin: "0 auto 24px",
            }}
          >
            Crea tu escuadra de 2 atletas, elige un emblema único y paga la inscripción completa
            desde tu perfil.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            style={{
              borderRadius: 999,
              background: "#f45a0b",
              color: "#000",
              padding: "12px 24px",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Crear equipo
          </button>
        </div>
      )}
    </div>
  );
}
