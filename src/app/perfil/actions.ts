"use server";

import { revalidatePath } from "next/cache";

import { safeEmblem } from "@/lib/emblem";
import { createTeam, deleteMyTeam, type Athlete } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { DIVISIONS, isDivision, isShirtSize, isTeamGender } from "@/lib/thf";

export type TeamFormState = { error: string | null };
export type ProfileFormState = { error: string | null; saved?: boolean };

/** Deja solo digitos; acepta "833 123 45 67" o "(833) 123-4567". */
function cleanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Crea el equipo. El formulario solo trae emblema, division, categoria y
 * nombre: los datos de los DOS atletas salen de "Datos personales" (profiles),
 * que es su unica fuente. Si falta algo, el error dice exactamente que.
 */
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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Hay que iniciar sesion." };

    const { data: row } = await supabase
      .from("profiles")
      .select(
        `display_name, city, birth_date, shirt_size, phone, emergency_phone,
         partner_name, partner_email, partner_city, partner_birth_date,
         partner_shirt_size, partner_phone, partner_emergency_phone`,
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!row) return { error: "No se pudo leer tu perfil." };

    const faltantes: string[] = [];
    if ((row.display_name ?? "").trim().length < 2) faltantes.push("tu nombre");
    if ((row.phone ?? "").length !== 10) faltantes.push("tu teléfono");
    if ((row.emergency_phone ?? "").length !== 10) faltantes.push("tu tel. de emergencia");
    if (!isShirtSize(row.shirt_size ?? "")) faltantes.push("tu talla");
    if ((row.partner_name ?? "").trim().length < 2) faltantes.push("el nombre de tu pareja");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.partner_email ?? "")) {
      faltantes.push("el correo de tu pareja");
    }
    if ((row.partner_phone ?? "").length !== 10) faltantes.push("el teléfono de tu pareja");
    if ((row.partner_emergency_phone ?? "").length !== 10) {
      faltantes.push("el tel. de emergencia de tu pareja");
    }
    if (!isShirtSize(row.partner_shirt_size ?? "")) faltantes.push("la talla de tu pareja");

    if (faltantes.length) {
      return {
        error: `Antes de crear el equipo completa en Datos personales: ${faltantes.join(", ")}.`,
      };
    }

    const athletes: Athlete[] = [
      {
        name: row.display_name.trim(),
        email: (user.email ?? "").toLowerCase(),
        shirtSize: row.shirt_size as Athlete["shirtSize"],
        city: row.city ?? "",
        birthDate: row.birth_date || null,
        phone: row.phone,
        emergencyPhone: row.emergency_phone,
      },
      {
        name: row.partner_name.trim(),
        email: row.partner_email.toLowerCase(),
        shirtSize: row.partner_shirt_size as Athlete["shirtSize"],
        city: row.partner_city ?? "",
        birthDate: row.partner_birth_date || null,
        phone: row.partner_phone,
        emergencyPhone: row.partner_emergency_phone,
      },
    ];

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

type EditedAthlete = {
  name: string;
  city: string;
  birthDate: string;
  shirtSize: string;
  phone: string;
  emergencyPhone: string;
};

/** Lee los campos de un atleta del formulario de datos personales. */
function readEditedAthlete(
  formData: FormData,
  prefix: string,
  who: string,
): EditedAthlete | { error: string } {
  const name = String(formData.get(`${prefix}-name`) ?? "").trim();
  const city = String(formData.get(`${prefix}-city`) ?? "").trim();
  const birthDate = String(formData.get(`${prefix}-birth`) ?? "").trim();
  const shirtSize = String(formData.get(`${prefix}-shirt`) ?? "");
  const phone = cleanPhone(String(formData.get(`${prefix}-phone`) ?? ""));
  const emergencyPhone = cleanPhone(String(formData.get(`${prefix}-emergency`) ?? ""));

  if (name.length < 2) return { error: `Escribe el nombre de ${who}.` };
  if (shirtSize && !isShirtSize(shirtSize)) return { error: `Talla invalida de ${who}.` };
  // Los telefonos son opcionales al editar, pero si vienen deben estar completos.
  if (phone && phone.length !== 10) {
    return { error: `El teléfono de ${who} debe tener 10 dígitos.` };
  }
  if (emergencyPhone && emergencyPhone.length !== 10) {
    return { error: `El teléfono de emergencia de ${who} debe tener 10 dígitos.` };
  }

  return { name, city, birthDate, shirtSize, phone, emergencyPhone };
}

