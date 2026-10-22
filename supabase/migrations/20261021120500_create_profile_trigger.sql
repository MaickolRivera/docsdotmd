-- Perfil automático: al registrarse un usuario en auth.users se crea su fila
-- en public.profiles. Si cambia el correo, se actualiza la copia.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    left(
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        split_part(coalesce(new.email, ''), '@', 1)
      ),
      120
    ),
    lower(coalesce(new.email, ''))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = lower(coalesce(new.email, ''))
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Usuarios que ya existían antes de esta migración (por ejemplo, quien se
-- registró antes de aplicarla) también necesitan su perfil.
insert into public.profiles (id, full_name, email)
select
  u.id,
  left(
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(u.email, ''), '@', 1)
    ),
    120
  ),
  lower(coalesce(u.email, ''))
from auth.users u
on conflict (id) do nothing;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;
