import type { CSSProperties } from "react";

import { Countdown } from "@/components/landing/countdown";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { getPublishedWorkout } from "@/lib/admin";
import { getCurrentPhase } from "@/lib/phases";
import { formatMXN } from "@/lib/thf";
import { WodToday } from "@/components/landing/wod-today";
import {
  APP_AGENDA,
  APP_BOARD,
  APP_FEATURES,
  MARQUEE_WORDS,
  NAV_LINKS,
  ROUTES,
  STEPS,
  TRAITS,
} from "@/lib/landing-data";

/**
 * Landing del THF, portada del diseno original
 * (Tampico Hybrid Fest - Landing.dc.html).
 *
 * Se conserva el markup y los estilos inline del prototipo. Los <sc-for> del
 * runtime de DC son .map() aqui, y los <sc-if> son condicionales. Las dos
 * partes que cambian con el tiempo (WOD del dia y cuenta regresiva) viven en
 * componentes de cliente.
 */

const SECTION_PAD = "clamp(64px,8vw,128px) clamp(20px,4vw,48px)";

/** Etiqueta numerada que encabeza cada seccion: "01 —— El evento". */
function SectionLabel({
  n,
  children,
  tone = "dark",
}: {
  n: string;
  children: string;
  tone?: "dark" | "light" | "orange";
}) {
  const color =
    tone === "light"
      ? "rgba(255,255,255,.45)"
      : tone === "orange"
        ? "rgba(0,0,0,.6)"
        : "rgba(0,0,0,.45)";
  const rule = tone === "light" ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.25)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.23em",
        textTransform: "uppercase",
        color,
      }}
    >
      <span style={{ color: tone === "orange" ? "inherit" : "#f45a0b" }}>{n}</span>
      <span
        style={{ height: 1, width: 36, background: tone === "orange" ? "rgba(0,0,0,.3)" : rule }}
      />
      {children}
    </div>
  );
}

const ctaBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  minHeight: 56,
  padding: "16px 24px",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const TRAIT_ICONS = [
  <>
    <path d="M6.5 6.5h11v11h-11z" />
    <path d="M4 9v6M20 9v6" />
  </>,
  <>
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7v5l3 3" />
  </>,
  <>
    <circle cx={12} cy={12} r={9} />
    <circle cx={12} cy={12} r={4} />
    <circle cx={12} cy={12} r={0.5} fill="currentColor" />
  </>,
];

/** El carrusel repite la lista tres veces: la animacion desplaza un tercio. */
const MARQUEE_LOOP = [...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS];

const cardBase: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  minHeight: 520,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 32,
  textDecoration: "none",
};

/**
 * La division destacada se pinta en naranja y la otra en negro. En el prototipo
 * esto era una prop del editor de DC; aqui es una constante hasta que el Admin
 * pueda cambiarla.
 */
const FEATURED_DIVISION = "Open";

function categoryCardStyle(division: "Community" | "Open"): CSSProperties {
  const highlighted = division === FEATURED_DIVISION;
  return {
    ...cardBase,
    border: `1px solid ${highlighted ? "#f45a0b" : "rgba(255,255,255,.25)"}`,
    background: highlighted ? "#f45a0b" : "#111",
    color: highlighted ? "#000" : "#fff",
  };
}

