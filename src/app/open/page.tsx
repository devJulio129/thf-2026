import type { Metadata } from "next";

import { CategoryPage } from "@/components/category/category-page";
import { CATEGORY_CONTENT } from "@/lib/category-data";

export const metadata: Metadata = {
  title: "Open · THF 2026",
  description:
    "Full Weekend en pareja: Hybrid Race el sábado 14 y Zone Challenge el domingo 15. $2,300 MXN por pareja.",
};

export default function OpenPage() {
  return (
    <CategoryPage
      content={CATEGORY_CONTENT.OP}
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
