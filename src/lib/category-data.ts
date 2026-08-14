/**
 * Contenido de las paginas de categoria, portado de
 * Tampico Hybrid Fest - Community.dc.html y - Open.dc.html.
 *
 * Las dos paginas comparten estructura (hero, datos rapidos, que incluye, las
 * estaciones y el cierre) y se diferencian en el contenido y en como se monta
 * la foto del hero. Open ademas suma la seccion de los dos dias.
 */

import type { Division } from "./thf";

export type Fact = { icon: string; label: string; value: string };
export type Station = { n: string; title: string; desc: string };
export type EventDay = { tag: string; title: string; desc: string; bullets: string[] };

export type CategoryContent = {
  division: Division;
  /** Lo que va en la barra superior. */
  headerLabel: string;
  /** Enlace a la otra categoria, tal como en el prototipo. */
  otherLabel: string;
  otherHref: string;

  badgeIcon: string;
  badgeText: string;
  /** El h1 se arma en dos lineas; la segunda va en naranja. */
  titleTop: string;
  titleBottom: string;
  /** Layout del hero: Community pone la foto en un panel lateral, Open la usa de fondo. */
  heroLayout: "side" | "full";
  heroImage: string;
  heroPosition: string;

  ctaPrimary: string;
  facts: Fact[];
  includes: string[];
  stationsTitle: string;
  stations: Station[];
  days: EventDay[];

  closingIcon: string;
  closingTop: string;
  closingBottom: string;
  closingNote: string;
  closingPrimary: string;
  closingSecondary: string;
};

const SHARED_STATIONS_NOTE =
  "* Estaciones referenciales. Movimientos exactos y orden se anuncian la semana del evento.";

export const STATIONS_NOTE = SHARED_STATIONS_NOTE;

