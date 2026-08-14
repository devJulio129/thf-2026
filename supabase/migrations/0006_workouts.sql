-- Comp Prep Workouts: los publica el staff y el que quede publicado se muestra
-- al inicio de la landing.

create table workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) >= 2),
  subtitle text not null default '',
  -- Una linea por bloque, tal como se escribe en el panel.
  content text not null check (char_length(trim(content)) >= 2),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workouts_published_idx on workouts (is_published, updated_at desc);

alter table workouts enable row level security;

grant select on workouts to anon, authenticated;
grant select, insert, update, delete on workouts to service_role;

-- Cualquiera puede leer el publicado: es lo que se pinta en la landing.
create policy workouts_select_published on workouts
  for select using (is_published or is_admin());

-- Escribir es cosa del staff, y ademas pasa por el service role desde las
-- server actions, que verifican el rol antes de tocar nada.
create policy workouts_admin_all on workouts
  for all using (is_admin()) with check (is_admin());

-- Solo un workout publicado a la vez: al publicar uno se despublica el resto.
create function enforce_single_published_workout()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_published then
    update workouts
      set is_published = false, updated_at = now()
      where id <> new.id and is_published;
  end if;
  return new;
end;
$$;

create trigger workouts_single_published
  after insert or update of is_published on workouts
  for each row when (new.is_published)
  execute function enforce_single_published_workout();

create function touch_workout_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger workouts_touch_updated_at
  before update on workouts
  for each row execute function touch_workout_updated_at();
