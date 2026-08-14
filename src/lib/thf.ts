/**
 * Dominio del Tampico Hybrid Fest 2026.
 *
 * Los precios viven aqui y en ningun otro lado. El cliente nunca manda el monto:
 * solo manda la division, y el servidor resuelve cuanto se cobra. Si el precio
 * viajara en el request, cualquiera podria inscribirse por $1.
 */

export type Division = "CM" | "OP";

export type DivisionInfo = {
  id: Division;
  /** Nombre visible de la division. */
  name: string;
  /** Precio por pareja, en pesos enteros. */
  priceMXN: number;
  description: string;
};

export const DIVISIONS: Record<Division, DivisionInfo> = {
  CM: {
    id: "CM",
    name: "Community",
    priceMXN: 2000,
    description: "Pesos escalados y movimientos accesibles. Para quien compite por primera vez.",
  },
  OP: {
    id: "OP",
    name: "Open",
    priceMXN: 2300,
    description: "Rx sin escalar. Para atletas con experiencia en competencia.",
  },
};

export const DIVISION_IDS = Object.keys(DIVISIONS) as Division[];

export function isDivision(value: unknown): value is Division {
  return typeof value === "string" && value in DIVISIONS;
}

/** El evento se cobra por pareja: un solo pago cubre a los dos atletas. */
export const ATHLETES_PER_TEAM = 2;

export const CURRENCY = "MXN";

export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type ShirtSize = (typeof SHIRT_SIZES)[number];

export function isShirtSize(value: unknown): value is ShirtSize {
  return typeof value === "string" && (SHIRT_SIZES as readonly string[]).includes(value);
}

export function formatMXN(amount: number): string {
  return amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Categoria del equipo por composicion de la pareja, tal como la ofrece el
 * Profile del prototipo.
 */
export const GENDERS = [
  { key: "MM", label: "Hombre / Hombre", icon: "♂♂" },
  { key: "MX", label: "Hombre / Mujer", icon: "♂♀" },
  { key: "FF", label: "Mujer / Mujer", icon: "♀♀" },
] as const;

export type TeamGender = (typeof GENDERS)[number]["key"];

export function isTeamGender(value: unknown): value is TeamGender {
  return typeof value === "string" && GENDERS.some((gender) => gender.key === value);
}

export function genderLabel(key: TeamGender): string {
  return GENDERS.find((gender) => gender.key === key)?.label ?? GENDERS[1].label;
}

/** Datos bancarios para quien prefiere transferir. */
export const BANK_DATA = [
  { label: "Banco", value: "BBVA Mexico" },
  { label: "Titular", value: "Tampico Hybrid Fest" },
  { label: "CLABE", value: "012 180 01234567890 5" },
  { label: "Cuenta", value: "0123456789" },
  { label: "Referencia", value: "THF2026" },
];

/** WhatsApp al que se manda el comprobante de transferencia. */
export const WHATSAPP_URL = "https://wa.me/528334305108";
