-- Dos correcciones que salieron de las pruebas de humo.
--
-- 1. Faltaban los GRANT de tabla. RLS decide QUE filas ve cada quien, pero
--    encima de eso Postgres exige el permiso base sobre la tabla, y las tablas
--    nuevas no lo traen. Sin esto, todo respondia "permission denied", incluido
--    el service role del webhook.
--
-- 2. Las policies de teams y team_members se llamaban entre si: para saber si
--    podias ver un equipo Postgres consultaba team_members, cuya policy volvia
--    a consultar teams. Postgres lo corta con "infinite recursion detected in
--    policy for relation teams". Se rompe el ciclo metiendo esas consultas en
--    funciones SECURITY DEFINER, que no vuelven a disparar RLS.

-- ------------------------------------------------------------------ grants --
grant usage on schema public to anon, authenticated, service_role;

-- anon se queda sin permisos a proposito: aqui no hay nada publico, todo pasa
-- por una sesion iniciada.
grant select, insert, update, delete on
  profiles, teams, team_members, payments
  to authenticated;

grant select, insert, update, delete on
  profiles, teams, team_members, payments
  to service_role;

-- --------------------------------------------------- funciones sin recursion --
create function is_team_captain(target_team uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from teams
    where teams.id = target_team and teams.captain_id = auth.uid()
  );
$$;

create function is_team_member(target_team uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from team_members
    where team_members.team_id = target_team and team_members.profile_id = auth.uid()
  );
$$;

-- ------------------------------------------------------- policies corregidas --
drop policy teams_select on teams;

create policy teams_select on teams
  for select using (
    captain_id = auth.uid()
    or is_admin()
    or is_team_member(id)
  );

drop policy team_members_select on team_members;

create policy team_members_select on team_members
  for select using (
    profile_id = auth.uid()
    or is_admin()
    or is_team_captain(team_id)
  );

drop policy team_members_write on team_members;

create policy team_members_write on team_members
  for all using (is_team_captain(team_id))
  with check (is_team_captain(team_id));

drop policy payments_select on payments;

create policy payments_select on payments
  for select using (is_admin() or is_team_captain(team_id));
