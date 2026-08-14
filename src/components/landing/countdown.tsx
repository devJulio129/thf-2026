"use client";

import { useEffect, useState } from "react";

import { EVENT_DATE } from "@/lib/landing-data";

const pad = (value: number) => String(value).padStart(2, "0");

function partsFor(remainingMs: number) {
  const diff = Math.max(0, remainingMs);
  return [
    { value: pad(Math.floor(diff / 86400000)), label: "Días" },
    { value: pad(Math.floor((diff / 3600000) % 24)), label: "Hrs" },
    { value: pad(Math.floor((diff / 60000) % 60)), label: "Min" },
    { value: pad(Math.floor((diff / 1000) % 60)), label: "Seg" },
  ];
}

/**
 * Cuenta regresiva de la seccion Sede. Corre en el navegador y arranca en
 * ceros para que el HTML del servidor y el del cliente coincidan.
 */
export function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(EVENT_DATE).getTime();
    const tick = () => setRemaining(target - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const parts = partsFor(remaining ?? 0);

  return (
    <div
      style={{
        marginTop: 64,
        borderTop: "1px solid rgba(255,255,255,.15)",
        paddingTop: 32,
      }}
    >
      <div
        style={{
          marginBottom: 20,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.4)",
        }}
      >
        La arena abre en
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 8,
        }}
      >
        {parts.map((part) => (
          <div
            key={part.label}
            style={{
              border: "1px solid rgba(255,255,255,.15)",
              padding: "16px 8px",
              textAlign: "center",
            }}
          >
            <div
              className="thf-wordmark"
              style={{
                fontSize: "clamp(1.5rem,3vw,2.5rem)",
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {part.value}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#f45a0b",
              }}
            >
              {part.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