export const CATEGORY_CONTENT: Record<Division, CategoryContent> = {
  CM: {
    division: "CM",
    headerLabel: "Categoría · Community",
    otherLabel: "Open →",
    otherHref: "/open",

    badgeIcon: "♥",
    badgeText: "Para vivir la experiencia",
    titleTop: "Community.",
    titleBottom: "Un día.",
    heroLayout: "side",
    heroImage: "/assets/p-runners.jpg",
    heroPosition: "50% 12%",

    ctaPrimary: "Inscribirme a Community →",
    facts: [
      { icon: "📅", label: "Día de competencia", value: "Sábado 14 Nov" },
      { icon: "📍", label: "Sede", value: "La Velaria · Recinto Ferial" },
      { icon: "👥", label: "Modalidad", value: "Parejas · relevos libres" },
      { icon: "🎟", label: "Inscripción", value: "$2,000 MXN por pareja" },
    ],
    includes: [
      "Hybrid Race del sábado 14, con cargas Community",
      "Playera dry fit oficial para cada atleta",
      "Medalla finisher para los dos integrantes",
      "Mochila deportiva del evento",
      "Parche, pulseras y calcetas THF",
      "Gafete de atleta con acceso a la sede",
      "Hidratación durante la competencia",
      "Kit Founder Edition para las primeras 50 parejas",
    ],
    stationsTitle: "9 estaciones. Un solo flujo.",
    stations: [
      { n: "01", title: "800 m run", desc: "Arranque en pista. El ritmo lo reparten entre los dos." },
      { n: "02", title: "60 burpees over log", desc: "60 repeticiones, relevo libre entre los dos atletas." },
      { n: "03", title: "800 m run", desc: "Segunda vuelta, ya con las piernas cargadas." },
      { n: "04", title: "200 m walking lunges", desc: "200 metros de zancada, sin carga." },
      { n: "05", title: "800 m run", desc: "Tercer bloque de carrera antes de la fuerza." },
      { n: "06", title: "300 m farmer carry", desc: "300 metros con kettlebells de 35 lb." },
      { n: "07", title: "800 m run", desc: "Última vuelta completa del recorrido." },
      { n: "08", title: "1000 m row", desc: "Remo sostenido hasta completar los 1000 metros." },
      { n: "09", title: "80 wall ball shots", desc: "80 repeticiones para cerrar y cruzar la meta." },
    ],
    days: [],

    closingIcon: "🔥",
    closingTop: "Nos vemos en",
    closingBottom: "la salida.",
    closingNote: "Cupos limitados por categoría. Asegura el tuyo.",
    closingPrimary: "Inscribirme ahora →",
    closingSecondary: "🏆 Conocer Open",
  },

  OP: {
    division: "OP",
    headerLabel: "Categoría · Open",
    otherLabel: "← Community",
    otherHref: "/community",

    badgeIcon: "🏆",
    badgeText: "Categoría élite · Por el podio",
    titleTop: "Open.",
    titleBottom: "Dos días.",
    heroLayout: "full",
    heroImage: "/assets/p-row.jpg",
    heroPosition: "62% 44%",

    ctaPrimary: "Competir en Open →",
    facts: [
      { icon: "📅", label: "Días de competencia", value: "Sábado 14 & domingo 15" },
      { icon: "📍", label: "Sede", value: "La Velaria · Recinto Ferial" },
      { icon: "🎯", label: "Modalidad", value: "Parejas · por el ranking" },
      { icon: "🎟", label: "Inscripción", value: "$2,300 MXN por pareja" },
    ],
    includes: [
      "Acceso a las dos jornadas: sábado 14 y domingo 15",
      "Hybrid Race con cargas y volumen Open",
      "Zone Challenge del domingo (100 min · 6 zonas)",
      "Playera dry fit oficial para cada atleta",
      "Medalla finisher y premiación a podio",
      "Mochila deportiva del evento",
      "Parche, pulseras y calcetas THF",
      "Gafete de atleta con acceso a la sede",
      "Puntos para el Ranking THF y el título The Fittest",
      "Kit Founder Edition para las primeras 50 parejas",
    ],
    stationsTitle: "9 estaciones. Un solo flujo.",
    stations: [
      { n: "01", title: "800 m run", desc: "Arranque en pista. El ritmo lo reparten entre los dos." },
      { n: "02", title: "80 burpees over log", desc: "80 repeticiones, relevo libre entre los dos atletas." },
      { n: "03", title: "800 m run", desc: "Segunda vuelta, ya con las piernas cargadas." },
      { n: "04", title: "200 m walking lunges", desc: "200 metros de zancada cargando sandbag." },
      { n: "05", title: "800 m run", desc: "Tercer bloque de carrera antes de la fuerza." },
      { n: "06", title: "300 m farmer carry", desc: "300 metros con kettlebells de 54 lb." },
      { n: "07", title: "800 m run", desc: "Última vuelta completa del recorrido." },
      { n: "08", title: "1000 m row", desc: "Remo sostenido hasta completar los 1000 metros." },
      { n: "09", title: "100 wall ball shots", desc: "100 repeticiones para cerrar y cruzar la meta." },
    ],
    days: [
      {
        tag: "Día 1",
        title: "Sábado · Hybrid Race",
        desc: "La misma ruta de nueve estaciones que Community, pero con cargas y volumen Open. Aquí se define el ranking del fin de semana.",
        bullets: ["Cargas Open", "Relevos libres", "Ranking general"],
      },
      {
        tag: "Día 2",
        title: "Domingo · Zone Challenge",
        desc: "Cien minutos en seis zonas enlazadas, con heats cada 20 minutos y ventanas estrictas de trabajo y recuperación. Tres de las seis zonas suman puntos.",
        bullets: ["100 minutos", "6 zonas · 3 puntúan", "Heats cada 20 min"],
      },
    ],

    closingIcon: "🏋️",
    closingTop: "¿Tienes lo",
    closingBottom: "que se necesita?",
    closingNote: "Cupos muy limitados. La inscripción cierra cuando se llena el bracket.",
    closingPrimary: "Inscribirme a Open →",
    closingSecondary: "🔥 Ver Community",
  },
};
