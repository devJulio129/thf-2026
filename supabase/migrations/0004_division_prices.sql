-- El precio deja de ser un dato que el cliente escribe y pasa a ser un dato que
-- la base calcula.
--
-- Hasta ahora amount_mxn se guardaba tal como llegaba. La policy teams_update
-- permite al capitan editar su equipo, asi que nada impedia mandar
-- `amount_mxn = 1` por la API y pagar la inscripcion en un peso. El precio del
-- catalogo vivia solo en TypeScript, y eso no protege nada.
--
-- Con esto el monto sale siempre de la tabla de precios, tanto al crear el
-- equipo como al cambiarle la division. Lo que mande el cliente se ignora.

create table division_prices (
  division division primary key,
  price_mxn integer not null check (price_mxn > 0),
  updated_at timestamptz not null default now()
);

insert into division_prices (division, price_mxn) values
  ('CM', 2000),
  ('OP', 2300);

alter table division_prices enable row level security;

-- Cualquiera con sesion puede consultarlos; cambiarlos es cosa del staff, que
-- entra por service role.
grant select on division_prices to authenticated, anon;
grant select, insert, update, delete on division_prices to service_role;

create policy division_prices_select on division_prices
  for select using (true);

-- El precio se sella al crear el equipo y se recalcula si cambia la division.
-- Un equipo ya pagado conserva el suyo aunque el catalogo suba despues.
create function apply_division_price()
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

  select price_mxn into catalog_price
  from division_prices
  where division = new.division;

  if catalog_price is null then
    raise exception 'No hay precio para la division %', new.division;
  end if;

  new.amount_mxn := catalog_price;
  return new;
end;
$$;

create trigger teams_apply_division_price
  before insert or update of division, amount_mxn on teams
  for each row execute function apply_division_price();
