"use client";

import type { CSSProperties } from "react";
import { useActionState, useState } from "react";

import { saveProfileAction, type ProfileFormState } from "@/app/perfil/actions";
import { SHIRT_SIZES } from "@/lib/thf";

const INITIAL: ProfileFormState = { error: null };

export type ProfileData = {
  displayName: string;
  city: string;
  birthDate: string;
  shirtSize: string;
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.4)",
  display: "block",
  marginBottom: 8,
};

/** Tarjeta de solo lectura con un dato del atleta. */
function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.1)",
        background: "rgba(0,0,0,.2)",
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.4)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ color: "rgba(255,255,255,.9)" }}>{value || "—"}</div>
    </div>
  );
}

/**
 * "Editar perfil" del prototipo: alterna entre la vista de datos y el
 * formulario. Los datos del atleta 2 salen del equipo, asi que aqui solo se
 * editan los propios.
 */
export function ProfileEditor({
  profile,
  partner,
}: {
  profile: ProfileData;
  partner: ProfileData | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(saveProfileAction, INITIAL);

  const rowsFor = (data: ProfileData) => [
    { label: "Nombre", value: data.displayName },
    { label: "Ciudad", value: data.city },
    { label: "Nacimiento", value: data.birthDate },
    { label: "Playera", value: data.shirtSize },
  ];

  return (
    <div className="thf-card" style={{ padding: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
              marginBottom: 4,
            }}
          >
            Datos personales
          </div>
          <h2 className="thf-wordmark" style={{ fontSize: 22, textTransform: "uppercase", margin: 0 }}>
            Editar perfil
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.2)",
            background: "none",
            color: "#fff",
            // 11px de alto para que el area tactil pase de 44px en telefono.
            padding: "11px 16px",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          ✎ {editing ? "Cancelar" : "Editar"}
        </button>
      </div>

      {editing ? (
        <form
          action={formAction}
          style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}
        >
          <div>
            <label style={labelStyle} htmlFor="displayName">
              Nombre / Apodo
            </label>
            <input
              id="displayName"
              name="displayName"
              className="thf-input"
              defaultValue={profile.displayName}
              placeholder="Cómo te conocen"
              required
              minLength={2}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="city">
              Ciudad
            </label>
            <input
              id="city"
              name="city"
              className="thf-input"
              defaultValue={profile.city}
              placeholder="Tampico, Madero, Altamira…"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="birthDate">
              Fecha de nacimiento
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              className="thf-input"
              defaultValue={profile.birthDate}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="shirtSize">
              Talla de playera
            </label>
            <select
              id="shirtSize"
              name="shirtSize"
              className="thf-input"
              defaultValue={profile.shirtSize || "M"}
            >
              {SHIRT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {state.error ? (
            <p role="alert" style={{ gridColumn: "span 2", fontSize: 13, color: "#f87171", margin: 0 }}>
              {state.error}
            </p>
          ) : null}

          <div style={{ gridColumn: "span 2" }}>
            <button
              type="submit"
              disabled={pending}
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
                opacity: pending ? 0.6 : 1,
              }}
            >
              {pending ? "Guardando…" : "💾 Guardar"}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.45)",
              marginBottom: 12,
            }}
          >
            Atleta 1
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
            {rowsFor(profile).map((row) => (
              <InfoBox key={row.label} label={row.label} value={row.value} />
            ))}
          </div>

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
              margin: "24px 0 12px",
            }}
          >
            Atleta 2 · tu pareja
          </div>
          {partner ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
              {rowsFor(partner).map((row) => (
                <InfoBox key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: 0 }}>
              Los datos de tu pareja se llenan al crear el equipo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
