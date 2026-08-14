"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";

import { Emblem } from "@/components/emblem";
import { DivisionPicker } from "@/components/perfil/division-picker";
import { deleteTeamAction } from "@/app/perfil/actions";
import { safeEmblem } from "@/lib/emblem";
import { BANK_DATA, WHATSAPP_URL, formatMXN, type Division } from "@/lib/thf";

type Props = {
  team: {
    name: string;
    division: Division;
    divisionLabel: string;
    genderLabel: string;
    amountMXN: number;
    status: "awaiting_payment" | "paid";
    emblem: unknown;
    athletes: { name: string; email: string; shirtSize: string }[];
  };
};

/** Fila con el dato bancario y su boton de copiar. */
function BankRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles no pasa nada: el dato esta a la vista.
    }
  }

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.1)",
        background: "rgba(0,0,0,.35)",
        padding: "12px 14px",
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
        {label}
      </div>
      <div
        style={{
          marginTop: 5,
          fontSize: 15,
          color: "#fff",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          overflowX: "auto",
        }}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={copy}
        style={{
          marginTop: 10,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.2)",
          background: "none",
          color: "rgba(255,255,255,.8)",
          padding: "7px 12px",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

/**
 * Equipo ya registrado y bloque de pago, portados de
 * Tampico Hybrid Fest - Profile.dc.html.
 */
export function TeamPanel({ team }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [deleting, startDelete] = useTransition();

  const paid = team.status === "paid";
  const emblem = safeEmblem(team.emblem);
  const total = formatMXN(team.amountMXN);

  const payRows = [
    { label: "Modalidad", value: team.divisionLabel },
    { label: "Cubre", value: "Los 2 atletas del equipo" },
    { label: "Método", value: "Mercado Pago · pago único" },
    { label: "Categoría", value: team.genderLabel },
  ];

  async function pay() {
    setError(null);
    setStarting(true);
    try {
      // Sin cuerpo: el servidor resuelve equipo y monto desde la sesion.
      const response = await fetch("/api/checkout", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No pudimos iniciar el pago.");
      window.location.href = payload.checkoutUrl;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error inesperado.");
      setStarting(false);
    }
  }

  const pillButton: CSSProperties = {
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ width: 72, height: 72, flexShrink: 0 }}>
          <Emblem spec={emblem} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
              marginBottom: 4,
            }}
          >
            Equipo · {team.divisionLabel} · {team.genderLabel}
          </div>
          <div className="thf-wordmark" style={{ fontSize: 24, textTransform: "uppercase" }}>
            {team.name}
          </div>
        </div>
        {!paid ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (!window.confirm("¿Eliminar tu equipo? Se pierde el emblema y el registro.")) {
                  return;
                }
                startDelete(() => {
                  void deleteTeamAction();
                });
              }}
              style={{
                ...pillButton,
                border: "1px solid rgba(239,68,68,.35)",
                background: "rgba(239,68,68,.08)",
                color: "#f87171",
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? "Eliminando…" : "🗑 Eliminar"}
            </button>
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
        {team.athletes.map((athlete, index) => (
          <div
            key={index}
            style={{
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(0,0,0,.3)",
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(244,90,11,.1)",
                border: "1px solid rgba(244,90,11,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#f45a0b",
                flexShrink: 0,
              }}
            >
              {athlete.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14 }}>{athlete.name}</div>
              {index === 0 ? (
                <div
                  style={{
                    fontSize: 10,
                    color: "#f45a0b",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  👑 Líder
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------- pago -- */}
      <div
        style={{
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(0,0,0,.3)",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.4)",
                marginBottom: 4,
              }}
            >
              Inscripción por pareja
            </div>
            <div className="thf-wordmark" style={{ fontSize: 26 }}>
              {total} MXN
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.4)",
                marginBottom: 4,
              }}
            >
              Estatus
            </div>
            <div
              className="thf-wordmark"
              style={{ fontSize: 18, color: paid ? "#4ade80" : "#f45a0b" }}
            >
              {paid ? "Pagado" : "Pendiente"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6, marginBottom: 18 }}>
          {payRows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 12,
                borderBottom: "1px dotted rgba(255,255,255,.14)",
                paddingBottom: 6,
              }}
            >
              <span style={{ color: "rgba(255,255,255,.5)" }}>{row.label}</span>
              <span style={{ color: "rgba(255,255,255,.88)" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {paid ? (
          <div
            style={{
              borderRadius: 12,
              background: "rgba(34,197,94,.1)",
              border: "1px solid rgba(34,197,94,.3)",
              padding: 12,
              textAlign: "center",
              fontSize: 13,
              color: "#4ade80",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ✓ Equipo pagado al 100%
          </div>
        ) : (
          <div>
            <div
              style={{
                marginBottom: 18,
                paddingBottom: 18,
                borderBottom: "1px solid rgba(255,255,255,.12)",
              }}
            >
              <DivisionPicker current={team.division} />
            </div>

            {error ? (
              <p role="alert" style={{ margin: "0 0 12px", fontSize: 13, color: "#f87171" }}>
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={pay}
              disabled={starting}
              style={{
                width: "100%",
                borderRadius: 999,
                background: "#00b1ea",
                color: "#001d2e",
                padding: "15px 18px",
                fontSize: 13,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                border: "none",
                cursor: starting ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: starting ? 0.6 : 1,
              }}
            >
              {starting ? "Conectando…" : `Pagar ${total} con Mercado Pago →`}
            </button>

            <p
              style={{
                margin: "12px 0 0",
                fontSize: 11,
                lineHeight: 1.6,
                color: "rgba(255,255,255,.45)",
              }}
            >
              Pago único por el equipo completo. Aceptamos tarjeta de crédito y débito, meses sin
              intereses y saldo de Mercado Pago. No hay pagos parciales ni apartados.
            </p>

            <div
              style={{
                marginTop: 20,
                borderTop: "1px solid rgba(255,255,255,.12)",
                paddingTop: 18,
              }}
            >
              <button
                type="button"
                onClick={() => setShowTransfer((value) => !value)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#fff",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.7)",
                  }}
                >
                  O paga por transferencia bancaria
                </span>
                <span style={{ color: "#f45a0b", fontSize: 16 }}>{showTransfer ? "−" : "+"}</span>
              </button>

              {showTransfer ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "grid", gap: 8 }}>
                    {BANK_DATA.map((row) => (
                      <BankRow key={row.label} label={row.label} value={row.value} />
                    ))}
                  </div>

                  <ol
                    style={{
                      margin: "16px 0 0",
                      paddingLeft: 18,
                      display: "grid",
                      gap: 7,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    <li>
                      Transfiere el monto exacto de <span style={{ color: "#fff" }}>{total} MXN</span>{" "}
                      en una sola exhibición.
                    </li>
                    <li>
                      Usa como concepto el nombre de tu equipo:{" "}
                      <span style={{ color: "#fff" }}>THF {team.name}</span>.
                    </li>
                    <li>
                      Envía tu comprobante por WhatsApp; validamos en menos de 24 h y se libera tu
                      credencial.
                    </li>
                  </ol>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 16,
                      borderRadius: 999,
                      background: "#25d366",
                      color: "#05240f",
                      padding: "12px 18px",
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Enviar comprobante →
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
