/**
 * Quiz de categoria, portado de Tampico Hybrid Fest - Quiz.dc.html.
 *
 * Cada opcion suma peso a una division; gana la que acumule mas. Los pesos y
 * los textos son los del prototipo.
 */

import type { Division } from "./thf";

export type QuizOption = {
  label: string;
  weights: Partial<Record<Division, number>>;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
};

export const QUESTIONS: QuizQuestion[] = [
  {
    question: "¿Hace cuánto entrenas de forma constante?",
    options: [
      { label: "Menos de 1 año", weights: { CM: 3 } },
      { label: "1 a 3 años", weights: { CM: 2, OP: 1 } },
      { label: "3 a 6 años", weights: { OP: 3 } },
      { label: "Más de 6 años", weights: { OP: 3 } },
    ],
  },
  {
    question: "¿Cuántas veces entrenas por semana?",
    options: [
      { label: "2 — 3", weights: { CM: 3 } },
      { label: "4 — 5", weights: { CM: 1, OP: 2 } },
      { label: "6+", weights: { OP: 3 } },
    ],
  },
  {
    question: "¿Has competido antes en CrossFit, Hyrox o similar?",
    options: [
      { label: "Nunca", weights: { CM: 3 } },
      { label: "1 o 2 veces", weights: { CM: 1, OP: 2 } },
      { label: "Varias competencias", weights: { OP: 3 } },
    ],
  },
  {
    question: "Con cargas pesadas y ya cansado, ¿qué pasa?",
    options: [
      { label: "Prefiero bajar el peso y mantener el ritmo", weights: { CM: 4 } },
      { label: "Aguanto, aunque me cueste la técnica", weights: { CM: 2, OP: 2 } },
      { label: "Ahí es donde le saco ventaja a los demás", weights: { OP: 4 } },
    ],
  },
  {
    question: "¿Qué buscas en el evento?",
    options: [
      { label: "Vivir la experiencia y retarme", weights: { CM: 3, OP: 1 } },
      { label: "Pelear por el podio", weights: { OP: 4 } },
    ],
  },
];

export type QuizResult = {
  name: string;
  tag: string;
  desc: string;
  recommend: string;
  href: string;
};

export const QUIZ_RESULTS: Record<Division, QuizResult> = {
  CM: {
    name: "Community",
    // El precio no va aqui: lo pinta el componente con la fase activa.
    tag: "Una jornada. Un reto. Toda la energía.",
    desc: "La categoría para quienes vienen por la experiencia, la adrenalina y la comunidad. Compiten en pareja el sábado 14 en la Hybrid Race, con relevos libres y cargas ajustadas.",
    recommend: "Foco en cardio y constancia. El sábado lo darán todo.",
    href: "/community",
  },
  OP: {
    name: "Open",
    tag: "Dos días. Cero excusas. Por el ranking.",
    desc: "La modalidad Full Weekend: Hybrid Race el sábado 14 con cargas Open y Zone Challenge el domingo 15, cien minutos en seis zonas. Aquí se define el título The Fittest.",
    recommend: "Trabajen fuerza, cardio y técnica. No hay margen de error.",
    href: "/open",
  },
};

/** Suma los pesos de las respuestas y devuelve la division ganadora. */
export function scoreQuiz(answers: number[]): Division {
  const scores: Record<Division, number> = { CM: 0, OP: 0 };

  answers.forEach((optionIndex, questionIndex) => {
    const option = QUESTIONS[questionIndex]?.options[optionIndex];
    if (!option) return;
    for (const [division, weight] of Object.entries(option.weights)) {
      scores[division as Division] += weight ?? 0;
    }
  });

  // Empate a favor de Community: es la puerta de entrada del evento.
  return scores.OP > scores.CM ? "OP" : "CM";
}
