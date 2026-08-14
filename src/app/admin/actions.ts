"use server";

import { revalidatePath } from "next/cache";

import {
  deleteWorkout,
  markTeamPaidManually,
  requireAdmin,
  saveWorkout,
  setWorkoutPublished,
  undoManualPayment,
} from "@/lib/admin";

export type AdminState = { error: string | null; ok?: boolean };

/**
 * Todas las acciones del panel empiezan por requireAdmin(): sin ese candado,
 * cualquiera que descubriera el nombre de la accion podria invocarla, porque
 * las server actions son endpoints como cualquier otro.
 */

function fail(error: unknown): AdminState {
  return { error: error instanceof Error ? error.message : "Algo salió mal." };
}

export async function saveWorkoutAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "").trim() || null;
    const title = String(formData.get("title") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const isPublished = formData.get("isPublished") === "on";

    if (title.length < 2) return { error: "El título es muy corto." };
    if (content.length < 2) return { error: "Escribe el contenido del workout." };

    await saveWorkout(id, { title, subtitle, content, isPublished });
  } catch (error) {
    return fail(error);
  }

  revalidatePath("/admin");
  // La landing muestra el workout publicado.
  revalidatePath("/");
  return { error: null, ok: true };
}

export async function toggleWorkoutAction(id: string, published: boolean): Promise<void> {
  await requireAdmin();
  await setWorkoutPublished(id, published);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteWorkoutAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteWorkout(id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function markPaidAction(teamId: string): Promise<void> {
  const staffId = await requireAdmin();
  await markTeamPaidManually(teamId, staffId);
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
}

export async function undoPaidAction(teamId: string): Promise<void> {
  await requireAdmin();
  await undoManualPayment(teamId);
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
}