/**
 * Datos personales de LOS DOS atletas, con un solo guardar.
 *
 * Los del atleta 1 viven en profiles; los dos tambien viven en team_members
 * si ya hay equipo, y se actualizan juntos para que el perfil y el equipo no
 * cuenten historias distintas. RLS solo deja tocar los integrantes del equipo
 * propio (el capitan), asi que aqui no hace falta mas candado.
 */
export async function saveProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const self = readEditedAthlete(formData, "athlete1", "atleta 1");
  if ("error" in self) return { error: self.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Hay que iniciar sesion." };

  // La pareja se guarda SIEMPRE en el perfil, haya equipo o no: es el borrador
  // del que se copia el alta del equipo. El nombre puede venir vacio mientras
  // el capitan consigue los datos.
  const partnerName = String(formData.get("athlete2-name") ?? "").trim();
  const partnerEmail = String(formData.get("athlete2-email") ?? "").trim().toLowerCase();
  const partnerCity = String(formData.get("athlete2-city") ?? "").trim();
  const partnerBirth = String(formData.get("athlete2-birth") ?? "").trim();
  const partnerShirt = String(formData.get("athlete2-shirt") ?? "");
  const partnerPhone = cleanPhone(String(formData.get("athlete2-phone") ?? ""));
  const partnerEmergency = cleanPhone(String(formData.get("athlete2-emergency") ?? ""));

  if (partnerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
    return { error: "El correo de tu pareja es invalido." };
  }
  if (partnerPhone && partnerPhone.length !== 10) {
    return { error: "El teléfono de tu pareja debe tener 10 dígitos." };
  }
  if (partnerEmergency && partnerEmergency.length !== 10) {
    return { error: "El teléfono de emergencia de tu pareja debe tener 10 dígitos." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: self.name,
      city: self.city,
      birth_date: self.birthDate || null,
      shirt_size: self.shirtSize || null,
      phone: self.phone,
      emergency_phone: self.emergencyPhone,
      partner_name: partnerName,
      partner_email: partnerEmail,
      partner_city: partnerCity,
      partner_birth_date: partnerBirth || null,
      partner_shirt_size: partnerShirt || null,
      partner_phone: partnerPhone,
      partner_emergency_phone: partnerEmergency,
    })
    .eq("id", user.id);

  if (error) return { error: `No se pudo guardar: ${error.message}` };

  // Si hay equipo, los datos viven tambien en team_members: se sincronizan
  // para que el perfil y el equipo no cuenten historias distintas.
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("captain_id", user.id)
    .maybeSingle();

  if (team) {
    const { data: members } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", team.id)
      .order("created_at");

    const updates: { id: string; datos: EditedAthlete; email?: string }[] = [];
    if (members?.[0]) updates.push({ id: members[0].id, datos: self });
    if (members?.[1] && partnerName) {
      updates.push({
        id: members[1].id,
        datos: {
          name: partnerName,
          city: partnerCity,
          birthDate: partnerBirth,
          shirtSize: partnerShirt,
          phone: partnerPhone,
          emergencyPhone: partnerEmergency,
        },
        email: partnerEmail || undefined,
      });
    }

    for (const { id, datos, email } of updates) {
      const { error: memberError } = await supabase
        .from("team_members")
        .update({
          name: datos.name,
          city: datos.city,
          birth_date: datos.birthDate || null,
          shirt_size: datos.shirtSize || "M",
          phone: datos.phone,
          emergency_phone: datos.emergencyPhone,
          ...(email ? { email } : {}),
        })
        .eq("id", id);

      if (memberError) return { error: `No se pudo guardar el equipo: ${memberError.message}` };
    }
  }

  revalidatePath("/perfil");
  return { error: null, saved: true };
}
