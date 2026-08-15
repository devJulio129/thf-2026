-- El precio deja de ser fijo por division y pasa a depender del cupo vendido.
--
-- El sitio publico anuncia cuatro fases: conforme se llenan lugares, sube el
-- precio de las dos divisiones. Hasta ahora division_prices tenia un solo
-- renglon por division, que era la Fase 1; a partir de la pareja 51 se habria
-- seguido cobrando precio de Founders sin que nadie lo notara.
--
-- Dos reglas de negocio, decididas con el cliente:
--
--   1. Solo cuentan las parejas PAGADAS. Un equipo creado y nunca pagado no
--      ocupa lugar; si contaran, cualquiera podria crear equipos y empujar el
--      precio a la fase siguiente sin gastar un peso.
--   2. El precio se fija al momento de pagar, no al armar el equipo. Lo que se
--      ve en el perfil antes de pagar es una cotizacion de la fase vigente, y
--      se vuelve a calcular justo antes de crear la preference de Mercado Pago.
--      Si no, se podria apartar precio de Founders y pagar meses despues.
--
-- Lo que NO cambia: el precio lo sigue poniendo la base y no el cliente, y un
-- equipo ya pagado conserva su monto aunque el catalogo suba despues.

-- ------------------------------------------------------------ price_phases --

create table price_phases (
  phase smallint primary key,
  label text not null,
  -- Cupo acumulado, contado en parejas pagadas. to_pairs nulo = sin tope.
  from_pairs integer not null check (from_pairs >= 1),
  to_pairs integer check (to_pairs is null or to_pairs >= from_pairs),
  price_cm integer not null check (price_cm > 0),
  price_op integer not null check (price_op > 0)
);

comment on table price_phases is
  'Precio por division segun el cupo de parejas ya pagadas. Lo edita solo el staff.';

insert into price_phases (phase, label, from_pairs, to_pairs, price_cm, price_op) values
  (1, 'Fase 1 · Founders', 1,   50,   2000, 2300),
  (2, 'Fase 2',            51,  120,  2200, 2500),
  (3, 'Fase 3',            121, 200,  2400, 2700),
  (4, 'Fase final',        201, null, 2600, 2900);

alter table price_phases enable row level security;

grant select on price_phases to authenticated, anon;
grant select, insert, update, delete on price_phases to service_role;

create policy price_phases_select on price_phases
  for select using (true);

-- -------------------------------------------------------------- funciones --

-- Cuenta las parejas pagadas. Tiene que ser security definer: teams tiene RLS y
-- un atleta solo ve su propio equipo, asi que sin esto el conteo daria 1 y todo
-- el mundo se quedaria en Fase 1 para siempre.
create function paid_pairs()
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::integer from teams where status = 'paid';
$$;

comment on function paid_pairs is
  'Parejas con el pago confirmado. Es el cupo que decide la fase vigente.';

-- Precio que le toca a la SIGUIENTE pareja en pagar. Por eso el +1: cuando ya
-- hay 50 pagadas, la que sigue es la 51 y entra en Fase 2.
create function current_price(p_division division)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select case p_division when 'CM' then p.price_cm else p.price_op end
    from price_phases p
   where paid_pairs() + 1
         between p.from_pairs and coalesce(p.to_pairs, 2147483647)
   limit 1;
$$;

-- service_role incluido a proposito: RLS se lo salta, pero el permiso base de
-- Postgres no, y el panel de admin lee por ahi. Es el mismo tropiezo que
-- documenta la migracion 0002.
grant execute on function paid_pairs() to authenticated, anon, service_role;
grant execute on function current_price(division) to authenticated, anon, service_role;

-- --------------------------------------------------- el trigger del precio --

-- Misma garantia que antes, con el precio saliendo de la fase vigente en vez de
-- un catalogo plano.
create or replace function apply_division_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  catalog_price integer;
begin
  -- Un equipo pagado conserva lo que pago, pase lo que pase con el catalogo.
  if tg_op = 'UPDATE' and new.status = 'paid' then
    new.amount_mxn := old.amount_mxn;
    return new;
  end if;

  catalog_price := current_price(new.division);

  if catalog_price is null then
    raise exception 'No hay fase de precios que cubra el cupo actual (% parejas pagadas)',
      paid_pairs();
  end if;

  new.amount_mxn := catalog_price;
  return new;
end;
$$;

-- ------------------------------------------------------- la fase de hoy ----

-- Lo que la interfaz necesita para decir "Fase 1 · Founders, quedan N lugares".
-- security_invoker off por lo mismo que paid_pairs: hay que contar equipos
-- ajenos, y RLS lo impide a proposito.
create view current_phase
with (security_invoker = off) as
select
  p.phase,
  p.label,
  p.from_pairs,
  p.to_pairs,
  p.price_cm,
  p.price_op,
  paid_pairs() as paid_pairs,
  case when p.to_pairs is null then null else p.to_pairs - paid_pairs() end
    as remaining_pairs
from price_phases p
where paid_pairs() + 1
      between p.from_pairs and coalesce(p.to_pairs, 2147483647);

comment on view current_phase is
  'Fase de precios vigente y cuantos lugares quedan en ella. Sin datos privados.';

grant select on current_phase to anon, authenticated, service_role;

-- ------------------------------------------------------------- limpieza ----

-- division_prices queda sin uso: su unico lector era apply_division_price.
drop policy division_prices_select on division_prices;
drop table division_prices;
