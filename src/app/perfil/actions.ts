"use server";

import { revalidatePath } from "next/cache";

import { safeEmblem } from "@/lib/emblem";
import { createTeam, deleteMyTeam, type Athlete } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import {
  ATHLETES_PER_TEAM,
  DIVISIONS,
  isDivision,
  isShirtSize,
  isTeamGender,
} from "@/lib/thf";

export type TeamFormState = { error: string | null };
export type ProfileFormState = { error: string | null; saved?: boolean };

/** Deja solo digitos; acepta "833 123 45 67" o "(833) 123-4567". */
function cleanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function readAthlete(formData: FormData, index: number): Athlete {
  const name = String(formData.get(`athlete-${index}-name`) ?? "").trim();
  const email = String(formData.get(`athlete-${index}-email`) ?? "").trim().toLowerCase();
  const shirtSize = String(formData.get(`athlete-${index}-shirt`) ?? "");
  const city = String(formData.get(`athlete-${index}-city`) ?? "").trim();
  const birthDate = String(formData.get(`athlete-${index}-birth`) ?? "").trim();
  const phone = cleanPhone(String(formData.get(`athlete-${index}-phone`) ?? ""));
  const emergencyPhone = cleanPhone(
    String(formData.get(`athlete-${index}-emergency`) ?? ""),
  );

  if (name.length < 2) throw new Error(`Falta el nombre del atleta ${index + 1}.`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`El correo del atleta ${index + 1} es invalido.`);
  }
  if (!isShirtSize(shirtSize)) throw new Error(`Falta la talla del atleta ${index + 1}.`);
  if (phone.length !== 10) {
    throw new Error(`El teléfono del atleta ${index + 1} debe tener 10 dígitos.`);
  }
  if (emergencyPhone.length !== 10) {
    throw new Error(
      `El teléfono de emergencia del atleta ${index + 1} debe tener 10 dígitos.`,
    );
  }

  return { name, email, shirtSize, city, birthDate: birthDate || null, phone, emergencyPhone };
}

export async function createTeamAction(
  _prev: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  try {
    const name = String(formData.get("teamName") ?? "").trim();
    if (name.length < 2) return { error: "El nombre del equipo es muy corto." };

    const division = String(formData.get("division") ?? "");
    if (!isDivision(division)) return { error: "Elige una division." };

    const gender = String(formData.get("gender") ?? "");
    if (!isTeamGender(gender)) return { error: "Elige la categoria del equipo." };

    const athletes = Array.from({ length: ATHLETES_PER_TEAM }, (_, index) =>
      readAthlete(formData, index),
    );

    let emblem;
    try {
      emblem = safeEmblem(JSON.parse(String(formData.get("emblem") ?? "{}")));
    } catch {
      return { error: "El emblema llego corrupto. Vuelve a intentar." };
    }

    await createTeam({
      name,
      division,
      gender,
      emblem,
      // El precio sale del catalogo del servidor, no del formulario.
      amountMXN: DIVISIONS[division].priceMXN,
      athletes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el equipo.";
    // El indice unico de captain_id es la red de seguridad contra el doble submit.
    if (message.includes("teams_captain_unique")) {
      return { error: "Ya tienes un equipo registrado." };
    }
    return { error: message };
  }

  revalidatePath("/perfil");
  return { error: null };
}

export async function deleteTeamAction(): Promise<void> {
  await deleteMyTeam();
  revalidatePath("/perfil");
}

export type DivisionChangeState = { error: string | null };

/**
 * Cambia la division del equipo mientras no se haya pagado.
 *
 * No manda el precio: el trigger apply_division_price lo recalcula desde la
 * tabla de precios. Si el equipo ya esta pagado, RLS rechaza el update.
 */
export async function changeDivisionAction(
  _prev: DivisionChangeState,
  formData: FormData,
): Promise<DivisionChangeState> {
  const division = String(formData.get("division") ?? "");
  if (!isDivision(division)) return { error: "Division invalida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Hay que iniciar sesion." };

  const { data, error } = await supabase
    .from("teams")
    .update({ division })
    .eq("captain_id", user.id)
    .eq("status", "awaiting_payment")
    .select("id");

  if (error) return { error: `No se pudo cambiar la categoria: ${error.message}` };
  if (!data?.length) {
    return { error: "No se puede cambiar la categoria de un equipo ya pagado." };
  }

  revalidatePath("/perfil");
  return { error: null };
}

/** Datos personales del atleta que inicio sesion. */
export async function saveProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const shirtSize = String(formData.get("shirtSize") ?? "");

  if (displayName.length < 2) return { error: "Escribe tu nombre." };
  if (shirtSize && !isShirtSize(shirtSize)) return { error: "Talla invalida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Hay que iniciar sesion." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      city,
      birth_date: birthDate || null,
      shirt_size: shirtSize || null,
    })
    .eq("id", user.id);

  if (error) return { error: `No se pudo guardar: ${error.message}` };

  revalidatePath("/perfil");
  return { error: null, saved: true };
}
