-- Funciones de permisos.
--
-- Las políticas RLS no consultan "members" directamente (eso causa recursión
-- infinita); usan estas funciones "security definer" con search_path fijo.
-- Todas devuelven null/false cuando no hay sesión (auth.uid() es null).

-- Rol del usuario actual en una organización, o null si no es miembro.
create or replace function public.org_role(p_org uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.members m
  where m.org_id = p_org
    and m.user_id = auth.uid();
$$;

-- ¿El usuario actual es owner o admin de la organización?
create or replace function public.is_org_admin(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.org_role(p_org) in ('owner', 'admin'), false);
$$;

-- ¿El usuario actual está en algún grupo con acceso (read o edit) al espacio?
create or replace function public.is_space_group_member(p_space uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.space_groups sg
    join public.group_members gm on gm.group_id = sg.group_id
    where sg.space_id = p_space
      and gm.user_id = auth.uid()
  );
$$;

-- ¿El usuario actual puede ver el espacio?
--   * visibilidad "org": cualquier miembro.
--   * owner y admin: todos los espacios.
--   * "restricted": solo quien está en un grupo con acceso (read o edit).
create or replace function public.can_read_space(p_space uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.spaces s
    where s.id = p_space
      and (
        (s.visibility = 'org' and public.org_role(s.org_id) is not null)
        or public.org_role(s.org_id) in ('owner', 'admin')
        or public.is_space_group_member(s.id)
      )
  );
$$;

-- ¿El usuario actual puede editar el espacio?
-- Igual que can_read_space, pero exige rol editor o superior y, en espacios
-- restringidos, que el editor esté en un grupo con permiso "edit".
create or replace function public.can_edit_space(p_space uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.spaces s
    where s.id = p_space
      and (
        public.org_role(s.org_id) in ('owner', 'admin')
        or (
          public.org_role(s.org_id) = 'editor'
          and (
            s.visibility = 'org'
            or exists (
              select 1
              from public.space_groups sg
              join public.group_members gm on gm.group_id = sg.group_id
              where sg.space_id = s.id
                and sg.permission = 'edit'
                and gm.user_id = auth.uid()
            )
          )
        )
      )
  );
$$;

-- ¿El usuario actual puede leer la página? Los borradores solo los ve quien
-- puede editar el espacio.
create or replace function public.can_read_page(p_page uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pages p
    where p.id = p_page
      and public.can_read_space(p.space_id)
      and (p.status = 'published' or public.can_edit_space(p.space_id))
  );
$$;

create or replace function public.can_edit_page(p_page uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pages p
    where p.id = p_page
      and public.can_edit_space(p.space_id)
  );
$$;

-- ¿El usuario actual comparte alguna organización con p_user? Sirve para ver
-- nombre y correo de los compañeros.
create or replace function public.shares_org_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.members mine
    join public.members theirs on theirs.org_id = mine.org_id
    where mine.user_id = auth.uid()
      and theirs.user_id = p_user
  );
$$;

-- Permiso sobre un objeto del bucket "attachments". La ruta es
-- org_id/page_id/archivo: el primer segmento debe ser la organización de la
-- página y el usuario debe poder leerla (o editarla, para subir y borrar).
create or replace function public.can_access_attachment_object(p_name text, p_edit boolean)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_parts text[] := string_to_array(p_name, '/');
  v_org uuid;
  v_page uuid;
begin
  if coalesce(array_length(v_parts, 1), 0) <> 3 or v_parts[3] = '' then
    return false;
  end if;

  begin
    v_org := v_parts[1]::uuid;
    v_page := v_parts[2]::uuid;
  exception when invalid_text_representation then
    return false;
  end;

  if not exists (
    select 1 from public.pages p where p.id = v_page and p.org_id = v_org
  ) then
    return false;
  end if;

  if p_edit then
    return public.can_edit_page(v_page);
  end if;

  return public.can_read_page(v_page);
end;
$$;

-- Nadie sin sesión necesita estas funciones.
revoke execute on function public.org_role(uuid) from public, anon;
revoke execute on function public.is_org_admin(uuid) from public, anon;
revoke execute on function public.is_space_group_member(uuid) from public, anon;
revoke execute on function public.can_read_space(uuid) from public, anon;
revoke execute on function public.can_edit_space(uuid) from public, anon;
revoke execute on function public.can_read_page(uuid) from public, anon;
revoke execute on function public.can_edit_page(uuid) from public, anon;
revoke execute on function public.shares_org_with(uuid) from public, anon;
revoke execute on function public.can_access_attachment_object(text, boolean) from public, anon;

grant execute on function public.org_role(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.is_space_group_member(uuid) to authenticated;
grant execute on function public.can_read_space(uuid) to authenticated;
grant execute on function public.can_edit_space(uuid) to authenticated;
grant execute on function public.can_read_page(uuid) to authenticated;
grant execute on function public.can_edit_page(uuid) to authenticated;
grant execute on function public.shares_org_with(uuid) to authenticated;
grant execute on function public.can_access_attachment_object(text, boolean) to authenticated;
