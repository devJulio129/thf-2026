/**
 * Datos del constructor de emblemas, portados tal cual del prototipo
 * (Tampico Hybrid Fest - Profile.dc.html).
 *
 * Un emblema son tres capas: placa + patron + simbolo, cada una con su color.
 */

export type EmblemShape = { id: string; name: string; d: string };
export type EmblemPattern = { id: string; name: string; ds: string[] };
export type EmblemIcon = { id: string; name: string; ds: string[] };

export const PLATES: EmblemShape[] = [
  { id: "shield", name: "Escudo", d: "M50 6 L88 20 V52 C88 74 70 88 50 95 C30 88 12 74 12 52 V20 Z" },
  { id: "hex", name: "Hexagono", d: "M50 5 L89 27 V73 L50 95 L11 73 V27 Z" },
  { id: "circle", name: "Circulo", d: "M50 5 A45 45 0 1 1 49.9 5 Z" },
  { id: "diamond", name: "Diamante", d: "M50 4 L95 50 L50 96 L5 50 Z" },
  { id: "square", name: "Placa", d: "M12 12 H88 V88 H12 Z" },
  { id: "octagon", name: "Octagono", d: "M34 6 H66 L94 34 V66 L66 94 H34 L6 66 V34 Z" },
  { id: "triangle", name: "Triangulo", d: "M50 8 L94 88 H6 Z" },
  { id: "pentagon", name: "Pentagono", d: "M50 5 L94 37 L77 90 H23 L6 37 Z" },
  { id: "star", name: "Estrella", d: "M50 5 L62 38 L96 39 L69 59 L79 92 L50 73 L21 92 L31 59 L4 39 L38 38 Z" },
  { id: "cross", name: "Cruz", d: "M36 8 H64 V36 H92 V64 H64 V92 H36 V64 H8 V36 H36 Z" },
  { id: "banner", name: "Banderin", d: "M14 8 H86 V78 L50 96 L14 78 Z" },
  { id: "arrow", name: "Punta", d: "M50 4 L92 30 V70 L50 96 L8 70 V30 Z" },
];

export const PATTERNS: EmblemPattern[] = [
  { id: "none", name: "Sin patron", ds: [] },
  { id: "half", name: "Mitad", ds: ["M50 0 H100 V100 H50 Z"] },
  { id: "bars", name: "Franjas", ds: ["M0 18 H100 V30 H0 Z", "M0 44 H100 V56 H0 Z", "M0 70 H100 V82 H0 Z"] },
  { id: "diag", name: "Diagonal", ds: ["M-10 70 L70 -10 L100 20 L20 100 Z"] },
  { id: "chevron", name: "Chevron", ds: ["M50 20 L92 62 L74 80 L50 56 L26 80 L8 62 Z"] },
  { id: "ring", name: "Anillo", ds: ["M50 14 A36 36 0 1 1 49.9 14 Z M50 32 A18 18 0 1 0 50.1 32 Z"] },
  { id: "split", name: "Corte", ds: ["M0 100 L100 0 V100 Z"] },
  { id: "quad", name: "Cuadrantes", ds: ["M0 0 H50 V50 H0 Z", "M50 50 H100 V100 H50 Z"] },
];

