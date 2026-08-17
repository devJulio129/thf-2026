"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

/** Ruta a la que volver despues de entrar, validada para evitar open redirect. */
function safeNext(formData: FormData): string {
  const next = String(formData.get("next") ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/perfil";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: "Faltan el correo o la contrasena." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Mensaje generico a proposito: distinguir "no existe" de "contrasena mal"
    // le regala a cualquiera una lista de correos registrados.
    return { error: "Correo o contrasena incorrectos." };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (displayName.length < 2) return { error: "Escribe tu nombre." };
  if (!email) return { error: "Falta el correo." };
  // 8 como minimo, alineado con la politica del proyecto de Supabase. Las
  // cuentas que se registraron con menos siguen entrando: esto solo aplica a
  // contrasenas nuevas.
  if (password.length < 8) return { error: "La contrasena necesita al menos 8 caracteres." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) return { error: error.message };

  // Con confirmacion de correo activada no hay sesion todavia: el atleta tiene
  // que abrir el enlace que le llega.
  if (!data.session) {
    return { error: "Te mandamos un correo para confirmar tu cuenta. Abrelo y vuelve a entrar." };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
