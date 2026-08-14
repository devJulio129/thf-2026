"use client";

import { useMemo, useState } from "react";

import { Emblem } from "@/components/emblem";
import type { LeaderboardTeam } from "@/lib/leaderboard";
import { DIVISIONS } from "@/lib/thf";

/** Rejilla de la tabla: se repite en el encabezado y en cada fila. */
const GRID = "64px 88px minmax(0,1.1fr) minmax(0,1.2fr) minmax(0,0.7fr) 150px";

type Filter = "CM" | "OP";

/**
 * Tabla del leaderboard, portada de
 * Tampico Hybrid Fest - Leaderboard.dc.html: pestañas de division, buscador y
 * una fila por pareja con su emblema.
 */
export function LeaderboardTable({ teams }: { teams: LeaderboardTeam[] }) {
  const [filter, setFilter] = useState<Filter>("CM");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return teams
      .filter((team) => team.division === filter)
      .filter((team) => {
        if (!needle) return true;
        return (
          team.name.toLowerCase().includes(needle) ||
          team.city.toLowerCase().includes(needle) ||
          team.athletes.some((athlete) => athlete.toLowerCase().includes(needle))
        );
      });
  }, [teams, filter, query]);

  const divisionNote =
    filter === "OP" ? "Dos días · ranking THF" : "Hybrid Race · sábado 14";

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            border: "1px solid rgba(255,255,255,.16)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          {(["CM", "OP"] as const).map((id) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={active}
                style={{
                  padding: "14px 34px",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  border: 0,
                  cursor: "pointer",
                  background: active ? "#f45a0b" : "transparent",
                  color: active ? "#000" : "rgba(255,255,255,.6)",
                }}
              >
                {DIVISIONS[id].name}
              </button>
            );
          })}
        </div>

        <div style={{ minWidth: 240, flex: 1, maxWidth: 340 }}>
          <input
            className="thf-round-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar equipo, atleta o ciudad…"
            aria-label="Buscar en el leaderboard"
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 24,
          paddingBottom: 18,
          borderBottom: "1px solid rgba(255,255,255,.12)",
        }}
      >
        <div
          className="thf-wordmark"
          style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", textTransform: "uppercase" }}
        >
          {DIVISIONS[filter].name}{" "}
          <span style={{ color: "#f45a0b" }}>
            · {visible.length} {visible.length === 1 ? "pareja" : "parejas"}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.45)",
          }}
        >
          {divisionNote}
        </div>
      </div>

      <div className="thf-lb-head" style={{ gridTemplateColumns: GRID }}>
        <div>#</div>
        <div>Emblema</div>
        <div>Equipo</div>
        <div>Atletas</div>
        <div>Ciudad</div>
        <div>Registro</div>
      </div>

      {visible.length > 0 ? (
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((team, index) => (
            <div key={team.id} className="thf-lb-row" style={{ gridTemplateColumns: GRID }}>
              <div
                className="thf-wordmark"
                style={{ fontSize: 22, color: index < 3 ? "#f45a0b" : "rgba(255,255,255,.45)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div style={{ width: 60, height: 60 }}>
                <Emblem spec={team.emblem} />
              </div>
              <div>
                <div
                  className="thf-wordmark"
                  style={{ fontSize: 20, textTransform: "uppercase", lineHeight: 1.05 }}
                >
                  {team.name}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#4ade80",
                  }}
                >
                  Inscripción confirmada
                </div>
              </div>
              <div style={{ display: "grid", gap: 6, fontSize: 14, color: "rgba(255,255,255,.82)" }}>
                {team.athletes.map((athlete, athleteIndex) => (
                  <div key={athlete + athleteIndex}>
                    <span
                      style={{
                        color: athleteIndex === 0 ? "#f45a0b" : "rgba(255,255,255,.35)",
                        fontSize: 11,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginRight: 8,
                      }}
                    >
                      A{athleteIndex + 1}
                    </span>
                    {athlete}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)" }}>{team.city}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{team.registered}</div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            border: "1px dashed rgba(255,255,255,.18)",
            borderRadius: 18,
            padding: "48px 24px",
            textAlign: "center",
            color: "rgba(255,255,255,.5)",
            fontSize: 14,
          }}
        >
          {query.trim()
            ? "Ninguna pareja coincide con esa búsqueda."
            : `Todavía no hay parejas confirmadas en ${DIVISIONS[filter].name}. Las inscripciones aparecen aquí en cuanto se registra el pago.`}
        </div>
      )}
    </>
  );
}
