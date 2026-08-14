"use client";

import Link from "next/link";
import { useState } from "react";

import { QUESTIONS, QUIZ_RESULTS, scoreQuiz } from "@/lib/quiz-data";
import type { Division } from "@/lib/thf";

/**
 * Quiz de categoria, portado de Tampico Hybrid Fest - Quiz.dc.html: una
 * pregunta a la vez, barra de avance arriba y tarjeta de resultado al final.
 */
export function QuizFlow() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Division | null>(null);

  const step = answers.length;
  const total = QUESTIONS.length;
  const progress = result ? 100 : Math.round((step / total) * 100);

  function answer(optionIndex: number) {
    const next = [...answers, optionIndex];
    setAnswers(next);
    if (next.length === total) setResult(scoreQuiz(next));
  }

  function back() {
    if (step === 0) return;
    setAnswers(answers.slice(0, -1));
  }

  function reset() {
    setAnswers([]);
    setResult(null);
  }

  const question = QUESTIONS[step];

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#080808",
        color: "#f5f3ee",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.6)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ← Volver
          </Link>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
            }}
          >
            Quiz · Categoría
          </div>
          <div style={{ width: 64 }} />
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,.05)" }}>
          <div
            style={{
              height: "100%",
              background: "#f45a0b",
              transition: "width .5s",
              width: `${progress}%`,
            }}
          />
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", padding: "48px 20px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", width: "100%" }}>
          {result ? (
            <div>
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 24,
                  border: "1px solid rgba(244,90,11,.3)",
                  background:
                    "linear-gradient(135deg, rgba(244,90,11,.1), rgba(0,0,0,.4) 60%, #000)",
                  padding: 48,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -80,
                    right: -80,
                    width: 280,
                    height: 280,
                    borderRadius: "50%",
                    background: "rgba(244,90,11,.2)",
                    filter: "blur(60px)",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#f45a0b",
                      marginBottom: 16,
                    }}
                  >
                    Tu categoría recomendada
                  </div>
                  <div
                    className="thf-wordmark"
                    style={{
                      fontSize: "clamp(3rem,7vw,5rem)",
                      color: "#f45a0b",
                      textTransform: "uppercase",
                      lineHeight: 1,
                      marginBottom: 12,
                    }}
                  >
                    {QUIZ_RESULTS[result].name}
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", margin: "0 0 24px" }}>
                    {QUIZ_RESULTS[result].tag}
                  </p>
                  <p
                    style={{
                      fontSize: 17,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,.8)",
                      maxWidth: "60ch",
                      margin: "0 0 24px",
                    }}
                  >
                    {QUIZ_RESULTS[result].desc}
                  </p>
                  <div
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,.1)",
                      background: "rgba(0,0,0,.4)",
                      padding: 16,
                      display: "flex",
                      gap: 12,
                      maxWidth: "60ch",
                    }}
                  >
                    <span style={{ color: "#f45a0b" }}>✦</span>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", margin: 0 }}>
                      {QUIZ_RESULTS[result].recommend}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
                <a
                  href={QUIZ_RESULTS[result].href}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    textAlign: "center",
                    borderRadius: 999,
                    border: "1px solid rgba(244,90,11,.4)",
                    background: "rgba(244,90,11,.05)",
                    color: "#f45a0b",
                    padding: 16,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Conocer la categoría →
                </a>
                <Link
                  href="/login"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    textAlign: "center",
                    borderRadius: 999,
                    background: "#f45a0b",
                    color: "#000",
                    padding: 16,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Crear cuenta →
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,.2)",
                    background: "transparent",
                    color: "#fff",
                    padding: "16px 24px",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ↺ Repetir
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.4)",
                  marginBottom: 24,
                }}
              >
                Pregunta {step + 1} de {total}
              </div>
              <h1
                className="thf-wordmark"
                style={{
                  fontSize: "clamp(1.8rem,4vw,2.8rem)",
                  textTransform: "uppercase",
                  lineHeight: 1.05,
                  margin: "0 0 40px",
                }}
              >
                {question.question}
              </h1>

              <div style={{ display: "grid", gap: 12 }}>
                {question.options.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => answer(index)}
                    className="thf-quiz-option"
                    style={{
                      textAlign: "left",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,.1)",
                      background: "rgba(255,255,255,.02)",
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      cursor: "pointer",
                      color: "inherit",
                      font: "inherit",
                    }}
                  >
                    <span style={{ fontSize: 17, color: "rgba(255,255,255,.9)" }}>
                      {option.label}
                    </span>
                    <span style={{ color: "rgba(255,255,255,.3)" }}>→</span>
                  </button>
                ))}
              </div>

              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  style={{
                    marginTop: 32,
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,.5)",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "inherit",
                  }}
                >
                  ← Pregunta anterior
                </button>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
