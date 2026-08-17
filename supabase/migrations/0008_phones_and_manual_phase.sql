-- Dos cambios pedidos por el cliente:
--
-- 1. Telefono y telefono de emergencia de cada atleta, capturados al armar la
--    pareja. En un evento fisico el contacto de emergencia no es opcional.
--
-- 2. La fase de precios deja de subir sola por conteo y pasa a ser decision
--    del staff: cuatro botones en el panel de admin, uno por fase. El conteo
--    de parejas pagadas se sigue mostrando como referencia para decidir
--    cuando apretar el boton, pero ya no dispara el cambio.
--
-- Lo que NO cambia: el precio lo pone la base (el trigger sigue leyendo
-- price_phases), se fija al momento de pagar, y un equipo pagado conserva
-- su monto.

-- ------------------------------------------------------------- telefonos --

alter table team_members
  add column phone text not null default '',
  add column emergency_phone text not null default '';

-- --------------------------------------------------------- la fase activa --

alter table price_phases
  add column active boolean not null default false;

update price_phases set active = true where phase = 1;

-- Solo una fase activa a la vez: activar una desactiva el resto. Mismo patron
-- que workouts_single_published.
create function enforce_single_active_phase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.active then
    update price_phases set active = false where phase <> new.phase and active;
  end if;
  return new;
end;
$$;

create trigger price_phases_single_active
  after update of active on price_phases
  for each row when (new.active)
  execute function enforce_single_active_phase();

-- El staff cambia la fase desde el panel; el service role de las server
-- actions ya puede escribir, pero la policy permite auditar la intencion.
create policy price_phases_admin_update on price_phases
  for update using (is_admin()) with check (is_admin());

-- --------------------------------------------- precio segun la fase activa --

-- Antes el precio salia de contar parejas pagadas; ahora sale de la fase que
-- el staff dejo activa. paid_pairs() se conserva como dato informativo.
create or replace function current_price(p_division division)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select case p_division when 'CM' then p.price_cm else p.price_op end
    from price_phases p
   where p.active
   limit 1;
$$;

-- Mismo cuerpo que antes; solo cambia el mensaje de error, que hablaba del
-- cupo cuando el modelo era automatico.
create or replace function apply_division_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  catalog_price integer;
begin
  if tg_op = 'UPDATE' and new.status = 'paid' then
    new.amount_mxn := old.amount_mxn;
    return new;
  end if;

  catalog_price := current_price(new.division);

  if catalog_price is null then
    raise exception 'No hay ninguna fase de precios activa; activala desde el panel de admin';
  end if;

  new.amount_mxn := catalog_price;
  return new;
end;
$$;

-- La vista tambien pasa a leer la fase activa. remaining_pairs conserva su
-- significado de referencia: cuantos lugares del tramo quedan segun el cupo
-- original, por si el staff quiere respetarlo.
create or replace view current_phase
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
where p.active;
