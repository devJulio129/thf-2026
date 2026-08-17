import type { Metadata } from "next";

import { QuizFlow } from "@/components/quiz/quiz-flow";
import { getCurrentPhase, toPrices } from "@/lib/phases";

export const metadata: Metadata = {
  title: "Encuentra tu categoría · THF 2026",
  description:
    "Cinco preguntas para saber si te toca Community u Open en el Tampico Hybrid Fest 2026.",
};

/** El precio del resultado sale de la fase activa; se refresca cada minuto. */
export const revalidate = 60;

export default async function QuizPage() {
  const phase = await getCurrentPhase();
  return <QuizFlow prices={toPrices(phase)} />;
}
