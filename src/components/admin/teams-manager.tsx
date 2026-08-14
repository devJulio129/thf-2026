"use client";

import { useMemo, useState, useTransition } from "react";

import { Emblem } from "@/components/emblem";
import { markPaidAction, undoPaidAction } from "@/app/admin/actions";
import type { AdminTeam } from "@/lib/admin";
import { DIVISIONS, formatMXN, genderLabel } from "@/lib/thf";

type Filter = "todos" | "pendientes" | "pagados" | "CM" | "OP";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendientes", label: "Por validar" },
  { key: "pagados", label: "Pagados" },
  { key: "CM", label: "Community" },
  { key: "OP", label: "Open" },
];

/**
 * "Equipos inscritos" del panel, portado de
 * Tampico Hybrid Fest - Admin.dc.html: estadisticas, filtros y una fila por
 * equipo con el boton para validar el pago.
 */
export function TeamsManager({ teams }: { teams: AdminTeam[] }) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [error, setError] = useState<string | null>(null);
  const [busy, startAction] = useTransition();

  const stats = useMemo(() => {
    const paid = teams.filter((team) => team.status === "paid");
    const cobrado = paid.reduce((sum, team) => sum + team.amountMXN, 0);
    return [
      { label: "Equipos", value: String(teams.length), color: "#fff" },
      {
        label: "Por validar",
        value: String(teams.length - paid.length),
        color: "#f45a0b",
      },
      { label: "Pagados", value: String(paid.length), color: "#4ade80" },
      { label: "Cobrado", value: formatMXN(cobrado), color: "#fff" },
    ];
  }, [teams]);

  const visible = useMemo(() => {
    switch (filter) {
      case "pendientes":
        return teams.filter((team) => team.status !== "paid");
      case "pagados":
        return teams.filter((team) => team.status === "paid");
      case "CM":
      case "OP":
        return teams.filter((team) => team.division === filter);
      default:
        return teams;
    }
  }, [teams, filter]);

  function run(work: () => Promise<void>) {
    setError(null);
    startAction(async () => {
      try {
        await work();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo completar la acción.");
      }
    });
  }

  return (
    <section className="thf-card" style={{ padding: 32 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#f45a0b" }}>👥</span>
          <h2
            className="thf-wordmark"
            style={{ fontSize: 22, textTransform: "uppercase", margin: 0 }}
          >
            Equipos inscritos
          </h2>
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.45)",
          }}
        >
          {teams.length} {teams.length === 1 ? "equipo" : "equipos"}
        </div>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", margin: "0 0 20px" }}>
        Registros recibidos desde el portal del atleta. Valida el pago para liberar la credencial
        del equipo.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 8,
          marginBottom: 22,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(0,0,0,.25)",
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.4)",
              }}
            >
              {stat.label}
            </div>
            <div className="thf-wordmark" style={{ marginTop: 6, fontSize: 22, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {FILTERS.map((option) => {
          const active = filter === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              aria-pressed={active}
              style={{
                borderRadius: 999,
                border: `1px solid ${active ? "#f45a0b" : "rgba(255,255,255,.15)"}`,
                background: active ? "rgba(244,90,11,.14)" : "rgba(0,0,0,.3)",
                color: active ? "#fff" : "rgba(255,255,255,.6)",
                padding: "8px 14px",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" style={{ margin: "0 0 12px", fontSize: 13, color: "#f87171" }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 8 }}>
        {visible.length === 0 ? (
          <div
            style={{
              borderRadius: 12,
              border: "1px dashed rgba(255,255,255,.18)",
              padding: 24,
              textAlign: "center",
              fontSize: 13,
              color: "rgba(255,255,255,.5)",
            }}
          >
            Sin equipos en este filtro.
          </div>
        ) : (
          visible.map((team) => {
            const paid = team.status === "paid";
            const byTransfer = team.paymentMethod === "transferencia";

            return (
              <div key={team.id} className="thf-admin-row">
                <div style={{ width: 34, height: 34 }}>
                  <Emblem spec={team.emblem} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    className="thf-wordmark"
                    style={{ fontSize: 15, textTransform: "uppercase", color: "#fff" }}
                  >
                    {team.name}
                  </div>
                  <div style={{ marginTop: 3, fontSize: 11, color: "rgba(255,255,255,.45)" }}>
                    {team.athletes.map((athlete) => athlete.name).join(" · ")}
                  </div>
                  {paid ? (
                    <div style={{ marginTop: 3, fontSize: 10, color: "rgba(255,255,255,.35)" }}>
                      {byTransfer ? "Validado a mano" : "Mercado Pago"}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.62)",
                  }}
                >
                  {DIVISIONS[team.division].name}
                  <div style={{ marginTop: 2, color: "rgba(255,255,255,.4)" }}>
                    {formatMXN(team.amountMXN)}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.62)",
                  }}
                >
                  {genderLabel(team.gender)}
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (paid) {
                      if (!window.confirm(`¿Marcar "${team.name}" como pendiente otra vez?`)) return;
                      run(() => undoPaidAction(team.id));
                    } else {
                      if (
                        !window.confirm(
                          `¿Confirmas que recibiste ${formatMXN(team.amountMXN)} de "${team.name}"?`,
                        )
                      ) {
                        return;
                      }
                      run(() => markPaidAction(team.id));
                    }
                  }}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${paid ? "rgba(34,197,94,.35)" : "rgba(244,90,11,.4)"}`,
                    background: paid ? "rgba(34,197,94,.1)" : "rgba(244,90,11,.1)",
                    color: paid ? "#4ade80" : "#f45a0b",
                    padding: "7px 10px",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: busy ? "wait" : "pointer",
                    fontFamily: "inherit",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {paid ? "✓ Pagado" : "Validar pago"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