export const ICONS: EmblemIcon[] = [
  { id: "skull", name: "Calavera", ds: ["M50 12c-16 0-28 12-28 28 0 9 4 15 8 19v9c0 4 3 8 8 8h24c5 0 8-4 8-8v-9c4-4 8-10 8-19 0-16-12-28-28-28zm-11 26a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm22 0a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-11 20 5 9h-10z"] },
  { id: "bolt", name: "Rayo", ds: ["M56 8 24 56h18l-6 36 34-52H52z"] },
  { id: "flame", name: "Llama", ds: ["M50 8c8 16-6 22-6 34 0 8 6 12 6 12s-14 4-14 18 12 20 14 20c-24-2-30-18-30-32C20 36 44 30 50 8zm8 26c14 10 22 20 22 34 0 14-10 24-24 26 4-6 8-12 8-20 0-14-14-18-6-40z"] },
  { id: "crown", name: "Corona", ds: ["M12 34 28 52 50 20l22 32 16-18-8 44H20z"] },
  { id: "kettle", name: "Kettlebell", ds: ["M50 14c-12 0-20 8-20 18 0 5 2 9 5 12-9 5-13 14-13 24 0 8 6 14 14 14h28c8 0 14-6 14-14 0-10-4-19-13-24 3-3 5-7 5-12 0-10-8-18-20-18zm0 10c6 0 10 4 10 9s-4 9-10 9-10-4-10-9 4-9 10-9z"] },
  { id: "scorpion", name: "Alacran", ds: ["M30 34 20 22l-8 6 12 16-8 12 10 8 8-10 12 12v14l10 10 10-10-6-12 12-16-10-8-10 12-14-14z"] },
  { id: "paw", name: "Garra", ds: ["M32 30a8 9 0 1 1 0 18 8 9 0 0 1 0-18zm36 0a8 9 0 1 1 0 18 8 9 0 0 1 0-18zM50 22a8 9 0 1 1 0 18 8 9 0 0 1 0-18zM50 54c12 0 22 8 22 16s-10 10-22 10-22-2-22-10 10-16 22-16z"] },
  { id: "anchor", name: "Ancla", ds: ["M46 14h8v14h12v10H54v34c12-2 20-10 22-22h10c-2 22-18 36-36 36S16 72 14 50h10c2 12 10 20 22 22V38H34V28h12z"] },
  { id: "eye", name: "Ojo", ds: ["M50 26c20 0 34 14 40 24-6 10-20 24-40 24S16 60 10 50c6-10 20-24 40-24zm0 12a12 12 0 1 0 0 24 12 12 0 0 0 0-24z"] },
  { id: "wing", name: "Ala", ds: ["M14 30c22 0 40 8 52 22-8 4-16 4-24 2 8 8 16 12 26 14-12 8-30 6-42-6C16 52 14 40 14 30z"] },
  { id: "trident", name: "Tridente", ds: ["M46 12h8v20h10V20h10v22c0 8-6 14-14 16v34h-8V58c-8-2-14-8-14-16V20h10v12h-2z"] },
  { id: "wave", name: "Ola", ds: ["M10 40c10-12 22-12 32 0s22 12 32 0l14 14c-10 12-22 12-32 0s-22-12-32 0zm0 26c10-12 22-12 32 0s22 12 32 0l14 12c-10 12-22 12-32 0s-22-12-32 0z"] },
  { id: "star", name: "Estrella", ds: ["M50 14 61 40l28 2-21 18 6 28-24-15-24 15 6-28-21-18 28-2z"] },
  { id: "target", name: "Diana", ds: ["M50 12a38 38 0 1 0 0 76 38 38 0 0 0 0-76zm0 12a26 26 0 1 1 0 52 26 26 0 0 1 0-52zm0 12a14 14 0 1 0 0 28 14 14 0 0 0 0-28z"] },
  { id: "fist", name: "Puno", ds: ["M28 38c0-8 6-14 14-14h20c8 0 14 6 14 14v6h4c4 0 6 4 6 8v12c0 12-10 22-22 22H44c-10 0-16-6-16-16zm12-2v10h8V36zm14 0v10h8V36z"] },
  { id: "mountain", name: "Cumbre", ds: ["M50 18 84 82H16zm0 22-14 26h28z"] },
];

export const EMBLEM_PALETTE = [
  "#f45a0b",
  "#ff7a2e",
  "#f5f3ee",
  "#101010",
  "#1e3a8a",
  "#7f1d1d",
  "#065f46",
  "#facc15",
  "#4c1d95",
  "#0e7490",
];

export type EmblemSpec = {
  plate: string;
  pattern: string;
  icon: string;
  colorPlate: string;
  colorPattern: string;
  colorIcon: string;
  iconScale: number;
  patternRotation: number;
};

export const DEFAULT_EMBLEM: EmblemSpec = {
  plate: "shield",
  pattern: "bars",
  icon: "scorpion",
  colorPlate: "#f45a0b",
  colorPattern: "#101010",
  colorIcon: "#f5f3ee",
  iconScale: 70,
  patternRotation: 0,
};

function pick<T>(list: T[], random: () => number): T {
  return list[Math.floor(random() * list.length)];
}

export function randomEmblem(random: () => number = Math.random): EmblemSpec {
  return {
    plate: pick(PLATES, random).id,
    pattern: pick(PATTERNS, random).id,
    icon: pick(ICONS, random).id,
    colorPlate: pick(EMBLEM_PALETTE, random),
    colorPattern: pick(EMBLEM_PALETTE, random),
    colorIcon: pick(EMBLEM_PALETTE, random),
    iconScale: 45 + Math.floor(random() * 12) * 5,
    patternRotation: Math.floor(random() * 24) * 15,
  };
}

/** Normaliza lo que venga de la base para que nunca reviente el render. */
export function safeEmblem(value: unknown): EmblemSpec {
  const raw = (typeof value === "object" && value !== null ? value : {}) as Partial<EmblemSpec>;
  return {
    plate: PLATES.some((p) => p.id === raw.plate) ? raw.plate! : DEFAULT_EMBLEM.plate,
    pattern: PATTERNS.some((p) => p.id === raw.pattern) ? raw.pattern! : DEFAULT_EMBLEM.pattern,
    icon: ICONS.some((i) => i.id === raw.icon) ? raw.icon! : DEFAULT_EMBLEM.icon,
    colorPlate: raw.colorPlate ?? DEFAULT_EMBLEM.colorPlate,
    colorPattern: raw.colorPattern ?? DEFAULT_EMBLEM.colorPattern,
    colorIcon: raw.colorIcon ?? DEFAULT_EMBLEM.colorIcon,
    iconScale: typeof raw.iconScale === "number" ? raw.iconScale : DEFAULT_EMBLEM.iconScale,
    patternRotation:
      typeof raw.patternRotation === "number" ? raw.patternRotation : DEFAULT_EMBLEM.patternRotation,
  };
}
