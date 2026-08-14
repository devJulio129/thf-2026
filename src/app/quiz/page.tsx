import type { Metadata } from "next";

import { QuizFlow } from "@/components/quiz/quiz-flow";

export const metadata: Metadata = {
  title: "Encuentra tu categoría · THF 2026",
  description:
    "Cinco preguntas para saber si te toca Community u Open en el Tampico Hybrid Fest 2026.",
};

export default function QuizPage() {
  return <QuizFlow />;
}
