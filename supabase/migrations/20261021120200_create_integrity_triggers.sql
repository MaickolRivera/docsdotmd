-- Reglas de integridad que no se pueden expresar solo con restricciones.

-- ---------------------------------------------------------------------------
-- Siempre debe quedar al menos un owner por organización.
-- ---------------------------------------------------------------------------
create or replace function public.members_keep_one_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner' and (tg_op = 'DELETE' or new.role <> 'owner') then
    -- Bloquea la organización para que dos cambios simultáneos no la dejen sin
    -- owner. Si la organización se está borrando (cascada), ya no existe y no
    -- hay nada que proteger.
    perform 1 from public.organizations o where o.id = old.org_id for update;

    if found and not exists (
      select 1
      from public.members m
      where m.org_id = old.org_id
        and m.role = 'owner'
        and m.user_id <> old.user_id
    ) then
      raise exception 'last_owner'
        using errcode = '23514',
              hint = 'La organización debe tener al menos un owner.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger members_keep_one_owner
  before update of role or delete on public.members
  for each row execute function public.members_keep_one_owner();

-- ---------------------------------------------------------------------------
-- Páginas: autor y fecha de la última edición.
-- ---------------------------------------------------------------------------
create or replace function public.pages_set_audit_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.updated_by := coalesce(auth.uid(), new.updated_by, new.created_by);
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  -- Reordenar no cuenta como edición del contenido.
  if (new.title, new.slug, new.content_md, new.status, new.parent_id)
     is distinct from (old.title, old.slug, old.content_md, old.status, old.parent_id) then
    new.updated_by := coalesce(auth.uid(), new.updated_by);
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger pages_set_audit_fields
  before insert or update on public.pages
  for each row execute function public.pages_set_audit_fields();

-- ---------------------------------------------------------------------------
-- Páginas: una página no puede colgar de sí misma ni de una de sus hijas.
-- ---------------------------------------------------------------------------
create or replace function public.pages_prevent_cycles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.parent_id is not null
     and (tg_op = 'INSERT' or new.parent_id is distinct from old.parent_id) then
    if exists (
      with recursive ancestors (id, parent_id, depth) as (
        select p.id, p.parent_id, 1
        from public.pages p
        where p.id = new.parent_id
        union all
        select p.id, p.parent_id, a.depth + 1
        from public.pages p
        join ancestors a on p.id = a.parent_id
        where a.depth < 64
      )
      select 1 from ancestors where ancestors.id = new.id
    ) then
      raise exception 'page_cycle'
        using errcode = '23514',
              hint = 'Una página no puede ser hija de sí misma ni de sus subpáginas.';
    end if;
  end if;
  return new;
end;
$$;

create trigger pages_prevent_cycles
  before insert or update of parent_id on public.pages
  for each row execute function public.pages_prevent_cycles();

revoke execute on function public.members_keep_one_owner() from public, anon, authenticated;
revoke execute on function public.pages_set_audit_fields() from public, anon, authenticated;
revoke execute on function public.pages_prevent_cycles() from public, anon, authenticated;
