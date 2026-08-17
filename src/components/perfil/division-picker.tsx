"use client";

import { useActionState } from "react";

import { changeDivisionAction, type DivisionChangeState } from "@/app/perfil/actions";
import { DIVISION_IDS, DIVISIONS, formatMXN, type Division } from "@/lib/thf";

const INITIAL: DivisionChangeState = { error: null };

/**
 * Selector de categoria dentro del equipo ya registrado.
 *
 * Cambiar de categoria cambia lo que se cobra, asi que el precio nuevo se
 * anuncia en el propio boton. El monto lo recalcula la base: aqui solo se manda
 * la division elegida.
 */
export function DivisionPicker({
  current,
  prices,
}: {
  current: Division;
  /** Precios de la fase activa: el boton anuncia lo que se va a cobrar. */
  prices: { CM: number; OP: number };
}) {
  const [state, formAction, pending] = useActionState(changeDivisionAction, INITIAL);

  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.4)",
          marginBottom: 10,
        }}
      >
        Categoría a concursar
      </div>

      <form
        action={formAction}
        style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}
      >
        {DIVISION_IDS.map((id) => {
          const info = DIVISIONS[id];
          const selected = current === id;
          return (
            <button
              key={id}
              type="submit"
              name="division"
              value={id}
              disabled={pending || selected}
              aria-pressed={selected}
              style={{
                borderRadius: 14,
                border: `1px solid ${selected ? "#f45a0b" : "rgba(255,255,255,.15)"}`,
                background: selected ? "rgba(244,90,11,.14)" : "rgba(0,0,0,.3)",
                color: selected ? "#fff" : "rgba(255,255,255,.65)",
                padding: "14px 12px",
                cursor: selected ? "default" : pending ? "wait" : "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                opacity: pending && !selected ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <span className="thf-wordmark" style={{ fontSize: 17, textTransform: "uppercase" }}>
                  {info.name}
                </span>
                {selected ? (
                  <span style={{ fontSize: 10, color: "#f45a0b", letterSpacing: "0.1em" }}>
                    ACTUAL
                  </span>
                ) : null}
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: selected ? "#f45a0b" : "rgba(255,255,255,.5)" }}>
                {formatMXN(prices[id])} por pareja
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,.45)",
                }}
              >
                {info.description}
              </div>
            </button>
          );
        })}
      </form>

      {state.error ? (
        <p role="alert" style={{ margin: "10px 0 0", fontSize: 12, color: "#f87171" }}>
          {state.error}
        </p>
      ) : null}

      <p style={{ margin: "10px 0 0", fontSize: 11, color: "rgba(255,255,255,.4)" }}>
        Puedes cambiar de categoría hasta que se registre el pago. El monto se ajusta solo.
      </p>
    </div>
  );
}
