import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { STATIONS_NOTE, type CategoryContent } from "@/lib/category-data";

/**
 * Pagina de categoria, portada de Tampico Hybrid Fest - Community.dc.html y
 * - Open.dc.html. Las dos comparten estructura, asi que el markup vive aqui y
 * lo que cambia viaja en `content`.
 */

const sectionLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#f45a0b",
  margin: "0 0 16px",
};

const sectionTitle: CSSProperties = {
  fontSize: "clamp(2.2rem,4vw,3rem)",
  textTransform: "uppercase",
  lineHeight: 0.95,
  margin: 0,
};

const ctaPrimary: CSSProperties = {
  borderRadius: 999,
  background: "#f45a0b",
  color: "#000",
  padding: "16px 28px",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

const ctaGhost: CSSProperties = {
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
  padding: "16px 28px",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

export function CategoryPage({
  content,
  intro,
}: {
  content: CategoryContent;
  /** El parrafo del hero lleva partes resaltadas, asi que llega como JSX. */
  intro: ReactNode;
}) {
  const heroIsFull = content.heroLayout === "full";

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#080808",
        color: "#f5f3ee",
        overflowX: "hidden",
      }}
    >
      {/* --------------------------------------------------------- header -- */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,.1)",
          background: "rgba(8,8,8,.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            gap: 12,
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
            }}
          >
            ← Inicio
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
            {content.headerLabel}
          </div>
          <Link
            href={content.otherHref}
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.6)",
            }}
          >
            {content.otherLabel}
          </Link>
        </div>
      </header>

      {/* ----------------------------------------------------------- hero -- */}
      <section style={{ position: "relative", padding: "96px 20px 80px", overflow: "hidden" }}>
        {heroIsFull ? (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url('${content.heroImage}')`,
                backgroundSize: "cover",
                backgroundPosition: content.heroPosition,
                filter: "saturate(.95)",
                opacity: 0.8,
                transform: "scale(1.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(100deg, rgba(8,8,8,.92) 10%, rgba(8,8,8,.58) 54%, rgba(8,8,8,.2) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -160,
                right: -160,
                width: 600,
                height: 600,
                borderRadius: "50%",
                background: "rgba(244,90,11,.2)",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -160,
                left: -160,
                width: 500,
                height: 500,
                borderRadius: "50%",
                background: "rgba(244,90,11,.1)",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
          </>
        ) : (
          <>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "min(40%, 520px)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${content.heroImage}')`,
                  backgroundSize: "cover",
                  backgroundPosition: content.heroPosition,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, #080808 0%, rgba(8,8,8,.5) 34%, rgba(8,8,8,0) 78%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(8,8,8,.45) 0%, rgba(8,8,8,0) 24%, rgba(8,8,8,0) 74%, rgba(8,8,8,.6) 100%)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: -140,
                left: -140,
                width: 500,
                height: 500,
                borderRadius: "50%",
                background: "rgba(244,90,11,.15)",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              border: `1px solid rgba(244,90,11,${heroIsFull ? ".4" : ".3"})`,
              background: `rgba(244,90,11,${heroIsFull ? ".1" : ".05"})`,
              padding: "10px 16px",
              marginBottom: 32,
            }}
          >
            <span style={{ color: "#f45a0b" }}>{content.badgeIcon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#f45a0b",
              }}
            >
              {content.badgeText}
            </span>
          </div>

          <h1
            className="thf-wordmark"
            style={{
              fontSize: heroIsFull ? "clamp(3.5rem,10vw,9rem)" : "clamp(3.5rem,9vw,7.5rem)",
              textTransform: "uppercase",
              lineHeight: heroIsFull ? 0.85 : 0.88,
              margin: 0,
            }}
          >
            {heroIsFull ? (
              <>
                <span style={{ color: "#f45a0b" }}>{content.titleTop}</span>
                <br />
                {content.titleBottom}
              </>
            ) : (
              <>
                {content.titleTop}
                <br />
                <span style={{ color: "#f45a0b" }}>{content.titleBottom}</span>
              </>
            )}
          </h1>

          <p
            style={{
              marginTop: 32,
              maxWidth: "60ch",
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(255,255,255,.7)",
            }}
          >
            {intro}
          </p>

          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/perfil" style={ctaPrimary}>
              {content.ctaPrimary}
            </Link>
            <Link href="/quiz" style={ctaGhost}>
              ✦ Repetir quiz
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- datos rapidos -- */}
      <section style={{ padding: "0 20px 80px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {content.facts.map((fact) => (
            <div key={fact.label} className="thf-hover-card" style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.4)",
                  marginBottom: 8,
                }}
              >
                <span style={{ color: "#f45a0b" }}>{fact.icon}</span> {fact.label}
              </div>
              <div className="thf-wordmark" style={{ fontSize: 20, textTransform: "uppercase" }}>
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------- los dos dias (Open) -- */}
      {content.days.length > 0 ? (
        <section style={{ padding: "80px 20px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={sectionLabel}>El formato</p>
            <h2 className="thf-wordmark" style={{ ...sectionTitle, marginBottom: 48 }}>
              Dos jornadas. Un solo ranking.
            </h2>
            <div
              className="thf-split"
              style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}
            >
              {content.days.map((day) => (
                <div
                  key={day.tag}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 24,
                    border: "1px solid rgba(244,90,11,.2)",
                    background:
                      "linear-gradient(135deg, rgba(244,90,11,.05), rgba(255,255,255,.02), transparent)",
                    padding: 32,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#f45a0b",
                      marginBottom: 12,
                    }}
                  >
                    {day.tag}
                  </div>
                  <div
                    className="thf-wordmark"
                    style={{
                      fontSize: "clamp(1.6rem,3vw,2rem)",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    {day.title}
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,.65)",
                      lineHeight: 1.6,
                      margin: "0 0 24px",
                    }}
                  >
                    {day.desc}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {day.bullets.map((bullet) => (
                      <span
                        key={bullet}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,.15)",
                          background: "rgba(0,0,0,.3)",
                          padding: "6px 12px",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "rgba(255,255,255,.8)",
                        }}
                      >
                        <span style={{ color: "#f45a0b" }}>⚡</span> {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------ que incluye -- */}
      <section style={{ padding: "80px 20px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <div
          className="thf-split"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0,0.4fr) minmax(0,0.6fr)",
            gap: 48,
          }}
        >
          <div>
            <p style={sectionLabel}>Qué incluye</p>
            <h2 className="thf-wordmark" style={sectionTitle}>
              Todo lo que necesitas para vivirlo.
            </h2>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {content.includes.map((item) => (
              <li
                key={item}
                className="thf-hover-card"
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 16 }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(244,90,11,.1)",
                    border: "1px solid rgba(244,90,11,.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f45a0b",
                    flexShrink: 0,
                    fontSize: 13,
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,.85)",
                    lineHeight: 1.5,
                    paddingTop: 4,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------ estaciones -- */}
      <section style={{ padding: "80px 20px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={sectionLabel}>La carrera</p>
          <h2
            className="thf-wordmark"
            style={{ ...sectionTitle, margin: "0 0 48px", maxWidth: "24ch" }}
          >
            {content.stationsTitle}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {content.stations.map((station) => (
              <div key={station.n} className="thf-hover-card" style={{ padding: 24 }}>
                <div
                  className="thf-wordmark"
                  style={{ fontSize: 28, color: "#f45a0b", marginBottom: 8 }}
                >
                  {station.n}
                </div>
                <div
                  className="thf-wordmark"
                  style={{ fontSize: 18, textTransform: "uppercase", marginBottom: 8 }}
                >
                  {station.title}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,.6)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {station.desc}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              marginTop: 32,
              fontSize: 12,
              color: "rgba(255,255,255,.4)",
              maxWidth: "60ch",
            }}
          >
            {STATIONS_NOTE}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- cierre -- */}
      <section
        style={{
          padding: "96px 20px",
          borderTop: "1px solid rgba(255,255,255,.05)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 28, color: "#f45a0b", marginBottom: 24 }}>
            {content.closingIcon}
          </div>
          <h2
            className="thf-wordmark"
            style={{
              fontSize: "clamp(2.5rem,6vw,4.5rem)",
              textTransform: "uppercase",
              lineHeight: 0.92,
              margin: 0,
            }}
          >
            {content.closingTop}
            <br />
            <span style={{ color: "#f45a0b" }}>{content.closingBottom}</span>
          </h2>
          <p style={{ marginTop: 24, fontSize: 18, color: "rgba(255,255,255,.65)" }}>
            {content.closingNote}
          </p>
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Link href="/perfil" style={ctaPrimary}>
              {content.closingPrimary}
            </Link>
            <Link href={content.otherHref} style={ctaGhost}>
              {content.closingSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
