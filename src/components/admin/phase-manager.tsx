"use client";

import { useState, useTransition } from "react";

import { activatePhaseAction } from "@/app/admin/actions";
import type { PricePhase } from "@/lib/admin";
import { formatMXN } from "@/lib/thf";

/**
 * Fases de precios: cuatro botones, uno por fase, y la vigente resaltada.
 *
 * El cambio de fase es decision del staff, no un automatismo: el cupo de
 * parejas pagadas se muestra como referencia para saber cuando apretar.
 * Al activar una fase, todo lo que se pinta y se cobra usa sus precios;
 * los equipos que ya pagaron conservan su monto.
 */
export function PhaseManager({
  phases,
  paidPairs,
}: {
  phases: PricePhase[];
  paidPairs: number;
}) {
  const [busy, startAction] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const active = phases.find((p) => p.active) ?? null;

  function cupoLabel(phase: PricePhase): string {
    return phase.toPairs === null
      ? `${phase.fromPairs}+ parejas`
      : `${phase.fromPairs}–${phase.toPairs} parejas`;
  }

  return (
    <section className="thf-card" style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ color: "#f45a0b" }}>💰</span>
        <h2 className="thf-wordmark" style={{ fontSize: 22, textTransform: "uppercase", margin: 0 }}>
          Fase de precios
        </h2>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", margin: "0 0 8px" }}>
        La fase activa decide lo que cobra la inscripción en todo el sitio. Los equipos que ya
        pagaron conservan su precio.
      </p>
      <p style={{ fontSize: 13, margin: "0 0 24px", color: "rgba(255,255,255,.7)" }}>
        Parejas pagadas hasta ahora: <strong style={{ color: "#f45a0b" }}>{paidPairs}</strong>
        {active?.toPairs != null ? (
          <span style={{ color: "rgba(255,255,255,.45)" }}>
            {" "}
            · el tramo de {active.label} llega hasta {active.toPairs}
          </span>
        ) : null}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {phases.map((phase) => {
          const selected = phase.active;
          return (
            <button
              key={phase.phase}
              type="button"
              disabled={busy || selected}
              onClick={() => {
                setError(null);
                startAction(async () => {
                  try {
                    await activatePhaseAction(phase.phase);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "No se pudo cambiar la fase.");
                  }
                });
              }}
              aria-pressed={selected}
              style={{
                borderRadius: 14,
                border: `1px solid ${selected ? "#f45a0b" : "rgba(255,255,255,.15)"}`,
                background: selected ? "rgba(244,90,11,.14)" : "rgba(0,0,0,.3)",
                color: selected ? "#fff" : "rgba(255,255,255,.65)",
                padding: "16px 14px",
                cursor: selected ? "default" : busy ? "wait" : "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                opacity: busy && !selected ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span className="thf-wordmark" style={{ fontSize: 16, textTransform: "uppercase" }}>
                  {phase.label}
                </span>
                {selected ? (
                  <span style={{ fontSize: 10, color: "#f45a0b", letterSpacing: "0.1em" }}>
                    ACTIVA
                  </span>
                ) : null}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,.45)" }}>
                {cupoLabel(phase)}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: selected ? "#f45a0b" : "rgba(255,255,255,.6)",
                }}
              >
                Community {formatMXN(phase.priceCM)}
                <br />
                Open {formatMXN(phase.priceOP)}
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" style={{ margin: "14px 0 0", fontSize: 12, color: "#f87171" }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}
