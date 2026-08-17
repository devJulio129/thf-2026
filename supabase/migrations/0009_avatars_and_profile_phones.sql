-- Revision del perfil pedida por el cliente:
--
-- 1. Foto de perfil. El prototipo traia un <image-slot> para arrastrar la
--    imagen; ahora existe de verdad con Supabase Storage: un bucket publico
--    "avatars" donde cada quien solo puede escribir en su propia carpeta
--    ({uid}/...), y la URL se guarda en profiles.avatar_url.
--
-- 2. Telefono y telefono de emergencia tambien en profiles. Ya existian en
--    team_members (se capturan al armar la pareja); aqui viven los del propio
--    atleta para poder editarlos desde "Datos personales" aunque todavia no
--    tenga equipo.

alter table profiles
  add column phone text not null default '',
  add column emergency_phone text not null default '',
  add column avatar_url text;

-- ------------------------------------------------------------ el bucket ----

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,               -- lectura publica: la foto se pinta sin sesion
  5 * 1024 * 1024,    -- 5 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Cada quien escribe SOLO dentro de su carpeta: avatars/{uid}/lo-que-sea.
--
-- La policy de SELECT no es opcional aunque el bucket sea publico: el INSERT
-- del servicio de storage lleva RETURNING, y Postgres exige que la fila
-- devuelta pase tambien la policy de lectura. Sin ella, subir falla con
-- "new row violates row-level security policy".

create policy avatars_select on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy avatars_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
