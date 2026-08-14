import type { Metadata } from "next";

import { CategoryPage } from "@/components/category/category-page";
import { CATEGORY_CONTENT } from "@/lib/category-data";

export const metadata: Metadata = {
  title: "Community · THF 2026",
  description:
    "Una jornada en pareja el sábado 14 de noviembre, con relevos libres y cargas ajustadas. $2,000 MXN por pareja.",
};

export default function CommunityPage() {
  return (
    <CategoryPage
      content={CATEGORY_CONTENT.CM}
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
