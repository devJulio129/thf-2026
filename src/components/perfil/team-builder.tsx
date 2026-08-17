"use client";

import type { CSSProperties } from "react";
import { useActionState, useState } from "react";

import { EmblemEditor } from "@/components/perfil/emblem-editor";
import { createTeamAction, type TeamFormState } from "@/app/perfil/actions";
import { DEFAULT_EMBLEM, type EmblemSpec } from "@/lib/emblem";
import {
  DIVISION_IDS,
  DIVISIONS,
  GENDERS,
  formatMXN,
  type Division,
  type TeamGender,
} from "@/lib/thf";

const INITIAL: TeamFormState = { error: null };

const labelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.4)",
  display: "block",
  marginBottom: 8,
};

const primaryButton: CSSProperties = {
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
};

const ghostButton: CSSProperties = {
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.2)",
  background: "none",
  color: "#fff",
  padding: "12px 24px",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  cursor: "pointer",
};

/**
 * Alta del equipo, portada de Tampico Hybrid Fest - Profile.dc.html: nombre,
 * emblema por capas, los dos atletas y la categoria de la pareja.
 */
export function TeamBuilder({
  athletes,
  prices,
  onCancel,
}: {
  /** Resumen de los dos atletas, tal como estan en Datos personales. */
  athletes: { name: string; email: string }[];
  /** Precios de la fase activa: lo que se pinta es lo que se va a cobrar. */
  prices: { CM: number; OP: number };
  onCancel: () => void;
}) {
  const [emblem, setEmblem] = useState<EmblemSpec>(DEFAULT_EMBLEM);
  const [division, setDivision] = useState<Division>("CM");
  const [gender, setGender] = useState<TeamGender>("MX");
  const [state, formAction, pending] = useActionState(createTeamAction, INITIAL);

  return (
    <form action={formAction} style={{ display: "grid", gap: 20 }}>
      <input type="hidden" name="emblem" value={JSON.stringify(emblem)} />
      <input type="hidden" name="division" value={division} />
      <input type="hidden" name="gender" value={gender} />

      <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#f45a0b" }}>
        Nuevo equipo
      </div>

      <div>
        <label style={labelStyle} htmlFor="teamName">
          Nombre del equipo
        </label>
        <input
          id="teamName"
          name="teamName"
          className="thf-input"
          placeholder="Ej. Alacranes Tampico"
          required
          minLength={2}
        />
      </div>

      <EmblemEditor value={emblem} onChange={setEmblem} />

      <div>
        <label style={labelStyle}>División</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          {DIVISION_IDS.map((id) => {
            const info = DIVISIONS[id];
            const selected = division === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setDivision(id)}
                aria-pressed={selected}
                style={{
                  borderRadius: 14,
                  border: `1px solid ${selected ? "#f45a0b" : "rgba(255,255,255,.15)"}`,
                  background: selected ? "rgba(244,90,11,.14)" : "rgba(0,0,0,.3)",
                  color: selected ? "#fff" : "rgba(255,255,255,.65)",
                  padding: "14px 12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <div
                  className="thf-wordmark"
                  style={{ fontSize: 18, textTransform: "uppercase" }}
                >
                  {info.name}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#f45a0b" }}>
                  {formatMXN(prices[id])} por pareja
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Atletas (2 por equipo)</label>
        {/* Los datos personales viven en "Datos personales": aqui solo se
            confirma con quien se registra el equipo. */}
        <div style={{ display: "grid", gap: 8 }}>
          {athletes.map((athlete, index) => (
            <div
              key={index}
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(0,0,0,.25)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  color: index === 0 ? "#f45a0b" : "rgba(255,255,255,.45)",
                }}
              >
                {index + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.9)" }}>
                  {athlete.name || "Sin nombre"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.45)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {athlete.email || "sin correo"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 11, color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>
          Los datos de los dos atletas (teléfonos, tallas, emergencia) se toman de{" "}
          <strong style={{ color: "rgba(255,255,255,.7)" }}>Datos personales</strong>. Si algo
          falta o está mal, edítalo ahí antes de crear el equipo.
        </p>
      </div>

      <div>
        <label style={{ ...labelStyle, marginBottom: 10 }}>Categoría del equipo</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
          {GENDERS.map((option) => {
            const selected = gender === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setGender(option.key)}
                aria-pressed={selected}
                style={{
                  borderRadius: 14,
                  border: `1px solid ${selected ? "#f45a0b" : "rgba(255,255,255,.15)"}`,
                  background: selected ? "rgba(244,90,11,.14)" : "rgba(0,0,0,.3)",
                  color: selected ? "#fff" : "rgba(255,255,255,.65)",
                  padding: "14px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18 }}>{option.icon}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {option.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lo que se va a cobrar, siempre a la vista y siguiendo a la division. */}
      <div
        style={{
          borderRadius: 16,
          border: "1px solid rgba(244,90,11,.3)",
          background: "rgba(244,90,11,.07)",
          padding: 16,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.5)",
            }}
          >
            Inscripción por pareja · {DIVISIONS[division].name}
          </div>
          <div className="thf-wordmark" style={{ marginTop: 4, fontSize: 26, color: "#f45a0b" }}>
            {formatMXN(prices[division])} MXN
          </div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", maxWidth: "34ch" }}>
          El pago se hace después de guardar el equipo, y puedes cambiar de categoría hasta que se
          registre.
        </div>
      </div>

      {state.error ? (
        <p role="alert" style={{ fontSize: 13, color: "#f87171", margin: 0 }}>
          {state.error}
        </p>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button type="submit" disabled={pending} style={{ ...primaryButton, opacity: pending ? 0.6 : 1 }}>
          {pending ? "Guardando…" : "Crear equipo"}
        </button>
        <button type="button" onClick={onCancel} style={ghostButton}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
