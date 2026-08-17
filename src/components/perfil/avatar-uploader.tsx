"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/**
 * La foto del atleta en la tarjeta del perfil.
 *
 * Sube la imagen al bucket "avatars" (cada quien solo puede escribir en su
 * carpeta, lo garantiza Storage con RLS) y guarda la URL publica en
 * profiles.avatar_url. Mientras no haya foto se muestra la inicial sobre el
 * degradado naranja, igual que antes.
 */
export function AvatarUploader({
  userId,
  avatarUrl,
  initial,
}: {
  userId: string;
  avatarUrl: string | null;
  initial: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Elige una imagen (JPG, PNG o WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen pesa más de 5 MB.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      // Ruta fija por usuario: subir de nuevo reemplaza la anterior.
      const path = `${userId}/avatar`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // El sufijo evita que el navegador siga mostrando la foto vieja cacheada.
      const url = `${data.publicUrl}?v=${Date.now()}`;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userId);
      if (profileError) throw new Error(profileError.message);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label="Cambiar foto de perfil"
        style={{
          position: "relative",
          width: 96,
          height: 96,
          borderRadius: 24,
          border: "none",
          padding: 0,
          cursor: busy ? "wait" : "pointer",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f45a0b, #ff8c42)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatarUrl ? (
          // La foto vive en Supabase Storage, fuera del optimizador de Next.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Foto de perfil"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            className="thf-wordmark"
            style={{ fontSize: 42, color: "#000", textTransform: "uppercase" }}
          >
            {initial}
          </span>
        )}
        <span
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            padding: "4px 0 5px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
            color: "#fff",
            background: "rgba(0,0,0,.55)",
          }}
        >
          {busy ? "Subiendo…" : "📷 Foto"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
          event.target.value = "";
        }}
      />

      {error ? (
        <p role="alert" style={{ margin: "8px 0 0", fontSize: 11, color: "#f87171" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
