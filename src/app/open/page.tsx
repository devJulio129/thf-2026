import type { Metadata } from "next";

import { CategoryPage } from "@/components/category/category-page";
import { CATEGORY_CONTENT, withPhasePrice } from "@/lib/category-data";
import { getCurrentPhase } from "@/lib/phases";

export const metadata: Metadata = {
  title: "Open · THF 2026",
  // Sin precio a proposito: cambia por fase y esto se cachea.
  description:
    "Full Weekend en pareja: Hybrid Race el sábado 14 y Zone Challenge el domingo 15.",
};

/** El precio de la tarjeta sale de la fase activa; se refresca cada minuto. */
export const revalidate = 60;

export default async function OpenPage() {
  const phase = await getCurrentPhase();
  return (
    <CategoryPage
      content={withPhasePrice(CATEGORY_CONTENT.OP, phase.priceOP)}
      intro={
        <>
          La experiencia completa, en pareja.{" "}
          <span style={{ color: "#fff" }}>Sábado 14: Hybrid Race con cargas Open.</span>{" "}
          <span style={{ color: "#fff" }}>Domingo 15: Zone Challenge de 100 minutos.</span> Aquí se
          decide la pareja más completa del THF 2026 y el título The Fittest.
        </>
      }
    />
  );
}
