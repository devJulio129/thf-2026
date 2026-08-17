import type { Metadata } from "next";

import { CategoryPage } from "@/components/category/category-page";
import { CATEGORY_CONTENT, withPhasePrice } from "@/lib/category-data";
import { getCurrentPhase } from "@/lib/phases";

export const metadata: Metadata = {
  title: "Community · THF 2026",
  // Sin precio a proposito: cambia por fase y esto se cachea.
  description:
    "Una jornada en pareja el sábado 14 de noviembre, con relevos libres y cargas ajustadas.",
};

/** El precio de la tarjeta sale de la fase activa; se refresca cada minuto. */
export const revalidate = 60;

export default async function CommunityPage() {
  const phase = await getCurrentPhase();
  return (
    <CategoryPage
      content={withPhasePrice(CATEGORY_CONTENT.CM, phase.priceCM)}
      intro={
        <>
          La categoría hecha para los que vienen a retarse en pareja, conocer gente y celebrar con
          la comunidad. Una carrera híbrida el{" "}
          <span style={{ color: "#fff" }}>sábado 14 de noviembre</span>, con relevos libres y cargas
          ajustadas. Sin presión de podio, con toda la adrenalina.
        </>
      }
    />
  );
}
