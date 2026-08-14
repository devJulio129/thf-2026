"use client";

import { useState } from "react";

import {
  ATHLETES_PER_TEAM,
  DIVISION_IDS,
  DIVISIONS,
  SHIRT_SIZES,
  formatMXN,
  type Division,
} from "@/lib/thf";

type AthleteForm = { name: string; email: string; shirtSize: string };

const emptyAthlete = (): AthleteForm => ({ name: "", email: "", shirtSize: "M" });

export function RegistrationForm() {
  const [division, setDivision] = useState<Division>("CM");
  const [teamName, setTeamName] = useState("");
  const [athletes, setAthletes] = useState<AthleteForm[]>(() =>
    Array.from({ length: ATHLETES_PER_TEAM }, emptyAthlete),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = DIVISIONS[division].priceMXN;

  function updateAthlete(index: number, patch: Partial<AthleteForm>) {
    setAthletes((current) =>
      current.map((athlete, i) => (i === index ? { ...athlete, ...patch } : athlete)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Solo mandamos la division. El precio lo decide el servidor.
        body: JSON.stringify({ division, teamName, athletes }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No pudimos iniciar el pago.");
      }

      // Salimos a Checkout Pro. El regreso lo maneja /pago/*, y la confirmacion
      // real llega por webhook.
      window.location.href = payload.checkoutUrl;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error inesperado.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Division
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {DIVISION_IDS.map((id) => {
            const info = DIVISIONS[id];
            const selected = division === id;
            return (
              <label
                key={id}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selected
                    ? "border-thf-orange bg-thf-orange/10"
                    : "border-thf-line bg-black/30 hover:border-white/25"
                }`}
              >
                <input
                  type="radio"
                  name="division"
                  value={id}
                  checked={selected}
                  onChange={() => setDivision(id)}
                  className="sr-only"
                />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="thf-wordmark text-lg">{info.name}</span>
                  <span className="text-sm font-semibold text-thf-orange">
                    {formatMXN(info.priceMXN)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  {info.description}
                </p>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label
          htmlFor="teamName"
          className="block text-[11px] font-bold uppercase tracking-[0.22em] text-white/40"
        >
          Nombre del equipo
        </label>
        <input
          id="teamName"
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          placeholder="Los Alacranes"
          required
          minLength={2}
          className="w-full rounded-xl border border-thf-line bg-black/40 px-4 py-3 text-sm outline-none focus:border-thf-orange"
        />
      </div>

      {athletes.map((athlete, index) => (
        <fieldset key={index} className="space-y-3">
          <legend className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Atleta {index + 1}
          </legend>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={athlete.name}
              onChange={(event) => updateAthlete(index, { name: event.target.value })}
              placeholder="Nombre completo"
              required
              minLength={2}
              className="rounded-xl border border-thf-line bg-black/40 px-4 py-3 text-sm outline-none focus:border-thf-orange"
            />
            <input
              type="email"
              value={athlete.email}
              onChange={(event) => updateAthlete(index, { email: event.target.value })}
              placeholder="correo@ejemplo.com"
              required
              className="rounded-xl border border-thf-line bg-black/40 px-4 py-3 text-sm outline-none focus:border-thf-orange"
            />
            <select
              value={athlete.shirtSize}
              onChange={(event) => updateAthlete(index, { shirtSize: event.target.value })}
              aria-label={`Talla del atleta ${index + 1}`}
              className="rounded-xl border border-thf-line bg-black/40 px-4 py-3 text-sm outline-none focus:border-thf-orange"
            >
              {SHIRT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
      ))}

      <div className="rounded-2xl border border-thf-line bg-thf-panel p-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Inscripcion por pareja
            </div>
            <div className="thf-wordmark mt-1 text-3xl">{formatMXN(total)}</div>
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-thf-orange px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-thf-orange-hi disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Conectando con Mercado Pago…" : `Pagar ${formatMXN(total)} con Mercado Pago →`}
        </button>

        <p className="mt-4 text-[11px] leading-relaxed text-white/45">
          Pago unico por el equipo completo. Aceptamos tarjeta de credito y debito, meses sin
          intereses, efectivo en tiendas y saldo de Mercado Pago. No hay pagos parciales ni
          apartados.
        </p>
      </div>
    </form>
  );
}
