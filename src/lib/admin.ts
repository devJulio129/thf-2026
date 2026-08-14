import "server-only";

import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { safeEmblem, type EmblemSpec } from "./emblem";
import type { Division, TeamGender } from "./thf";

/**
 * Datos y permisos del panel de administracion.
 *
 * Regla: leer se hace con la sesion del staff (RLS ya deja ver todo a quien
 * tiene rol admin), y escribir pasa por el service role, pero SIEMPRE despues
 * de confirmar el rol con requireAdmin(). Nunca al reves.
 */

export type AdminTeam = {
  id: string;
  name: string;
  division: Division;
  gender: TeamGender;
  emblem: EmblemSpec;
  amountMXN: number;
  status: "awaiting_payment" | "paid";
  athletes: { name: string; email: string }[];
  createdAt: string;
  paidAt: string | null;
  /** Como se registro el pago, para distinguir Mercado Pago de una validacion manual. */
  paymentMethod: string | null;
};

export type Workout = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  isPublished: boolean;
  updatedAt: string;
};

/** Lanza si quien pide no es staff. Devuelve el id del usuario si lo es. */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Hay que iniciar sesion.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "staff") {
    throw new Error("Esta seccion es solo para el equipo THF.");
  }

  return user.id;
}

/** true si el usuario actual es staff, sin lanzar. */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export async function listTeams(): Promise<AdminTeam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(
      `id, name, division, gender, emblem, amount_mxn, status, created_at, paid_at,
       team_members ( name, email ),
       payments ( status, payment_method, processed_at )`,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los equipos: ${error.message}`);

  type Row = {
    id: string;
    name: string;
    division: Division;
    gender: TeamGender;
    emblem: unknown;
    amount_mxn: number;
    status: "awaiting_payment" | "paid";
    created_at: string;
    paid_at: string | null;
    team_members: { name: string; email: string }[] | null;
    payments: { status: string; payment_method: string | null; processed_at: string }[] | null;
  };

  return (data as Row[]).map((row) => {
    const approved = (row.payments ?? [])
      .filter((payment) => payment.status === "approved")
      .sort((a, b) => a.processed_at.localeCompare(b.processed_at))[0];

    return {
      id: row.id,
      name: row.name,
      division: row.division,
      gender: row.gender,
      emblem: safeEmblem(row.emblem),
      amountMXN: row.amount_mxn,
      status: row.status,
      athletes: row.team_members ?? [],
      createdAt: row.created_at,
      paidAt: row.paid_at,
      paymentMethod: approved?.payment_method ?? null,
    };
  });
}

export async function listWorkouts(): Promise<Workout[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("id, title, subtitle, content, is_published, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los workouts: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    isPublished: row.is_published,
    updatedAt: row.updated_at,
  }));
}

/** El workout publicado, para pintarlo en la landing. Null si no hay ninguno. */
export async function getPublishedWorkout(): Promise<Workout | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workouts")
    .select("id, title, subtitle, content, is_published, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    isPublished: data.is_published,
    updatedAt: data.updated_at,
  };
}

// ------------------------------------------------------------- escrituras --

/**
 * Marca un equipo como pagado a mano, para las transferencias bancarias.
 *
 * Queda registrado como un pago mas, con metodo "transferencia" y un id
 * propio, para que el historial no mienta sobre como entro el dinero.
 */
export async function markTeamPaidManually(teamId: string, staffId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: team, error: teamError } = await admin
    .from("teams")
    .select("id, amount_mxn, status")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) throw new Error(teamError.message);
  if (!team) throw new Error("Ese equipo ya no existe.");
  if (team.status === "paid") return;

  const now = new Date().toISOString();

  const { error: paymentError } = await admin.from("payments").insert({
    id: `manual-${teamId}`,
    team_id: teamId,
    status: "approved",
    status_detail: `validado_por_staff:${staffId}`,
    amount_mxn: team.amount_mxn,
    payment_method: "transferencia",
    processed_at: now,
  });

  if (paymentError) throw new Error(`No se pudo registrar el pago: ${paymentError.message}`);

  const { error: updateError } = await admin
    .from("teams")
    .update({ status: "paid", paid_at: now })
    .eq("id", teamId);

  if (updateError) throw new Error(`No se pudo actualizar el equipo: ${updateError.message}`);
}

/**
 * Revierte una validacion manual.
 *
 * Solo aplica a pagos que registro el staff: un cobro de Mercado Pago no se
 * deshace desde aqui, porque el dinero si entro y hay que devolverlo por el
 * panel de MP.
 */
export async function undoManualPayment(teamId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: manual } = await admin
    .from("payments")
    .select("id")
    .eq("id", `manual-${teamId}`)
    .maybeSingle();

  if (!manual) {
    throw new Error(
      "Este equipo pagó por Mercado Pago. El reembolso se hace desde el panel de Mercado Pago.",
    );
  }

  await admin.from("payments").delete().eq("id", `manual-${teamId}`);

  // Puede quedar otro pago aprobado (por ejemplo uno de MP); solo se vuelve a
  // pendiente si ya no queda ninguno que cubra el monto.
  const { data: team } = await admin
    .from("teams")
    .select("amount_mxn")
    .eq("id", teamId)
    .maybeSingle();

  const { data: remaining } = await admin
    .from("payments")
    .select("id")
    .eq("team_id", teamId)
    .eq("status", "approved")
    .gte("amount_mxn", team?.amount_mxn ?? 0);

  if (!remaining?.length) {
    await admin.from("teams").update({ status: "awaiting_payment", paid_at: null }).eq("id", teamId);
  }
}

export type WorkoutInput = {
  title: string;
  subtitle: string;
  content: string;
  isPublished: boolean;
};

export async function saveWorkout(id: string | null, input: WorkoutInput): Promise<void> {
  const admin = createAdminClient();
  const payload = {
    title: input.title,
    subtitle: input.subtitle,
    content: input.content,
    is_published: input.isPublished,
  };

  const { error } = id
    ? await admin.from("workouts").update(payload).eq("id", id)
    : await admin.from("workouts").insert(payload);

  if (error) throw new Error(`No se pudo guardar el workout: ${error.message}`);
}

export async function setWorkoutPublished(id: string, published: boolean): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("workouts").update({ is_published: published }).eq("id", id);
  if (error) throw new Error(`No se pudo cambiar la publicacion: ${error.message}`);
}

export async function deleteWorkout(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("workouts").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar el workout: ${error.message}`);
}
