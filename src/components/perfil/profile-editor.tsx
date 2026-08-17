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
  phone: string;
  emergencyPhone: string;
  avatarUrl: string | null;
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.45)",
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
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.4)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ color: "rgba(255,255,255,.92)", fontSize: 15, lineHeight: 1.4 }}>
        {value || "—"}
      </div>
    </div>
  );
}

function SectionTitle({ children, orange }: { children: string; orange?: boolean }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: orange ? "#f45a0b" : "rgba(255,255,255,.45)",
        margin: "0 0 12px",
      }}
    >
      {children}
    </div>
  );
}

/** Los campos editables de un atleta. El prefijo separa atleta 1 de atleta 2. */
function AthleteFields({ prefix, data }: { prefix: string; data: ProfileData }) {
  return (
    <div className="thf-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
      <div>
        <label style={labelStyle} htmlFor={`${prefix}-name`}>
          Nombre
        </label>
        <input
          id={`${prefix}-name`}
          name={`${prefix}-name`}
          className="thf-input"
          defaultValue={data.displayName}
          placeholder="Nombre completo"
          required
          minLength={2}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${prefix}-city`}>
          Ciudad
        </label>
        <input
          id={`${prefix}-city`}
          name={`${prefix}-city`}
          className="thf-input"
          defaultValue={data.city}
          placeholder="Tampico, Madero, Altamira…"
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${prefix}-birth`}>
          Fecha de nacimiento
        </label>
        <input
          id={`${prefix}-birth`}
          name={`${prefix}-birth`}
          type="date"
          className="thf-input"
          defaultValue={data.birthDate}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${prefix}-shirt`}>
          Talla de playera
        </label>
        <select
          id={`${prefix}-shirt`}
          name={`${prefix}-shirt`}
          className="thf-input"
          defaultValue={data.shirtSize || "M"}
        >
          {SHIRT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${prefix}-phone`}>
          Teléfono
        </label>
        <input
          id={`${prefix}-phone`}
          name={`${prefix}-phone`}
          type="tel"
          inputMode="tel"
          className="thf-input"
          defaultValue={data.phone}
          placeholder="10 dígitos"
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${prefix}-emergency`}>
          Tel. de emergencia
        </label>
        <input
          id={`${prefix}-emergency`}
          name={`${prefix}-emergency`}
          type="tel"
          inputMode="tel"
          className="thf-input"
          defaultValue={data.emergencyPhone}
          placeholder="10 dígitos"
        />
      </div>
    </div>
  );
}

/**
 * "Editar perfil" del prototipo, ampliado: un solo boton de editar abre los
 * datos de LOS DOS atletas (los del 2 viven en el equipo y los guarda el
 * capitan), incluidos telefono y telefono de emergencia.
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
    { label: "Teléfono", value: data.phone },
    { label: "Emergencia", value: data.emergencyPhone },
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
        <form action={formAction} style={{ display: "grid", gap: 24 }}>
          <div>
            <SectionTitle>Atleta 1 · tú</SectionTitle>
            <AthleteFields prefix="athlete1" data={profile} />
          </div>

          {partner ? (
            <div>
              <SectionTitle orange>Atleta 2 · tu pareja</SectionTitle>
              <AthleteFields prefix="athlete2" data={partner} />
            </div>
          ) : null}

          {state.error ? (
            <p role="alert" style={{ fontSize: 13, color: "#f87171", margin: 0 }}>
              {state.error}
            </p>
          ) : null}

          <div>
            <button
              type="submit"
              disabled={pending}
              style={{
                borderRadius: 999,
                background: "#f45a0b",
                color: "#000",
                padding: "13px 26px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                opacity: pending ? 0.6 : 1,
              }}
            >
              {pending ? "Guardando…" : "💾 Guardar los dos"}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <SectionTitle>Atleta 1 · tú</SectionTitle>
          <div className="thf-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
            {rowsFor(profile).map((row) => (
              <InfoBox key={row.label} label={row.label} value={row.value} />
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <SectionTitle orange>Atleta 2 · tu pareja</SectionTitle>
            {partner ? (
              <div className="thf-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
                {rowsFor(partner).map((row) => (
                  <InfoBox key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: 0, lineHeight: 1.6 }}>
                Los datos de tu pareja se llenan al crear el equipo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