export default async function Home() {
  // Si el staff publico un workout desde el panel, se muestra en lugar del
  // workout fijo de la semana.
  const published = await getPublishedWorkout();
  const publishedWod = published
    ? {
        title: published.title,
        subtitle: published.subtitle,
        // Una linea por bloque, tal como se captura en el panel.
        blocks: published.content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      }
    : null;

  const communityCard = categoryCardStyle("Community");
  const openCard = categoryCardStyle("Open");

  // Los precios que se anuncian son los de la fase que el staff dejo activa.
  const phase = await getCurrentPhase();

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#f5f3ee",
        color: "#090909",
        overflowX: "hidden",
      }}
    >
      {/* ------------------------------------------------------------ nav -- */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
          padding: "0 clamp(20px,4vw,48px)",
          background: "#f5f3ee",
          boxShadow: "0 1px 0 rgba(0,0,0,.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MobileMenu links={NAV_LINKS} portalHref={ROUTES.portal} />
          <div style={{ lineHeight: 1 }}>
            <div
              className="thf-wordmark"
              style={{ fontSize: 14, fontWeight: 900, letterSpacing: "-0.04em" }}
            >
              TAMPICO HYBRID
            </div>
            <div
              className="thf-wordmark"
              style={{
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.22em",
                color: "#f45a0b",
                marginTop: 2,
              }}
            >
              FEST 2026
            </div>
          </div>
        </div>

        <div
          className="thf-nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            flex: "0 1 auto",
            margin: "0 22px",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              className="thf-nav-link"
              href={link.href}
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: "rgba(0,0,0,.65)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div
          className="thf-nav-actions"
          style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}
        >
          <a
            href={ROUTES.portal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 16px",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "1px solid rgba(0,0,0,.25)",
              background: "transparent",
              color: "#000",
            }}
          >
            Portal
          </a>
          <a
            href={ROUTES.quiz}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 16px",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "#080808",
              color: "#fff",
              border: "1px solid #080808",
            }}
          >
            Mi categoría →
          </a>
        </div>
      </nav>

      {/* ----------------------------------------------------------- hero -- */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          overflow: "hidden",
          background: "#080808",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/assets/p-farmer.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "58% 32%",
            filter: "saturate(.95) contrast(1.02)",
            opacity: 0.82,
            transform: "scale(1.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(8,8,8,.93) 8%, rgba(8,8,8,.62) 44%, rgba(8,8,8,.2) 100%)",
          }}
        />
        <div className="thf-hero-grid" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
        <div
          className="thf-orbit-a"
          style={{
            position: "absolute",
            width: 780,
            height: 420,
            right: -180,
            top: 80,
            border: "2px solid rgba(244,90,11,.35)",
            borderLeftColor: "transparent",
            borderBottomColor: "transparent",
            borderRadius: "50%",
            pointerEvents: "none",
            transform: "rotate(-22deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -100,
            top: 40,
            height: "62vw",
            width: "62vw",
            maxWidth: 780,
            maxHeight: 780,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.1)",
          }}
        />

        <div
          className="thf-split"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1440,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0,1.08fr) minmax(0,0.92fr)",
            minHeight: "92vh",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "64px clamp(20px,4vw,48px)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                width: "fit-content",
                border: "1px solid rgba(255,255,255,.18)",
                padding: "10px 14px",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.62)",
                marginBottom: 32,
              }}
            >
              <span
                style={{
                  height: 8,
                  width: 8,
                  borderRadius: "50%",
                  background: "#f45a0b",
                  boxShadow: "0 0 0 6px rgba(244,90,11,.14)",
                }}
              />
              Edición 2026 · Tampico, Tamaulipas
            </div>

            <h1
              className="thf-wordmark"
              style={{
                fontSize: "clamp(4.4rem,12.5vw,13rem)",
                lineHeight: 0.78,
                letterSpacing: "-0.07em",
                textTransform: "uppercase",
                margin: 0,
                maxWidth: "100%",
              }}
            >
              <span className="thf-h1-mask">
                <span>
                  TH<span style={{ color: "#f45a0b" }}>F</span>
                </span>
              </span>
            </h1>

            <div
              className="thf-wordmark"
              style={{
                marginTop: 14,
                fontSize: "clamp(1.5rem,3.4vw,3rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              <span className="thf-h1-mask">
                <span>Tampico Hybrid Fest</span>
              </span>
            </div>

            <span className="thf-h1-rule" style={{ width: "min(340px, 60%)", marginTop: 22 }} />

            <div
              className="thf-wordmark"
              style={{
                marginTop: 20,
                fontSize: "clamp(1.05rem,2vw,1.6rem)",
                lineHeight: 1.1,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.72)",
              }}
            >
              Más fuerte <span style={{ color: "#f45a0b" }}>no basta.</span>
            </div>

            <WodToday published={publishedWod} />

            <p
              style={{
                maxWidth: "46ch",
                fontSize: 17,
                lineHeight: 1.7,
                color: "rgba(255,255,255,.64)",
                margin: "36px 0 0",
              }}
            >
              Una arena para atletas que entrenan fuerza, motor y cabeza. Tampico Hybrid Fest pone
              a prueba lo que pasa cuando ya no puedes esconderte detrás de una sola especialidad.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 44,
                maxWidth: 420,
              }}
            >
              <a href={ROUTES.quiz} style={{ ...ctaBase, background: "#f45a0b", color: "#000" }}>
                Encuentra tu categoría →
              </a>
              <a
                href={ROUTES.portal}
                style={{
                  ...ctaBase,
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,.3)",
                }}
              >
                Entrar al portal
              </a>
              <a href={ROUTES.game} style={{ ...ctaBase, background: "#f5f3ee", color: "#080808" }}>
                🎮 Jugar THF Game
              </a>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: "1px solid rgba(255,255,255,.1)",
              padding: "48px clamp(20px,3vw,56px)",
            }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: 590 }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1.2/1",
                  background: "#fff",
                  padding: 28,
                  boxShadow: "0 40px 120px rgba(0,0,0,.55)",
                  transform: "skewY(-2deg)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: 16,
                    width: "40%",
                    background: "#f45a0b",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 16,
                    width: "25%",
                    background: "#000",
                  }}
                />
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                    transform: "skewY(2deg) scale(1.03)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/velaria.png"
                    alt="La Velaria de Tampico · algo grande viene"
                    style={{
                      display: "block",
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                      objectPosition: "50% 42%",
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    background: "#000",
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#fff",
                  }}
                >
                  THF / 26
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: -24,
                  left: -12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#f45a0b",
                  padding: "16px 20px",
                  color: "#000",
                  boxShadow: "0 20px 40px rgba(0,0,0,.3)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
                </svg>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                    }}
                  >
                    14 — 15 Nov
                  </div>
                  <div className="thf-wordmark" style={{ fontSize: 20, fontWeight: 900 }}>
                    LA VELARIA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- marquee -- */}
      <div
        style={{
          overflow: "hidden",
          borderBottom: "1px solid #000",
          background: "#f45a0b",
          padding: "16px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "thf-marquee 22s linear infinite",
          }}
        >
          {MARQUEE_LOOP.map((word, index) => (
            <div
              key={`${word}-${index}`}
              style={{ display: "flex", alignItems: "center", gap: 32, padding: "0 20px" }}
            >
              <span
                className="thf-wordmark"
                style={{
                  fontSize: "clamp(1.5rem,3vw,2.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#000",
                }}
              >
                {word}
              </span>
              <span
                style={{ height: 10, width: 10, transform: "rotate(45deg)", background: "#000" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------- 01 el evento -- */}
      <section id="evento" style={{ background: "#f5f3ee", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div
            className="thf-split"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,0.8fr) minmax(0,1.2fr)",
              gap: "clamp(32px,5vw,80px)",
            }}
          >
            <div>
              <SectionLabel n="01">El evento</SectionLabel>
              <h2
                className="thf-wordmark"
                style={{
                  fontSize: "clamp(3rem,6.7vw,7.5rem)",
                  lineHeight: 0.86,
                  letterSpacing: "-0.055em",
                  textTransform: "uppercase",
                  margin: "24px 0 0",
                  maxWidth: "20ch",
                }}
              >
                NO ES SER BUENO EN TODO.
              </h2>
            </div>
            <div style={{ paddingTop: 48 }}>
              <p
                style={{
                  fontSize: "clamp(1.5rem,2.6vw,2.25rem)",
                  fontWeight: 500,
                  lineHeight: 1.25,
                  letterSpacing: "-0.03em",
                  color: "rgba(0,0,0,.85)",
                  margin: 0,
                  maxWidth: "40ch",
                }}
              >
                Es seguir funcionando cuando el reto cambia.{" "}
                <span style={{ color: "#f45a0b" }}>THF mide al atleta completo</span>, no al
                especialista protegido por su zona cómoda.
              </p>
              <p
                style={{
                  maxWidth: "56ch",
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: "rgba(0,0,0,.58)",
                  margin: "32px 0 0",
                }}
              >
                La competencia mezcla demandas de fuerza y resistencia dentro de una experiencia
                creada para Tampico. Cada prueba cuenta una parte de la historia. El resultado
                final muestra quién pudo adaptarse mejor.
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 80,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              borderLeft: "1px solid #000",
              borderTop: "1px solid #000",
            }}
          >
            {TRAITS.map((trait, index) => (
              <div
                key={trait.n}
                className="thf-trait-card"
                style={{
                  minHeight: 330,
                  padding: 28,
                  borderBottom: "1px solid #000",
                  borderRight: "1px solid #000",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "default",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: "0.18em",
                      color: "#f45a0b",
                    }}
                  >
                    {trait.n}
                  </span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                  >
                    {TRAIT_ICONS[index]}
                  </svg>
                </div>
                <div style={{ marginTop: 80 }}>
                  <h3
                    className="thf-wordmark"
                    style={{
                      fontSize: "clamp(2.2rem,3.5vw,3rem)",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {trait.label}
                  </h3>
                  <p
                    style={{
                      marginTop: 20,
                      maxWidth: "26ch",
                      fontSize: 15,
                      lineHeight: 1.6,
                      opacity: 0.6,
                    }}
                  >
                    {trait.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- 02 categorias -- */}
      <section
        id="categorias"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#0a0a0a",
          color: "#fff",
          padding: SECTION_PAD,
        }}
      >
        <div style={{ position: "relative", maxWidth: 1440, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24,
            }}
          >
            <div>
              <SectionLabel n="02" tone="light">
                Categorías
              </SectionLabel>
              <h2
                className="thf-wordmark"
                style={{
                  fontSize: "clamp(3rem,6.7vw,7.5rem)",
                  lineHeight: 0.86,
                  letterSpacing: "-0.055em",
                  textTransform: "uppercase",
                  margin: "24px 0 0",
                  maxWidth: "26ch",
                }}
              >
                DOS FORMAS DE ENTRAR A LA ARENA.
              </h2>
            </div>
            <a
              href={ROUTES.quiz}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                minHeight: 46,
                padding: "14px 18px",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                background: "#fff",
                color: "#000",
                border: "1px solid #fff",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              Descubre la tuya
            </a>
          </div>

          <div
            className="thf-split thf-station-card"
            style={{
              marginTop: 48,
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
              height: "clamp(220px, 30vw, 340px)",
              border: "1px solid rgba(255,255,255,.14)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "clamp(18px,3vw,34px)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#f45a0b",
                }}
              >
                Wall ball shots · estación 09
              </div>
              <div
                className="thf-wordmark"
                style={{
                  marginTop: 8,
                  fontSize: "clamp(1.4rem,3vw,2.2rem)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  maxWidth: "22ch",
                }}
              >
                La misma ruta. Distinta carga.
              </div>
            </div>
            <div style={{ position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/assets/p-wallball.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "50% 38%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,.35) 26%, rgba(10,10,10,0) 60%)",
                }}
              />
            </div>
          </div>

          <div
            className="thf-split"
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 16,
            }}
          >
            <a href={ROUTES.community} className="thf-cat-card" style={communityCard}>
              <div
                className="thf-wordmark"
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  fontSize: "14rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  opacity: 0.07,
                }}
              >
                01
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    lineHeight: 1.5,
                    maxWidth: "22ch",
                    color: "#f45a0b",
                  }}
                >
                  Hybrid Race · sábado 14
                  <br />
                  {formatMXN(phase.priceCM)} MXN por pareja
                </span>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M7 17 17 7M17 7H8M17 7v9" />
                </svg>
              </div>
              <div style={{ position: "relative" }}>
                <div
                  className="thf-wordmark"
                  style={{
                    fontSize: "clamp(2.6rem,5.6vw,6.2rem)",
                    lineHeight: 0.82,
                    letterSpacing: "-0.06em",
                  }}
                >
                  COMMUNITY
                </div>
                <p
                  style={{
                    marginTop: 28,
                    maxWidth: "34ch",
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,.58)",
                  }}
                >
                  Para vivir THF, medir tu nivel y competir dentro de una atmósfera seria sin
                  convertir el podio en la única razón para estar aquí.
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 32,
                    borderBottom: "1px solid #fff",
                    paddingBottom: 4,
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Ver categoría →
                </div>
              </div>
            </a>

            <a href={ROUTES.open} className="thf-cat-card" style={openCard}>
              <div
                className="thf-wordmark"
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  fontSize: "14rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  opacity: 0.07,
                }}
              >
                02
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    lineHeight: 1.5,
                    maxWidth: "22ch",
                    color: "rgba(0,0,0,.6)",
                  }}
                >
                  Full Weekend · 14 y 15
                  <br />
                  {formatMXN(phase.priceOP)} MXN por pareja
                </span>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M7 17 17 7M17 7H8M17 7v9" />
                </svg>
              </div>
              <div style={{ position: "relative" }}>
                <div
                  className="thf-wordmark"
                  style={{
                    fontSize: "clamp(2.8rem,6vw,6.6rem)",
                    lineHeight: 0.82,
                    letterSpacing: "-0.06em",
                    color: "#2e2b25",
                  }}
                >
                  OPEN
                </div>
                <p
                  style={{
                    marginTop: 28,
                    maxWidth: "34ch",
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "rgba(0,0,0,.7)",
                  }}
                >
                  Para atletas que vienen a competir. Más demanda, más presión y un ranking que
                  convierte cada resultado oficial en posición.
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 32,
                    borderBottom: "1px solid #000",
                    paddingBottom: 4,
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Ver categoría →
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- 03 experiencia -- */}
      <section
        id="experiencia"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#fff",
          padding: SECTION_PAD,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "46%",
            backgroundImage: "url('/assets/p-row.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "44% 50%",
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "46%",
            background:
              "linear-gradient(90deg, #fff 0%, rgba(255,255,255,.55) 55%, rgba(255,255,255,.25) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -240,
            top: 100,
            height: 620,
            width: 620,
            borderRadius: "50%",
            border: "2px solid rgba(244,90,11,.2)",
          }}
        />

        <div style={{ position: "relative", maxWidth: 1440, margin: "0 auto" }}>
          <SectionLabel n="03">Experiencia</SectionLabel>

          <div
            className="thf-split"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,0.9fr)",
              gap: 48,
              alignItems: "end",
              marginTop: 24,
            }}
          >
            <h2
              className="thf-wordmark"
              style={{
                fontSize: "clamp(2.5rem,4.5vw,4.5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.045em",
                textTransform: "uppercase",
                margin: 0,
                maxWidth: "24ch",
              }}
            >
              DE TU REGISTRO AL ÚLTIMO SCORE.
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: "rgba(0,0,0,.58)",
                margin: 0,
                maxWidth: "42ch",
              }}
            >
              THF no termina en una mesa de registro y una hoja pegada en la pared. La experiencia
              digital acompaña la competencia antes, durante y después del evento.
            </p>
          </div>

          <div style={{ marginTop: 64, borderTop: "1px solid #000" }}>
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="thf-step-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px minmax(0,1fr) minmax(0,1fr)",
                  gap: 24,
                  alignItems: "center",
                  borderBottom: "1px solid #000",
                  padding: "40px 0",
                }}
              >
                <div
                  className="thf-wordmark"
                  style={{ fontSize: "2.25rem", fontWeight: 900, color: "#f45a0b" }}
                >
                  {step.n}
                </div>
                <h3
                  className="thf-wordmark"
                  style={{
                    fontSize: "clamp(1.5rem,2.5vw,2rem)",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "-0.04em",
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    maxWidth: "40ch",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(0,0,0,.55)",
                    margin: 0,
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- 04 thf digital -- */}
      <section style={{ overflow: "hidden", background: "#f45a0b", padding: SECTION_PAD }}>
        <div
          className="thf-split"
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0,0.8fr) minmax(0,1.2fr)",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <SectionLabel n="04" tone="orange">
              THF Digital
            </SectionLabel>
            <h2
              className="thf-wordmark"
              style={{
                fontSize: "clamp(2.5rem,4.5vw,4.5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.045em",
                textTransform: "uppercase",
                color: "#000",
                margin: "24px 0 0",
                maxWidth: "16ch",
              }}
            >
              TU COMPETENCIA. EN TU BOLSILLO.
            </h2>
            <p
              style={{
                marginTop: 32,
                maxWidth: "40ch",
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(0,0,0,.65)",
              }}
            >
              Heat, lane, programación, resultados y leaderboard. Cada pareja ve lo que necesita
              sin perseguir hojas impresas por todo el Recinto Ferial.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 36 }}>
              {APP_FEATURES.map((feature) => (
                <span
                  key={feature}
                  style={{
                    border: "1px solid rgba(0,0,0,.35)",
                    padding: "8px 16px",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center" }}>
            {/* Telefono 1 · inicio */}
            <div className="thf-phone">
              <div className="thf-notch" />
              <div className="thf-screen">
                <div
                  style={{
                    padding: "34px 14px 12px",
                    background: "linear-gradient(180deg, rgba(244,90,11,.24), transparent)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 8,
                          fontWeight: 800,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,.5)",
                        }}
                      >
                        Hola, pareja
                      </div>
                      <div
                        className="thf-wordmark"
                        style={{
                          marginTop: 3,
                          fontSize: 15,
                          textTransform: "uppercase",
                          color: "#fff",
                        }}
                      >
                        Alacranes
                      </div>
                    </div>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        background: "rgba(244,90,11,.2)",
                        border: "1px solid rgba(244,90,11,.45)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 13,
                      }}
                    >
                      🦂
                    </div>
                  </div>
                </div>

                <div style={{ padding: "4px 14px 14px", display: "grid", gap: 10 }}>
                  <div
                    style={{
                      border: "1px solid rgba(244,90,11,.45)",
                      borderRadius: 14,
                      background: "rgba(244,90,11,.12)",
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#f45a0b",
                      }}
                    >
                      Tu próximo heat
                    </div>
                    <div
                      className="thf-wordmark"
                      style={{
                        marginTop: 6,
                        fontSize: 26,
                        fontVariantNumeric: "tabular-nums",
                        color: "#fff",
                      }}
                    >
                      09:40
                    </div>
                    <div style={{ marginTop: 4, fontSize: 10, color: "rgba(255,255,255,.7)" }}>
                      Hybrid Race · Heat 4 · Lane 07
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        height: 5,
                        borderRadius: 999,
                        background: "rgba(255,255,255,.14)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ height: "100%", width: "62%", background: "#f45a0b" }} />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid rgba(255,255,255,.12)",
                        borderRadius: 12,
                        padding: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 7,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,.45)",
                        }}
                      >
                        Ranking
                      </div>
                      <div
                        className="thf-wordmark"
                        style={{ marginTop: 4, fontSize: 17, color: "#fff" }}
                      >
                        12º
                      </div>
                    </div>
                    <div
                      style={{
                        border: "1px solid rgba(255,255,255,.12)",
                        borderRadius: 12,
                        padding: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 7,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,.45)",
                        }}
                      >
                        División
                      </div>
                      <div
                        className="thf-wordmark"
                        style={{ marginTop: 4, fontSize: 13, color: "#fff" }}
                      >
                        Open
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 12,
                      padding: 10,
                      display: "grid",
                      gap: 7,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 7,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.45)",
                      }}
                    >
                      Pareja
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontSize: 10,
                        color: "rgba(255,255,255,.85)",
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "rgba(244,90,11,.2)",
                          border: "1px solid rgba(244,90,11,.4)",
                        }}
                      />{" "}
                      Karla M. · líder
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontSize: 10,
                        color: "rgba(255,255,255,.85)",
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,.08)",
                          border: "1px solid rgba(255,255,255,.18)",
                        }}
                      />{" "}
                      Diego R.
                    </div>
                  </div>
                </div>

                <div className="thf-tabbar">
                  <div style={{ color: "#f45a0b" }}>Inicio</div>
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Agenda</div>
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Scores</div>
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Rank</div>
                </div>
              </div>
            </div>

            {/* Telefono 2 · agenda */}
            <div className="thf-phone">
              <div className="thf-notch" />
              <div className="thf-screen">
                <div style={{ padding: "34px 14px 10px" }}>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#f45a0b",
                    }}
                  >
                    Programación
                  </div>
                  <div
                    className="thf-wordmark"
                    style={{
                      marginTop: 5,
                      fontSize: 17,
                      textTransform: "uppercase",
                      color: "#fff",
                    }}
                  >
                    Sábado 14
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                    <span
                      style={{
                        borderRadius: 999,
                        background: "#f45a0b",
                        color: "#000",
                        padding: "4px 9px",
                        fontSize: 8,
                        fontWeight: 900,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Sáb
                    </span>
                    <span
                      style={{
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,.18)",
                        color: "rgba(255,255,255,.6)",
                        padding: "4px 9px",
                        fontSize: 8,
                        fontWeight: 900,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Dom
                    </span>
                  </div>
                </div>

                <div style={{ padding: "6px 14px 14px", display: "grid", gap: 8 }}>
                  {APP_AGENDA.map((item) => (
                    <div
                      key={item.time}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "44px 1fr",
                        gap: 8,
                        alignItems: "center",
                        borderLeft: `2px solid ${item.tone}`,
                        padding: "7px 0 7px 8px",
                      }}
                    >
                      <div
                        className="thf-wordmark"
                        style={{
                          fontSize: 12,
                          fontVariantNumeric: "tabular-nums",
                          color: item.tone,
                        }}
                      >
                        {item.time}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.9)" }}>
                          {item.title}
                        </div>
                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 8,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,.4)",
                          }}
                        >
                          {item.meta}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="thf-tabbar">
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Inicio</div>
                  <div style={{ color: "#f45a0b" }}>Agenda</div>
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Scores</div>
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Rank</div>
                </div>
              </div>
            </div>

            {/* Telefono 3 · leaderboard */}
            <div className="thf-phone">
              <div className="thf-notch" />
              <div className="thf-screen">
                <div style={{ padding: "34px 14px 10px" }}>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#f45a0b",
                    }}
                  >
                    Leaderboard
                  </div>
                  <div
                    className="thf-wordmark"
                    style={{
                      marginTop: 5,
                      fontSize: 17,
                      textTransform: "uppercase",
                      color: "#fff",
                    }}
                  >
                    Open · en vivo
                  </div>
                </div>

                <div style={{ padding: "6px 14px 14px", display: "grid", gap: 6 }}>
                  {APP_BOARD.map((row) => (
                    <div
                      key={row.rank}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "22px 1fr 46px",
                        gap: 8,
                        alignItems: "center",
                        border: `1px solid ${row.border}`,
                        borderRadius: 10,
                        background: row.bg,
                        padding: 8,
                      }}
                    >
                      <div className="thf-wordmark" style={{ fontSize: 12, color: row.rankColor }}>
                        {row.rank}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#fff" }}>{row.team}</div>
                        <div style={{ marginTop: 2, fontSize: 8, color: "rgba(255,255,255,.42)" }}>
                          {row.athletes}
                        </div>
                      </div>
                      <div
                        className="thf-wordmark"
                        style={{
                          textAlign: "right",
                          fontSize: 11,
                          fontVariantNumeric: "tabular-nums",
                          color: "rgba(255,255,255,.85)",
                        }}
                      >
                        {row.pts}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="thf-tabbar">
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Inicio</div>
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Agenda</div>
                  <div style={{ color: "rgba(255,255,255,.4)" }}>Scores</div>
                  <div style={{ color: "#f45a0b" }}>Rank</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- 05 sede -- */}
      <section
        id="sede"
        style={{ position: "relative", overflow: "hidden", background: "#0a0a0a", color: "#fff" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/assets/p-velaria-sun.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "50% 42%",
            filter: "saturate(.9)",
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,10,10,.86) 0%, rgba(10,10,10,.68) 55%, rgba(10,10,10,.9) 100%)",
          }}
        />

        <div
          className="thf-split"
          style={{
            position: "relative",
            maxWidth: 1440,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
          }}
        >
          <div
            style={{
              position: "relative",
              minHeight: 460,
              padding: "clamp(28px,4vw,48px)",
              borderRight: "1px solid rgba(255,255,255,.15)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <SectionLabel n="05" tone="light">
              Sede
            </SectionLabel>

            <div
              style={{
                margin: "24px 0",
                border: "1px solid rgba(255,255,255,.16)",
                height: "clamp(180px, 24vw, 240px)",
              }}
            >
              <iframe
                src="/map-velaria.html"
                title="Mapa de La Velaria, Recinto Ferial Tampico"
                loading="lazy"
                style={{ display: "block", width: "100%", height: "100%", border: 0 }}
              />
            </div>

            <div>
              <div
                className="thf-wordmark"
                style={{
                  fontSize: "clamp(2.4rem,6vw,4.4rem)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.055em",
                }}
              >
                TAMPICO
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#f45a0b",
                }}
              >
                Tamaulipas · México
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Recinto+Ferial+Tampico+Velaria"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 20,
                  minHeight: 46,
                  padding: "12px 20px",
                  border: "1px solid rgba(255,255,255,.28)",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#fff",
                }}
              >
                Abrir en Google Maps →
              </a>
            </div>
          </div>

          <div
            style={{
              minHeight: 460,
              padding: "clamp(28px,4vw,48px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 40,
              }}
            >
              <div>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f45a0b"
                  strokeWidth={2.5}
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.4)",
                  }}
                >
                  Fecha
                </div>
                <div
                  className="thf-wordmark"
                  style={{ marginTop: 8, fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900 }}
                >
                  14 — 15 NOV
                </div>
                <div style={{ marginTop: 8, color: "rgba(255,255,255,.5)" }}>2026</div>
              </div>

              <div>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f45a0b"
                  strokeWidth={2.5}
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.4)",
                  }}
                >
                  Arena
                </div>
                <div
                  className="thf-wordmark"
                  style={{ marginTop: 8, fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900 }}
                >
                  LA VELARIA
                </div>
                <div style={{ marginTop: 8, color: "rgba(255,255,255,.5)" }}>
                  Recinto Ferial Tampico, Tamaulipas
                </div>
              </div>
            </div>

            <Countdown />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- cierre / cta -- */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#f5f3ee",
          padding: "clamp(64px,8vw,160px) clamp(20px,4vw,48px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-12%",
            top: "-30%",
            height: "160%",
            width: "34%",
            background: "#f45a0b",
            clipPath: "polygon(55% 0, 100% 0, 45% 100%, 0 100%)",
          }}
        />
        <div style={{ position: "relative", margin: "0 auto", maxWidth: 900 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f45a0b",
            }}
          >
            Tu siguiente prueba empieza aquí
          </div>
          <h2
            className="thf-wordmark"
            style={{
              fontSize: "clamp(3.6rem,9.4vw,7rem)",
              lineHeight: 0.82,
              letterSpacing: "-0.065em",
              textTransform: "uppercase",
              color: "#000",
              margin: "28px 0 0",
            }}
          >
            ENTRA A<span style={{ display: "block" }}>LA ARENA.</span>
          </h2>
          <p
            style={{
              maxWidth: "42ch",
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(0,0,0,.58)",
              margin: "32px 0 0",
            }}
          >
            Encuentra la categoría correcta para ti y continúa tu registro dentro de THF 2026.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>
            <a
              href={ROUTES.quiz}
              style={{
                ...ctaBase,
                background: "#080808",
                color: "#fff",
                border: "1px solid #080808",
              }}
            >
              Encontrar mi categoría →
            </a>
            <a
              href={ROUTES.community}
              style={{
                ...ctaBase,
                background: "transparent",
                color: "#000",
                border: "1px solid rgba(0,0,0,.25)",
              }}
            >
              Ver Community
            </a>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- footer -- */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,.1)",
          background: "#080808",
          color: "#fff",
          padding: "40px clamp(20px,4vw,48px)",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <div>
            <div className="thf-wordmark" style={{ fontSize: 22, fontWeight: 900 }}>
              TAMPICO HYBRID
            </div>
            <div
              className="thf-wordmark"
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: "#f45a0b",
                marginTop: 4,
              }}
            >
              FEST 2026
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.35)",
              }}
            >
              La Velaria · Recinto Ferial Tampico
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.55)",
            }}
          >
            <a href={ROUTES.community}>Community</a>
            <a href={ROUTES.open}>Open</a>
            <a href={ROUTES.sponsors}>Patrocinadores</a>
            <a href={ROUTES.leaderboard}>Leaderboard</a>
            <a href={ROUTES.game}>THF Game</a>
            <a href={ROUTES.portal}>Portal</a>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1440,
            margin: "40px auto 0",
            borderTop: "1px solid rgba(255,255,255,.1)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.25)",
          }}
        >
          <span>© 2026 Tampico Hybrid Fest</span>
          <span>THF / MX</span>
        </div>
      </footer>
    </div>
  );
}
