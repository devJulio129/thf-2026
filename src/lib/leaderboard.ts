import { createClient } from "./supabase/server";
import { safeEmblem, type EmblemSpec } from "./emblem";
import type { Division } from "./thf";

/**
 * Lectura del leaderboard publico.
 *
 * Sale de la vista public_leaderboard, que solo trae equipos con el pago
 * confirmado y solo los campos que se muestran en pantalla.
 */

export type LeaderboardTeam = {
  id: string;
  name: string;
  division: Division;
  emblem: EmblemSpec;
  city: string;
  athletes: string[];
  registered: string;
};

type Row = {
  id: string;
  name: string;
  division: Division;
  emblem: unknown;
  paid_at: string | null;
  members: { name: string; city: string }[] | null;
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function getLeaderboard(): Promise<LeaderboardTeam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_leaderboard")
    .select("id, name, division, emblem, paid_at, members")
    .order("paid_at", { ascending: true });

  if (error) throw new Error(`No se pudo leer el leaderboard: ${error.message}`);

  return (data as Row[]).map((row) => {
    const members = row.members ?? [];
    return {
      id: row.id,
      name: row.name,
      division: row.division,
      emblem: safeEmblem(row.emblem),
      // La ciudad del equipo es la del primer atleta que la haya puesto.
      city: members.find((member) => member.city)?.city ?? "—",
      athletes: members.map((member) => member.name),
      registered: row.paid_at ? dateFormatter.format(new Date(row.paid_at)) : "—",
    };
  });
}
