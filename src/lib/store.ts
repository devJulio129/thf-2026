import "server-only";

import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import type { Division, ShirtSize, TeamGender } from "./thf";

/**
 * Acceso a equipos y pagos.
 *
 * Dos caminos, a proposito:
 *  - Lo que hace el atleta (crear su equipo, verlo) usa el cliente con su
 *    sesion, y por lo tanto pasa por RLS.
 *  - Lo que hace el webhook usa el cliente admin, porque confirma pagos sin
 *    actuar en nombre de nadie. Es el unico lugar que se salta RLS.
 */

export type TeamStatus = "awaiting_payment" | "paid";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export type Athlete = {
  name: string;
  email: string;
  shirtSize: ShirtSize;
  city: string;
  birthDate: string | null;
  phone: string;
  emergencyPhone: string;
};

export type Emblem = {
  plate: string;
  pattern: string;
  icon: string;
  colorPlate: string;
  colorPattern: string;
  colorIcon: string;
  iconScale: number;
  patternRotation: number;
};

export type PaymentRecord = {
  id: string;
  status: PaymentStatus;
  statusDetail: string | null;
  amountMXN: number;
  paymentMethod: string | null;
  processedAt: string;
};

export type Team = {
  id: string;
  name: string;
  division: Division;
  gender: TeamGender;
  captainId: string;
  emblem: Emblem;
  amountMXN: number;
  status: TeamStatus;
  preferenceId: string | null;
  paidAt: string | null;
  createdAt: string;
  athletes: Athlete[];
  payments: PaymentRecord[];
};

type TeamRow = {
  id: string;
  name: string;
  division: Division;
  gender: TeamGender;
  captain_id: string;
  emblem: Emblem;
  amount_mxn: number;
  status: TeamStatus;
  preference_id: string | null;
  paid_at: string | null;
  created_at: string;
  team_members?: {
    name: string;
    email: string;
    shirt_size: ShirtSize;
    city: string;
    birth_date: string | null;
    phone: string;
    emergency_phone: string;
  }[] | null;
  payments?:
    | {
        id: string;
        status: PaymentStatus;
        status_detail: string | null;
        amount_mxn: number | string;
        payment_method: string | null;
        processed_at: string;
      }[]
    | null;
};

const TEAM_SELECT = `
  id, name, division, gender, captain_id, emblem, amount_mxn, status,
  preference_id, paid_at, created_at,
  team_members ( name, email, shirt_size, city, birth_date, phone, emergency_phone ),
  payments ( id, status, status_detail, amount_mxn, payment_method, processed_at )
`;

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    division: row.division,
    gender: row.gender,
    captainId: row.captain_id,
    emblem: row.emblem,
    amountMXN: row.amount_mxn,
    status: row.status,
    preferenceId: row.preference_id,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    athletes: (row.team_members ?? []).map((member) => ({
      name: member.name,
      email: member.email,
      shirtSize: member.shirt_size,
      city: member.city,
      birthDate: member.birth_date,
      phone: member.phone,
      emergencyPhone: member.emergency_phone,
    })),
    payments: (row.payments ?? [])
      .map((payment) => ({
        id: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        amountMXN: Number(payment.amount_mxn),
        paymentMethod: payment.payment_method,
        processedAt: payment.processed_at,
      }))
      .sort((a, b) => a.processedAt.localeCompare(b.processedAt)),
  };
}

// ------------------------------------------------------------ lectura RLS --

/** Equipo del atleta logueado, o null si todavia no arma uno. */
export async function getMyTeam(): Promise<Team | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_SELECT)
    .eq("captain_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el equipo: ${error.message}`);
  return data ? toTeam(data as TeamRow) : null;
}

