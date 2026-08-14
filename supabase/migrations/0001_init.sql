-- Esquema base del THF 2026: perfiles, equipos, integrantes y pagos.
--
-- Regla que atraviesa todo el archivo: el estado de pago NO es escribible por
-- los usuarios. Solo el webhook, que corre con la service role key y se salta
-- RLS, puede tocar payments y mover teams.status a 'paid'.

create type division as enum ('CM', 'OP');
create type team_status as enum ('awaiting_payment', 'paid');
create type user_role as enum ('athlete', 'staff', 'admin');

-- ---------------------------------------------------------------- profiles --
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null default '',
  city text not null default '',
  birth_date date,
  shirt_size text,
  role user_role not null default 'athlete',
  created_at timestamptz not null default now()
);

-- Cada usuario que se registra estrena su perfil automaticamente. Sin esto
-- habria que crearlo desde el cliente, que es facil de saltarse.
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------------------------------------- teams --
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  division division not null,
  captain_id uuid not null references profiles (id) on delete cascade,
  emblem jsonb not null default '{}'::jsonb,
  -- Se congela al crear el equipo: si suben los precios, quien ya se inscribio
  -- paga lo que se le cotizo.
  amount_mxn integer not null check (amount_mxn > 0),
  status team_status not null default 'awaiting_payment',
  preference_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Un atleta capitanea un solo equipo.
create unique index teams_captain_unique on teams (captain_id);
create index teams_status_idx on teams (status);

-- ------------------------------------------------------------ team_members --
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  -- Null mientras el segundo atleta no tenga cuenta propia.
  profile_id uuid references profiles (id) on delete set null,
  name text not null check (char_length(trim(name)) >= 2),
  email text not null,
  shirt_size text not null,
  created_at timestamptz not null default now()
);

create index team_members_team_idx on team_members (team_id);

-- ---------------------------------------------------------------- payments --
create table payments (
  -- Id del pago en Mercado Pago. Ser la llave primaria es lo que hace que el
  -- webhook sea idempotente: MP reintenta y manda varias por el mismo pago.
  id text primary key,
  team_id uuid not null references teams (id) on delete cascade,
  status text not null,
  status_detail text,
  amount_mxn numeric(10, 2) not null,
  payment_method text,
  processed_at timestamptz not null default now(),
  raw jsonb
);

create index payments_team_idx on payments (team_id);

-- --------------------------------------------------------------------- RLS --
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table payments enable row level security;

create function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- profiles: cada quien el suyo; staff ve todos.
create policy profiles_select_own on profiles
  for select using (id = auth.uid() or is_admin());

create policy profiles_update_own on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- teams: el capitan manda; los integrantes con cuenta pueden ver.
create policy teams_select on teams
  for select using (
    captain_id = auth.uid()
    or is_admin()
    or exists (
      select 1 from team_members
      where team_members.team_id = teams.id and team_members.profile_id = auth.uid()
    )
  );

create policy teams_insert on teams
  for insert with check (
    captain_id = auth.uid()
    -- Un equipo nace sin pagar, siempre. El alta no puede autoproclamarse paga.
    and status = 'awaiting_payment'
    and paid_at is null
  );

create policy teams_update on teams
  for update using (captain_id = auth.uid())
  with check (
    captain_id = auth.uid()
    -- Ni el capitan puede marcar su equipo como pagado: eso solo lo hace el
    -- webhook con la service role key.
    and status = 'awaiting_payment'
    and paid_at is null
  );

create policy teams_delete on teams
  for delete using (captain_id = auth.uid() and status = 'awaiting_payment');

-- team_members: se administran desde el equipo.
create policy team_members_select on team_members
  for select using (
    profile_id = auth.uid()
    or is_admin()
    or exists (
      select 1 from teams
      where teams.id = team_members.team_id and teams.captain_id = auth.uid()
    )
  );

create policy team_members_write on team_members
  for all using (
    exists (
      select 1 from teams
      where teams.id = team_members.team_id and teams.captain_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from teams
      where teams.id = team_members.team_id and teams.captain_id = auth.uid()
    )
  );

-- payments: solo lectura, y solo de lo tuyo. No hay policy de insert ni de
-- update a proposito; escribe unicamente la service role key.
create policy payments_select on payments
  for select using (
    is_admin()
    or exists (
      select 1 from teams
      where teams.id = payments.team_id and teams.captain_id = auth.uid()
    )
  );
