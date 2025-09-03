-- Migración para implementar RLS completo en rutinas
-- Fecha: 2025-01-28
-- Descripción: Configuración completa de RLS para Rutinas, UsuarioRutina y EjerciciosRutinas

-- Vincular Usuarios con auth.users (si falta)
alter table public."Usuarios" add column if not exists auth_uid uuid unique;
alter table public."Usuarios"
  drop constraint if exists usuarios_auth_uid_fkey;
alter table public."Usuarios"
  add constraint usuarios_auth_uid_fkey
  foreign key (auth_uid) references auth.users(id) on delete cascade;

-- Backfill por correo
update public."Usuarios" u
set auth_uid = au.id
from auth.users au
where au.email = u.correo and u.auth_uid is null;

-- Helper: current_usuario_id()
create or replace function public.current_usuario_id()
returns integer
language sql stable security definer set search_path = public as $$
  select id_usuario from public."Usuarios" where auth_uid = auth.uid()
$$;

-- ON DELETE CASCADE para borrar ordenado
alter table public."EjerciciosRutinas"
  drop constraint if exists ejerciciosporrutina_id_rutina_fkey;
alter table public."EjerciciosRutinas"
  add constraint ejerciciosporrutina_id_rutina_fkey
  foreign key (id_rutina) references public."Rutinas"(id_rutina) on delete cascade;

alter table public."UsuarioRutina"
  drop constraint if exists "UsuarioRutina_id_ruitna_fkey";
alter table public."UsuarioRutina"
  add constraint "UsuarioRutina_id_ruitna_fkey"
  foreign key (id_rutina) references public."Rutinas"(id_rutina) on delete cascade;

-- Trigger: al crear Rutina, asegura propiedad y autocrea perfil si falta
create or replace function public.attach_owner_after_rutina_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_user_id integer;
begin
  -- si no hay fila en Usuarios, crearla al vuelo
  select id_usuario into v_user_id from public."Usuarios" where auth_uid = v_uid;

  if v_user_id is null then
    select email into v_email from auth.users where id = v_uid;
    insert into public."Usuarios"(auth_uid, correo, fecha_registro)
    values (v_uid, v_email, current_date)
    on conflict (auth_uid) do nothing;

    select id_usuario into v_user_id from public."Usuarios" where auth_uid = v_uid;
  end if;

  -- registra propiedad (bypass de RLS por security definer)
  insert into public."UsuarioRutina"(id_usuario, id_rutina)
  values (v_user_id, new.id_rutina)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists trg_rutinas_after_insert on public."Rutinas";
create trigger trg_rutinas_after_insert
after insert on public."Rutinas"
for each row execute procedure public.attach_owner_after_rutina_insert();

-- Auto-crear perfil al crear auth.user (para usuarios nuevos)
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."Usuarios"(auth_uid, correo, fecha_registro)
  values (new.id, new.email, current_date)
  on conflict (auth_uid) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Habilitar RLS
alter table public."Rutinas" enable row level security;
alter table public."UsuarioRutina" enable row level security;
alter table public."EjerciciosRutinas" enable row level security;

grant select, insert, update, delete on public."Rutinas" to authenticated;
grant select, insert, update, delete on public."UsuarioRutina" to authenticated;
grant select, insert, update, delete on public."EjerciciosRutinas" to authenticated;

-- RLS: INSERT Rutinas permitido a autenticados
drop policy if exists rutinas_insert_auth on public."Rutinas";
create policy rutinas_insert_auth
on public."Rutinas" for insert
with check (auth.uid() is not null);

-- RLS: OWN/FRIENDS SELECT en Rutinas
drop policy if exists rutinas_select_own on public."Rutinas";
create policy rutinas_select_own
on public."Rutinas" for select
using (
  exists (
    select 1 from public."UsuarioRutina" ur
    where ur.id_rutina = "Rutinas".id_rutina
      and (
        ur.id_usuario = public.current_usuario_id()
        or exists (
          select 1 from public."Amigos" a
          where (a.id_usuario1 = ur.id_usuario and a.id_usuario2 = public.current_usuario_id())
             or (a.id_usuario2 = ur.id_usuario and a.id_usuario1 = public.current_usuario_id())
        )
      )
  )
);

-- RLS: UPDATE/DELETE sólo dueño
drop policy if exists rutinas_update_owner on public."Rutinas";
create policy rutinas_update_owner
on public."Rutinas" for update
using (exists (select 1 from public."UsuarioRutina" ur where ur.id_rutina = "Rutinas".id_rutina and ur.id_usuario = public.current_usuario_id()))
with check (exists (select 1 from public."UsuarioRutina" ur where ur.id_rutina = "Rutinas".id_rutina and ur.id_usuario = public.current_usuario_id()));

drop policy if exists rutinas_delete_owner on public."Rutinas";
create policy rutinas_delete_owner
on public."Rutinas" for delete
using (exists (select 1 from public."UsuarioRutina" ur where ur.id_rutina = "Rutinas".id_rutina and ur.id_usuario = public.current_usuario_id()));

-- UsuarioRutina: ver/insertar/borrar sólo tus filas
drop policy if exists ur_select_own on public."UsuarioRutina";
create policy ur_select_own
on public."UsuarioRutina" for select
using (id_usuario = public.current_usuario_id());

drop policy if exists ur_insert_self on public."UsuarioRutina";
create policy ur_insert_self
on public."UsuarioRutina" for insert
with check (id_usuario = public.current_usuario_id());

drop policy if exists ur_delete_self on public."UsuarioRutina";
create policy ur_delete_self
on public."UsuarioRutina" for delete
using (id_usuario = public.current_usuario_id());

-- EjerciciosRutinas: visibilidad OWN/FRIENDS
drop policy if exists er_select_owner on public."EjerciciosRutinas";
create policy er_select_owner
on public."EjerciciosRutinas" for select
using (
  exists (
    select 1 from public."UsuarioRutina" ur
    where ur.id_rutina = "EjerciciosRutinas".id_rutina
      and (
        ur.id_usuario = public.current_usuario_id()
        or exists (
          select 1 from public."Amigos" a
          where (a.id_usuario1 = ur.id_usuario and a.id_usuario2 = public.current_usuario_id())
             or (a.id_usuario2 = ur.id_usuario and a.id_usuario1 = public.current_usuario_id())
        )
      )
  )
);

drop policy if exists er_insert_owner on public."EjerciciosRutinas";
create policy er_insert_owner
on public."EjerciciosRutina" for insert
with check (
  exists (
    select 1 from public."UsuarioRutina" ur
    where ur.id_rutina = "EjerciciosRutinas".id_rutina
      and ur.id_usuario = public.current_usuario_id()
  )
);

drop policy if exists er_update_owner on public."EjerciciosRutinas";
create policy er_update_owner
on public."EjerciciosRutinas" for update
using (
  exists (
    select 1 from public."UsuarioRutina" ur
    where ur.id_rutina = "EjerciciosRutinas".id_rutina
      and ur.id_usuario = public.current_usuario_id()
  )
)
with check (
  exists (
    select 1 from public."UsuarioRutina" ur
    where ur.id_rutina = "EjerciciosRutinas".id_rutina
      and ur.id_usuario = public.current_usuario_id()
  )
);
