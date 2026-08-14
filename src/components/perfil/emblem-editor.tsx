"use client";

import type { CSSProperties } from "react";

import { Emblem } from "@/components/emblem";
import { ICONS, PATTERNS, PLATES, randomEmblem, type EmblemSpec } from "@/lib/emblem";

/**
 * Constructor de emblemas por capas, portado de
 * Tampico Hybrid Fest - Profile.dc.html: vista previa a la izquierda y las tres
 * capas (placa, patron, simbolo) a la derecha, cada una con su selector de
 * color libre.
 */

const labelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.4)",
};

const colorInputStyle: CSSProperties = {
  width: 42,
  height: 26,
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(46px, 1fr))",
  gap: 8,
};

function optionStyle(selected: boolean, padding: number): CSSProperties {
  return {
    borderRadius: 10,
    padding,
    cursor: "pointer",
    border: `1px solid ${selected ? "#f45a0b" : "rgba(255,255,255,.15)"}`,
    background: selected ? "rgba(244,90,11,.14)" : "rgba(0,0,0,.3)",
  };
}

/** Color con el que se dibujan las miniaturas de cada opcion. */
function swatchFill(selected: boolean) {
  return selected ? "#f45a0b" : "rgba(245,243,238,.6)";
}

type Props = {
  value: EmblemSpec;
  onChange: (spec: EmblemSpec) => void;
};

export function EmblemEditor({ value, onChange }: Props) {
  const set = (patch: Partial<EmblemSpec>) => onChange({ ...value, ...patch });

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(0,0,0,.35)",
        padding: 20,
        display: "grid",
        gridTemplateColumns: "220px minmax(0,1fr)",
        gap: 24,
      }}
      className="thf-split"
    >
      <div>
        <div style={{ ...labelStyle, letterSpacing: "0.22em" }}>Vista previa</div>
        <div style={{ marginTop: 14, width: 200, height: 200, maxWidth: "100%" }}>
          <Emblem spec={value} />
        </div>
        <button
          type="button"
          onClick={() => onChange(randomEmblem())}
          style={{
            marginTop: 14,
            width: 200,
            maxWidth: "100%",
            borderRadius: 999,
            border: "1px solid rgba(244,90,11,.5)",
            background: "rgba(244,90,11,.08)",
            color: "#f45a0b",
            padding: 10,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          ↺ Sorprenderme
        </button>
      </div>

      <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
        {/* Capa 1 · Placa */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <label style={labelStyle}>Capa 1 · Placa</label>
            <input
              type="color"
              value={value.colorPlate}
              onChange={(event) => set({ colorPlate: event.target.value })}
              aria-label="Color de la placa"
              style={colorInputStyle}
            />
          </div>
          <div style={gridStyle}>
            {PLATES.map((plate) => {
              const selected = value.plate === plate.id;
              return (
                <button
                  key={plate.id}
                  type="button"
                  onClick={() => set({ plate: plate.id })}
                  title={plate.name}
                  aria-pressed={selected}
                  style={optionStyle(selected, 7)}
                >
                  <svg viewBox="0 0 100 100" style={{ display: "block", width: "100%" }}>
                    <path d={plate.d} fill={swatchFill(selected)} />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Capa 2 · Patron */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <label style={labelStyle}>Capa 2 · Patrón</label>
            <input
              type="color"
              value={value.colorPattern}
              onChange={(event) => set({ colorPattern: event.target.value })}
              aria-label="Color del patrón"
              style={colorInputStyle}
            />
          </div>
          <div style={gridStyle}>
            {PATTERNS.map((pattern) => {
              const selected = value.pattern === pattern.id;
              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => set({ pattern: pattern.id })}
                  title={pattern.name}
                  aria-pressed={selected}
                  style={optionStyle(selected, 7)}
                >
                  <svg viewBox="0 0 100 100" style={{ display: "block", width: "100%" }}>
                    <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,.08)" />
                    {pattern.ds.map((d, index) => (
                      <path key={index} d={d} fill={swatchFill(selected)} fillRule="evenodd" />
                    ))}
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Capa 3 · Simbolo */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <label style={labelStyle}>Capa 3 · Símbolo</label>
            <input
              type="color"
              value={value.colorIcon}
              onChange={(event) => set({ colorIcon: event.target.value })}
              aria-label="Color del símbolo"
              style={colorInputStyle}
            />
          </div>
          <div style={gridStyle}>
            {ICONS.map((icon) => {
              const selected = value.icon === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => set({ icon: icon.id })}
                  title={icon.name}
                  aria-pressed={selected}
                  style={optionStyle(selected, 6)}
                >
                  <svg viewBox="0 0 100 100" style={{ display: "block", width: "100%" }}>
                    {icon.ds.map((d, index) => (
                      <path key={index} d={d} fill={swatchFill(selected)} fillRule="evenodd" />
                    ))}
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18 }}>
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: 10 }}>
              Tamaño del símbolo
            </label>
            <input
              type="range"
              min={45}
              max={100}
              step={5}
              value={value.iconScale}
              onChange={(event) => set({ iconScale: Number(event.target.value) })}
              style={{ width: "100%", accentColor: "#f45a0b" }}
            />
          </div>
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: 10 }}>
              Giro del patrón
            </label>
            <input
              type="range"
              min={0}
              max={345}
              step={15}
              value={value.patternRotation}
              onChange={(event) => set({ patternRotation: Number(event.target.value) })}
              style={{ width: "100%", accentColor: "#f45a0b" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
