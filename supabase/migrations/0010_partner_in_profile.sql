-- El formulario de crear equipo repetia todos los datos personales que ya se
-- capturan en "Editar perfil". Decision del cliente: el perfil es la unica
-- fuente de datos de los dos atletas, y crear equipo queda solo para el
-- emblema, la division, la categoria y el pago.
--
-- Para eso los datos de la pareja tienen que poder existir ANTES del equipo:
-- viven en el perfil del capitan y al crear el equipo se copian a
-- team_members, que sigue siendo lo que consumen el leaderboard y el admin.

alter table profiles
  add column partner_name text not null default '',
  add column partner_email text not null default '',
  add column partner_city text not null default '',
  add column partner_birth_date date,
  add column partner_shirt_size text,
  add column partner_phone text not null default '',
  add column partner_emergency_phone text not null default '';
