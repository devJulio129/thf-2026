"use client";

import { useSyncExternalStore } from "react";

import { DAY_NAMES, WODS } from "@/lib/landing-data";

/** El dia no cambia mientras la pagina esta abierta: no hay a que suscribirse. */
const noSubscribe = () => () => {};
const dayOnClient = () => new Date().getDay();
/** En el servidor asumimos sabado, que es el dia del evento. */
const dayOnServer = () => 6;

/**
 * Tarjeta "Comp Prep · Workout de hoy" del hero.
 *
 * El dia se resuelve en el navegador, no en el servidor: si lo calculara el
 * servidor, un atleta en otra zona horaria veria el WOD de ayer, y ademas React
 * se quejaria de que el HTML servido no coincide con el hidratado. Mientras
 * llega el primer render del cliente se muestra el WOD del sabado, que es el
 * dia del evento.
 */
export type PublishedWod = {
  title: string;
  subtitle: string;
  blocks: string[];
};

/**
 * Si el staff publico un workout desde el panel, ese manda. Si no, se usa el
 * de la semana que corresponde al dia.
 */
export function WodToday({ published }: { published?: PublishedWod | null }) {
  const dayIndex = useSyncExternalStore(noSubscribe, dayOnClient, dayOnServer);

  const wod = published
    ? { title: published.title, blocks: published.blocks, note: published.subtitle }
    : WODS[dayIndex];

  const blocks = wod.blocks.map((text, index) => ({
    n: String(index + 1).padStart(2, "0"),
    text,
  }));

  return (
    <div
      style={{
        marginTop: 32,
        border: "1px solid rgba(255,255,255,.18)",
        background: "rgba(255,255,255,.03)",
        padding: "22px 24px",
        maxWidth: 480,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#f45a0b",
          }}
        >
          <span style={{ height: 7, width: 7, borderRadius: "50%", background: "#f45a0b" }} />
          Comp Prep · Workout de hoy
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.4)",
          }}
        >
          {published ? "Publicado por THF" : DAY_NAMES[dayIndex]}
        </div>
      </div>

      <div
        className="thf-wordmark"
        style={{
          marginTop: 16,
          fontSize: "clamp(1.4rem,2.4vw,1.9rem)",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "-0.03em",
        }}
      >
        {wod.title}
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        {blocks.map((block) => (
          <div
            key={block.n}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: 12,
              fontSize: 14,
              color: "rgba(255,255,255,.78)",
            }}
          >
            <span
              style={{
                fontWeight: 800,
                color: "rgba(255,255,255,.32)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {block.n}
            </span>
            <span>{block.text}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,.12)",
          fontSize: 12,
          color: "rgba(255,255,255,.45)",
        }}
      >
        {wod.note}
      </div>
    </div>
  );
}
