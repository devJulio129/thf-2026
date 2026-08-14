-- Campos que pide el diseno del Profile y que faltaban:
--
-- 1. La categoria del equipo por composicion de la pareja (♂♂ / ♂♀ / ♀♀). En el
--    prototipo se elige al crear el equipo y se muestra junto al estatus de pago.
-- 2. Ciudad y fecha de nacimiento de cada integrante: el formulario del atleta 2
--    los pide igual que los del atleta 1.

create type team_gender as enum ('MM', 'MX', 'FF');

alter table teams
  -- 'MX' (Hombre / Mujer) es el valor intermedio y el mas comun; sirve de
  -- default para los equipos que ya existian antes de esta columna.
  add column gender team_gender not null default 'MX';

alter table team_members
  add column city text not null default '',
  add column birth_date date;
