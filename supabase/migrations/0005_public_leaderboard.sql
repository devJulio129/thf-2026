-- Vista publica del leaderboard.
--
-- El leaderboard lista parejas ya inscritas, asi que necesita leer equipos que
-- no son tuyos. RLS lo impide a proposito, y abrirlo con una policy expondria
-- la tabla completa: captain_id, preference_id, amount_mxn.
--
-- En vez de eso, esta vista publica exactamente lo que el prototipo muestra en
-- pantalla y nada mas. En concreto:
--   - Solo equipos con el pago confirmado.
--   - Nombre del equipo, division, emblema, ciudad y nombres de los atletas.
--   - Los correos NO salen: son dato de contacto, no de exhibicion.

create view public_leaderboard
with (security_invoker = off) as
select
  t.id,
  t.name,
  t.division,
  t.gender,
  t.emblem,
  t.paid_at,
  coalesce(
    (
      select json_agg(
        json_build_object('name', m.name, 'city', m.city)
        order by m.created_at
      )
      from team_members m
      where m.team_id = t.id
    ),
    '[]'::json
  ) as members
from teams t
where t.status = 'paid';

comment on view public_leaderboard is
  'Equipos pagados con los campos que se muestran en el leaderboard publico. Sin correos.';

grant select on public_leaderboard to anon, authenticated;
