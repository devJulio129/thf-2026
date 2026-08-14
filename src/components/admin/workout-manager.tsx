"use client";

import { useActionState, useState, useTransition } from "react";

import {
  deleteWorkoutAction,
  saveWorkoutAction,
  toggleWorkoutAction,
  type AdminState,
} from "@/app/admin/actions";
import type { Workout } from "@/lib/admin";

const INITIAL: AdminState = { error: null };

const pill = {
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.2)",
  background: "none",
  color: "#fff",
  padding: "6px 12px",
  fontSize: 10,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  cursor: "pointer",
  fontFamily: "inherit",
};

/**
 * "Comp Prep Workout" del panel, portado de
 * Tampico Hybrid Fest - Admin.dc.html: formulario arriba y la lista de
 * workouts abajo, con publicar, editar y eliminar.
 */
export function WorkoutManager({ workouts }: { workouts: Workout[] }) {
  const [editing, setEditing] = useState<Workout | null>(null);
  const [state, formAction, pending] = useActionState(saveWorkoutAction, INITIAL);
  const [busy, startAction] = useTransition();

  // La clave reinicia el formulario al cambiar de workout editado.
  const formKey = editing?.id ?? "nuevo";

  return (
    <section className="thf-card" style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ color: "#f45a0b" }}>🔥</span>
        <h2 className="thf-wordmark" style={{ fontSize: 22, textTransform: "uppercase", margin: 0 }}>
          Comp Prep Workout
        </h2>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", margin: "0 0 24px" }}>
        El workout publicado aparece al inicio de la landing page. Solo uno puede estar publicado a
        la vez.
      </p>

      <form
        key={formKey}
        action={formAction}
        style={{ display: "grid", gap: 16, marginBottom: 32 }}
      >
        <input type="hidden" name="id" value={editing?.id ?? ""} />

        <div
          className="thf-split"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}
        >
          <input
            name="title"
            className="thf-input"
            defaultValue={editing?.title ?? ""}
            placeholder="Título (ej. Comp Prep 01 · Engine)"
            required
            minLength={2}
          />
          <input
            name="subtitle"
            className="thf-input"
            defaultValue={editing?.subtitle ?? ""}
            placeholder="Subtítulo (opcional)"
          />
        </div>

        <textarea
          name="content"
          className="thf-input"
          rows={5}
          defaultValue={editing?.content ?? ""}
          placeholder="Contenido del workout, una línea por bloque"
          required
          minLength={2}
          style={{ resize: "vertical" }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "rgba(255,255,255,.7)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={editing?.isPublished ?? false}
              style={{ width: 16, height: 16, accentColor: "#f45a0b" }}
            />{" "}
            Publicar en la landing
          </label>

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
            💾 {editing ? "Guardar cambios" : "Crear workout"}
          </button>

          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(null)}
              style={{
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
                fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>

        {state.error ? (
          <p role="alert" style={{ margin: 0, fontSize: 13, color: "#f87171" }}>
            {state.error}
          </p>
        ) : null}
      </form>

      <div style={{ display: "grid", gap: 8 }}>
        {workouts.length === 0 ? (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
            Aún no hay workouts. Crea el primero arriba.
          </p>
        ) : (
          workouts.map((workout) => (
            <div
              key={workout.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(0,0,0,.2)",
                padding: "12px 16px",
              }}
            >
              <span style={{ color: workout.isPublished ? "#f45a0b" : "rgba(255,255,255,.3)" }}>
                📣
              </span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 14, color: "#fff" }}>{workout.title}</div>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: workout.isPublished ? "#4ade80" : "rgba(255,255,255,.4)",
                  }}
                >
                  {workout.isPublished ? "Publicado en la landing" : "Borrador"}
                </div>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  startAction(() => {
                    void toggleWorkoutAction(workout.id, !workout.isPublished);
                  })
                }
                style={pill}
              >
                {workout.isPublished ? "Despublicar" : "Publicar"}
              </button>

              <button type="button" onClick={() => setEditing(workout)} style={pill}>
                ✎ Editar
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm(`¿Eliminar "${workout.title}"?`)) return;
                  startAction(() => {
                    void deleteWorkoutAction(workout.id);
                  });
                }}
                style={{
                  ...pill,
                  border: "1px solid rgba(239,68,68,.3)",
                  color: "#f87171",
                }}
              >
                🗑 Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
