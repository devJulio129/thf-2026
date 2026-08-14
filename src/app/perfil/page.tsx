import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/login/actions";
import { ProfileEditor, type ProfileData } from "@/components/perfil/profile-editor";
import { TeamSection } from "@/components/perfil/team-section";
import { getMyTeam } from "@/lib/store";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { DIVISIONS, formatMXN, genderLabel } from "@/lib/thf";

export const metadata: Metadata = {
  title: "Mi perfil · THF 2026",
};

/** El estado del equipo cambia por webhook, asi que nunca se cachea. */
export const dynamic = "force-dynamic";

const chipStyle = {
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.15)",
  background: "rgba(0,0,0,.3)",
  padding: "6px 12px",
  fontSize: 11,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "rgba(255,255,255,.8)",
};

/**
 * Portal del atleta, portado de Tampico Hybrid Fest - Profile.dc.html: tarjeta
 * del atleta arriba, datos personales, equipo con su pago, y la credencial
 * digital fija en la columna derecha.
 */
export default async function PerfilPage() {
  const user = await getCurrentUser();
  // El proxy ya redirige a /login, pero un Server Component no debe confiar en
  // eso para decidir que muestra.
  if (!user) redirect("/login?next=/perfil");

  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("display_name, city, birth_date, shirt_size")
    .eq("id", user.id)
    .maybeSingle();

  const team = await getMyTeam();

  const profile: ProfileData = {
    displayName: profileRow?.display_name || user.email?.split("@")[0] || "Atleta",
    city: profileRow?.city ?? "",
    birthDate: profileRow?.birth_date ?? "",
    shirtSize: profileRow?.shirt_size ?? "",
  };

  // Los datos del atleta 2 viven en el equipo.
  const partnerRow = team?.athletes[1] ?? null;
  const partner: ProfileData | null = partnerRow
    ? {
        displayName: partnerRow.name,
        city: partnerRow.city,
        birthDate: partnerRow.birthDate ?? "",
        shirtSize: partnerRow.shirtSize,
      }
    : null;

  const division = team ? DIVISIONS[team.division] : null;
  const divisionLabel = division ? `Categoría ${division.name}` : "Sin categoría";
  const paid = team?.status === "paid";

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#080808",
        color: "#f5f3ee",
        minHeight: "100vh",
      }}
    >
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
            Inicio
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
            Credencial del atleta
          </div>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.6)",
                fontFamily: "inherit",
              }}
            >
              ⏻ Salir
            </button>
          </form>
        </div>
      </header>

      <main style={{ padding: "40px 20px 80px" }}>
        <div
          className="thf-split"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
            gap: 24,
          }}
        >
          <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
            {/* ------------------------------------------- tarjeta de atleta -- */}
            <div
              className="thf-card"
              style={{ padding: 32, position: "relative", overflow: "hidden" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -80,
                  right: -80,
                  width: 260,
                  height: 260,
                  borderRadius: "50%",
                  background: "rgba(244,90,11,.15)",
                  filter: "blur(60px)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  gap: 24,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 112,
                    height: 112,
                    borderRadius: 24,
                    overflow: "hidden",
                    border: "1px solid rgba(244,90,11,.4)",
                    background: "linear-gradient(135deg,#f45a0b,#ff7a2e)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="thf-wordmark"
                    style={{ fontSize: 42, color: "#000", textTransform: "uppercase" }}
                  >
                    {profile.displayName.charAt(0)}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#f45a0b",
                      marginBottom: 8,
                    }}
                  >
                    {divisionLabel}
                  </div>
                  <h1
                    className="thf-wordmark"
                    style={{
                      fontSize: "clamp(1.8rem,4vw,2.6rem)",
                      textTransform: "uppercase",
                      margin: "0 0 8px",
                    }}
                  >
                    {profile.displayName}
                  </h1>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", margin: "0 0 16px" }}>
                    {user.email}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span style={chipStyle}>📅 14 — 15 Nov 2026</span>
                    <span style={chipStyle}>📍 La Velaria · Recinto Ferial</span>
                    {profile.shirtSize ? (
                      <span style={chipStyle}>👕 Playera {profile.shirtSize}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <ProfileEditor profile={profile} partner={partner} />

            <TeamSection
              team={
                team
                  ? {
                      name: team.name,
                      division: team.division,
                      divisionLabel: DIVISIONS[team.division].name,
                      genderLabel: genderLabel(team.gender),
                      amountMXN: team.amountMXN,
                      status: team.status,
                      emblem: team.emblem,
                      athletes: team.athletes,
                    }
                  : null
              }
              defaultName={profile.displayName}
              defaultEmail={user.email ?? ""}
            />
          </div>

          {/* ------------------------------------------ credencial digital -- */}
          <div>
            <div
              className="thf-card"
              style={{
                padding: 24,
                textAlign: "center",
                position: "sticky",
                top: 88,
                background: "linear-gradient(135deg, rgba(244,90,11,.1), rgba(0,0,0,.4), #000)",
                borderColor: "rgba(244,90,11,.2)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#f45a0b",
                  marginBottom: 16,
                }}
              >
                ▦ Credencial digital
              </div>

              {paid ? (
                <>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: 16,
                      display: "inline-block",
                      marginBottom: 16,
                    }}
                  >
                    {/* Marcador visual del QR: el codigo real se genera cuando
                        exista el registro de entrada al evento. */}
                    <div
                      style={{
                        width: 160,
                        height: 160,
                        background:
                          "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0/24px 24px",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#4ade80",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 16,
                    }}
                  >
                    🛡 Inscripción pagada
                  </div>
                </>
              ) : (
                <div
                  style={{
                    borderRadius: 16,
                    border: "1px dashed rgba(244,90,11,.4)",
                    background: "rgba(0,0,0,.4)",
                    padding: "32px 24px",
                    marginBottom: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 28 }}>🔒</span>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.6)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Tu credencial QR se libera cuando tu equipo complete el pago de la inscripción.
                  </p>
                  {team ? (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#f45a0b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: 0,
                      }}
                    >
                      Falta el pago de {formatMXN(team.amountMXN)} MXN
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,.4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: 0,
                      }}
                    >
                      Primero crea tu equipo
                    </p>
                  )}
                </div>
              )}

              <div
                className="thf-wordmark"
                style={{ fontSize: 20, textTransform: "uppercase", marginBottom: 4 }}
              >
                THF 2026
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 16,
                }}
              >
                {divisionLabel}
              </div>
              <a
                href={
                  team?.division === "OP"
                    ? "/open"
                    : "/community"
                }
                style={{
                  display: "block",
                  borderRadius: 999,
                  border: "1px solid rgba(244,90,11,.4)",
                  background: "rgba(244,90,11,.05)",
                  color: "#f45a0b",
                  padding: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Ver mi categoría →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