export async function getTeam(id: string): Promise<Team | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el equipo: ${error.message}`);
  return data ? toTeam(data as TeamRow) : null;
}

// ---------------------------------------------------------------- escritura --

export type CreateTeamInput = {
  name: string;
  division: Division;
  gender: TeamGender;
  emblem: Emblem;
  amountMXN: number;
  athletes: Athlete[];
};

/**
 * Crea el equipo del atleta logueado. RLS se encarga de que captain_id tenga
 * que ser el propio usuario y de que nazca sin pagar.
 */
export async function createTeam(input: CreateTeamInput): Promise<Team> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Hay que iniciar sesion para crear un equipo.");

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name: input.name,
      division: input.division,
      gender: input.gender,
      captain_id: user.id,
      emblem: input.emblem,
      amount_mxn: input.amountMXN,
    })
    .select("id")
    .single();

  if (error) throw new Error(`No se pudo crear el equipo: ${error.message}`);

  const { error: membersError } = await supabase.from("team_members").insert(
    input.athletes.map((athlete) => ({
      team_id: team.id,
      name: athlete.name,
      email: athlete.email,
      shirt_size: athlete.shirtSize,
      city: athlete.city,
      birth_date: athlete.birthDate,
      phone: athlete.phone,
      emergency_phone: athlete.emergencyPhone,
    })),
  );

  if (membersError) {
    // Sin los integrantes el equipo no sirve; lo quitamos para no dejar basura.
    await supabase.from("teams").delete().eq("id", team.id);
    throw new Error(`No se pudieron guardar los atletas: ${membersError.message}`);
  }

  const created = await getTeam(team.id);
  if (!created) throw new Error("El equipo se creo pero no se pudo leer de vuelta.");
  return created;
}

export async function deleteMyTeam(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Hay que iniciar sesion.");

  // RLS ya impide borrar un equipo pagado; esto solo da un mensaje decente.
  const { error } = await supabase.from("teams").delete().eq("captain_id", user.id);
  if (error) throw new Error(`No se pudo eliminar el equipo: ${error.message}`);
}

/**
 * Vuelve a calcular el monto del equipo con la fase de precios vigente.
 *
 * Se llama justo antes de crear la preference porque el precio se fija al
 * momento de pagar, no al armar el equipo: si no, se podria apartar precio de
 * Founders y pagar meses despues, ya en otra fase.
 *
 * El trigger teams_apply_division_price repone amount_mxn desde price_phases,
 * asi que el valor que mandamos aqui no decide nada — solo hace que la columna
 * entre en el UPDATE y el trigger se dispare.
 */
export async function refreshTeamPrice(teamId: string, currentAmount: number): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .update({ amount_mxn: currentAmount })
    .eq("id", teamId)
    .select("amount_mxn")
    .single();

  if (error) throw new Error(`No se pudo recalcular el precio: ${error.message}`);
  return data.amount_mxn as number;
}

export async function attachPreference(teamId: string, preferenceId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({ preference_id: preferenceId })
    .eq("id", teamId);

  if (error) throw new Error(`No se pudo guardar la preference: ${error.message}`);
}

// ------------------------------------------------- webhook (service role) --

export type RecordPaymentResult =
  | { outcome: "applied"; status: TeamStatus }
  | { outcome: "duplicate"; status: TeamStatus }
  | { outcome: "unknown_team" };

/**
 * Aplica el resultado de un pago. Solo lo llama el webhook.
 *
 * Idempotente: payments.id es la llave primaria y hacemos upsert, asi que las
 * notificaciones repetidas de Mercado Pago no duplican nada.
 */
export async function recordPayment(
  teamId: string,
  payment: PaymentRecord,
  raw?: unknown,
): Promise<RecordPaymentResult> {
  const admin = createAdminClient();

  const { data: team, error: teamError } = await admin
    .from("teams")
    .select("id, amount_mxn, status, paid_at")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) throw new Error(`No se pudo leer el equipo: ${teamError.message}`);
  if (!team) return { outcome: "unknown_team" };

  const { data: previous } = await admin
    .from("payments")
    .select("status")
    .eq("id", payment.id)
    .maybeSingle();

  const isDuplicate = previous?.status === payment.status;

  const { error: upsertError } = await admin.from("payments").upsert({
    id: payment.id,
    team_id: teamId,
    status: payment.status,
    status_detail: payment.statusDetail,
    amount_mxn: payment.amountMXN,
    payment_method: payment.paymentMethod,
    processed_at: payment.processedAt,
    raw: raw ?? null,
  });

  if (upsertError) throw new Error(`No se pudo guardar el pago: ${upsertError.message}`);

  if (isDuplicate) {
    return { outcome: "duplicate", status: team.status as TeamStatus };
  }

  // El equipo queda pagado solo si existe un pago aprobado que cubre el monto
  // completo. Nada de pagos parciales.
  const { data: approved, error: approvedError } = await admin
    .from("payments")
    .select("processed_at, amount_mxn")
    .eq("team_id", teamId)
    .eq("status", "approved")
    .gte("amount_mxn", team.amount_mxn)
    .order("processed_at", { ascending: true })
    .limit(1);

  if (approvedError) throw new Error(`No se pudieron revisar los pagos: ${approvedError.message}`);

  const settled = approved?.[0];
  const nextStatus: TeamStatus = settled ? "paid" : "awaiting_payment";

  const { error: updateError } = await admin
    .from("teams")
    .update({
      status: nextStatus,
      paid_at: settled ? (team.paid_at ?? settled.processed_at) : null,
    })
    .eq("id", teamId);

  if (updateError) throw new Error(`No se pudo actualizar el equipo: ${updateError.message}`);

  return { outcome: "applied", status: nextStatus };
}
