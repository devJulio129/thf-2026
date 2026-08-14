/**
 * Contenido de la Landing, portado tal cual del prototipo
 * (Tampico Hybrid Fest - Landing.dc.html).
 *
 * Los textos son los del diseno original. Cuando el Admin publique WODs de
 * verdad, WODS se reemplaza por la consulta a la base; el resto es copy fijo.
 */

export const EVENT_DATE = "2026-11-14T07:00:00-06:00";

export type Wod = {
  title: string;
  blocks: string[];
  note: string;
};

/** Un WOD por dia de la semana, empezando en domingo (getDay() === 0). */
export const WODS: Wod[] = [
  {
    title: "Domingo · Recuperación activa",
    blocks: [
      "30 min de trote suave o caminata en pendiente",
      "10 min movilidad de cadera y tobillo",
      "2 rondas: 60 s plancha + 60 s respiración nasal",
    ],
    note: "Día de reconstruir. Nada al límite: el lunes se vuelve a cargar.",
  },
  {
    title: "Lunes · Engine base",
    blocks: [
      "3 rondas: 800 m run + 60 s descanso",
      "Luego 1000 m row a ritmo objetivo de carrera",
      "Cierre: 40 wall balls en el menor tiempo posible",
    ],
    note: "Ritmo sostenible, no sprint. Anota los tiempos para comparar la próxima semana.",
  },
  {
    title: "Martes · Fuerza y carga",
    blocks: [
      "5x5 back squat, subiendo peso cada serie",
      "4 rondas: 100 m farmer carry (KBs 35/54 lb) + 10 burpees",
      "Accesorio: 3x12 remo con mancuerna por lado",
    ],
    note: "Aquí se entrena la carga del farmer carry de la Hybrid Race.",
  },
  {
    title: "Miércoles · Intervalos híbridos",
    blocks: [
      "6x400 m run, descanso 90 s",
      "Entre cada serie: 20 walking lunges",
      "Cierre: 500 m row all out",
    ],
    note: "Simula el cambio de pierna a máquina que exige el recorrido.",
  },
  {
    title: "Jueves · Técnica bajo fatiga",
    blocks: [
      "EMOM 12 min: 8 burpees over log (o over bar)",
      "3 rondas: 200 m lunges con sandbag + 250 m row",
      "Movilidad de hombro 8 min",
    ],
    note: "Prioriza el estándar del movimiento sobre la velocidad.",
  },
  {
    title: "Viernes · Simulación de relevo",
    blocks: [
      "En pareja: 3 rondas de 800 m run alternando 400 m cada uno",
      "60 burpees over log repartidos libremente",
      "80 wall ball shots en relevo",
    ],
    note: "Practiquen los cambios: el relevo mal calculado cuesta más que el peso.",
  },
  {
    title: "Sábado · Test largo",
    blocks: [
      "Recorrido corto: 800 m run + 30 burpees + 800 m run",
      "100 m farmer carry + 500 m row",
      "40 wall balls para cerrar",
    ],
    note: "Mide tu tiempo de referencia. Es tu marca antes de La Velaria.",
  },
];

export const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/**
 * Enlaces del menu. Las paginas ya migradas apuntan a su ruta de Next; las que
 * siguen en prototipo apuntan a /prototipo y se iran cambiando conforme se
 * migren.
 */
export const NAV_LINKS = [
  { label: "El evento", href: "#evento" },
  { label: "Categorías", href: "#categorias" },
  { label: "Experiencia", href: "#experiencia" },
  { label: "Sede", href: "#sede" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "THF Game", href: "/prototipo/Tampico Hybrid Fest - THF Game.dc.html" },
];

export const ROUTES = {
  quiz: "/quiz",
  game: "/prototipo/Tampico Hybrid Fest - THF Game.dc.html",
  leaderboard: "/leaderboard",
  community: "/community",
  open: "/open",
  sponsors: "/prototipo/Tampico Hybrid Fest - Sponsors.dc.html",
  // Estas dos ya son de verdad.
  portal: "/login",
  perfil: "/perfil",
};

export const MARQUEE_WORDS = [
  "FUERZA",
  "ENGINE",
  "VELOCIDAD",
  "CONTROL",
  "COMUNIDAD",
  "COMPITE",
];

export const TRAITS = [
  {
    n: "01",
    label: "Fuerza",
    body: "Carga, empuja, levanta. La fuerza deja de ser una cifra aislada y entra en contexto.",
  },
  {
    n: "02",
    label: "Motor",
    body: "Corre, rema, acelera. Tu capacidad de sostener trabajo importa cuando el reloj sigue corriendo.",
  },
  {
    n: "03",
    label: "Control",
    body: "Decidir cuándo atacar también es competir. Técnica, estrategia y cabeza bajo presión.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Encuentra tu categoría",
    body: "Responde el quiz y entra al formato que mejor corresponde a tu experiencia competitiva.",
  },
  {
    n: "02",
    title: "Registra tu participación",
    body: "Tu perfil y registro se convierten en la base de tu experiencia dentro de esta edición.",
  },
  {
    n: "03",
    title: "Recibe tu programación",
    body: "Consulta tus pruebas, heat, lane y horarios desde el portal del atleta.",
  },
  {
    n: "04",
    title: "Compite y sigue el ranking",
    body: "Tus scores oficiales alimentan resultados y leaderboard durante la competencia.",
  },
];

export const APP_FEATURES = ["Programación", "Mi próximo heat", "Scores", "Leaderboard"];

export const APP_AGENDA = [
  { time: "07:30", title: "Registro y kits", meta: "Zona de atletas", tone: "rgba(255,255,255,.3)" },
  { time: "08:45", title: "Briefing general", meta: "Arco de salida", tone: "rgba(255,255,255,.3)" },
  { time: "09:40", title: "Hybrid Race · Heat 4", meta: "Tu heat · Lane 07", tone: "#f45a0b" },
  { time: "11:20", title: "Hybrid Race · Heat 8", meta: "Community", tone: "rgba(255,255,255,.3)" },
  { time: "13:00", title: "Corte de resultados", meta: "Ranking parcial", tone: "rgba(255,255,255,.3)" },
];

export const APP_BOARD = [
  { rank: "01", team: "Fuerza Bruta", athletes: "Ana P. · Luis M.", pts: "612", me: false },
  { rank: "02", team: "Los Tiburones", athletes: "Sofía R. · Iván C.", pts: "598", me: false },
  { rank: "03", team: "Nómadas", athletes: "Paty G. · Beto L.", pts: "571", me: false },
  { rank: "04", team: "Alacranes", athletes: "Karla M. · Diego R.", pts: "544", me: true },
  { rank: "05", team: "Huasteca Fit", athletes: "Lupita S. · Raúl T.", pts: "530", me: false },
  { rank: "06", team: "Marea Alta", athletes: "Dani V. · Omar N.", pts: "517", me: false },
].map((row) => ({
  ...row,
  border: row.me ? "rgba(244,90,11,.5)" : "rgba(255,255,255,.1)",
  bg: row.me ? "rgba(244,90,11,.12)" : "rgba(255,255,255,.02)",
  rankColor: row.me ? "#f45a0b" : "rgba(255,255,255,.4)",
}));
