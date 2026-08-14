"use client";

import type { CSSProperties } from "react";
import { useActionState, useState } from "react";

import { signIn, signUp, type AuthState } from "@/app/login/actions";

const INITIAL: AuthState = { error: null };

type Mode = "login" | "signup" | "staff";

/**
 * Formulario de acceso, portado de Tampico Hybrid Fest - Login.dc.html.
 *
 * Se conservan los tres modos del prototipo: atleta, alta y staff. La
 * diferencia es que aqui el submit autentica de verdad contra Supabase en vez
 * de saltar a otra pagina.
 */
export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = mode === "signup";
  const isStaff = mode === "staff";

  const [state, formAction, pending] = useActionState(isSignUp ? signUp : signIn, INITIAL);

  const copy = {
    label: isStaff ? "Acceso staff & admin" : isSignUp ? "Únete a la arena" : "Acceso atletas",
    title: isStaff
      ? "Panel del equipo THF."
      : isSignUp
        ? "Crea tu credencial."
        : "Bienvenido, atleta.",
    sub: isStaff
      ? "Entra con tu cuenta de staff para publicar workouts, patrocinadores y contenido del sitio."
      : isSignUp
        ? "Registra tu cuenta para asegurar tu lugar en THF 2026."
        : "Entra para ver tu credencial y categoría.",
    submit: isStaff ? "Entrar al panel" : isSignUp ? "Crear cuenta" : "Entrar",
    switchPrompt: isSignUp ? "¿Ya tienes cuenta?" : "¿Aún no estás registrado?",
    switchAction: isSignUp ? "Inicia sesión" : "Crea tu cuenta",
  };

  const inputBase: CSSProperties = {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.15)",
    background: "rgba(0,0,0,.4)",
    fontSize: 14,
    color: "#fff",
    outline: "none",
  };

  const iconStyle: CSSProperties = {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,.4)",
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(255,255,255,.02)",
          backdropFilter: "blur(16px)",
          padding: 40,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -1,
            left: 48,
            right: 48,
            height: 1,
            background: "linear-gradient(90deg, transparent, #f45a0b, transparent)",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
              margin: "0 0 12px",
            }}
          >
            {copy.label}
          </p>
          <h1
            className="thf-wordmark"
            style={{
              fontSize: "clamp(1.8rem,4vw,2.2rem)",
              textTransform: "uppercase",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {copy.title}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", margin: "12px 0 0" }}>
            {copy.sub}
          </p>
        </div>

        <form action={formAction} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="next" value={next} />

          {isSignUp ? (
            <div style={{ position: "relative" }}>
              <span style={iconStyle}>👤</span>
              <input
                name="displayName"
                placeholder="Tu nombre"
                required
                minLength={2}
                style={{ ...inputBase, padding: "14px 16px 14px 44px" }}
              />
            </div>
          ) : null}

          <div style={{ position: "relative" }}>
            <span style={iconStyle}>✉</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              autoComplete="email"
              style={{ ...inputBase, padding: "14px 16px 14px 44px" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <span style={iconStyle}>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              style={{ ...inputBase, padding: "14px 44px 14px 44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,.4)",
                cursor: "pointer",
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {state.error ? (
            <p role="alert" style={{ fontSize: 13, color: "#f87171", margin: 0, textAlign: "center" }}>
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            style={{
              width: "100%",
              borderRadius: 12,
              background: "#f45a0b",
              color: "#000",
              padding: 16,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "none",
              cursor: pending ? "wait" : "pointer",
              marginTop: 8,
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? "Un momento…" : `${copy.submit} →`}
          </button>
        </form>
      </div>

      {!isStaff ? (
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "rgba(255,255,255,.55)",
            marginTop: 24,
          }}
        >
          {copy.switchPrompt}{" "}
          <button
            type="button"
            onClick={() => setMode(isSignUp ? "login" : "signup")}
            style={{
              background: "none",
              border: "none",
              color: "#f45a0b",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {copy.switchAction}
          </button>
        </p>
      ) : null}

      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,.1)",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={() => setMode(isStaff ? "login" : "staff")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.18)",
            background: "transparent",
            color: "rgba(255,255,255,.7)",
            padding: "10px 18px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {isStaff ? "← Volver al acceso de atletas" : "🔑 Acceso staff & admin"}
        </button>
      </div>
    </>
  );
}
