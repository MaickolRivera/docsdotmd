-- Operaciones que tocan varias tablas o necesitan ser atómicas.
--
-- Las que deben saltarse RLS (crear organización, aceptar invitación,
-- transferir ownership) son "security definer" y validan todo por dentro.
-- Las demás son "security invoker": corren con los permisos del usuario y RLS
-- sigue aplicando.

-- ---------------------------------------------------------------------------
-- create_organization(name, slug): crea la organización, agrega al usuario como
-- owner y crea el espacio "Documentación" con una página de bienvenida.
-- ---------------------------------------------------------------------------
create or replace function public.create_organization(p_name text, p_slug text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_org uuid;
  v_space uuid;
  v_slug text := lower(btrim(p_slug));
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (btrim(p_name), v_slug, v_user)
  returning id into v_org;

  insert into public.members (org_id, user_id, role)
  values (v_org, v_user, 'owner');

  insert into public.spaces (org_id, name, slug, icon, visibility, position)
  values (v_org, 'Documentación', 'documentacion', 'book-open', 'org', 0)
  returning id into v_space;

  insert into public.pages (org_id, space_id, title, slug, content_md, status, position, created_by, updated_by)
  values (
    v_org,
    v_space,
    'Bienvenida',
    'bienvenida',
    $md$Esta es la primera página de tu documentación. Edítala o crea páginas nuevas desde la barra lateral.

:::callout{type="tip" title="Escribe en markdown"}
Las páginas se escriben en markdown y admiten componentes visuales con directivas. Abre el editor y usa el menú **Insertar componente** o escribe `/` al inicio de una línea.
:::

## Primeros pasos

:::steps
### Invita a tu equipo
Ve a **Ajustes → Miembros** e invita a tus compañeros con el rol que necesiten.

### Organiza el contenido
Crea espacios (las pestañas de arriba) y páginas con subpáginas.

### Publica
Cada página empieza como borrador. Cuando esté lista, cámbiala a **Publicado** para que la vea todo el que tenga acceso al espacio.
:::

## Componentes disponibles

::::columns
:::card{title="Pasos" icon="list-ordered"}
Guías numeradas con `:::steps` y un `###` por paso.
:::

:::card{title="Pestañas de código" icon="code"}
Ejemplos en varios lenguajes con `::::code-tabs`.
:::

:::card{title="Avisos" icon="info"}
Notas, consejos y advertencias con `:::callout`.
:::

:::card{title="Acordeones" icon="chevrons-up-down"}
Preguntas frecuentes con `:::accordion`.
:::
::::

:::accordion{title="¿Quién puede ver esta página?"}
Todos los miembros de la organización, porque el espacio **Documentación** es visible para toda la organización. Los espacios restringidos solo los ven los grupos que tengan acceso.
:::
$md$,
    'published',
    0,
    v_user,
    v_user
  );

  return v_slug;
end;
$$;

-- ---------------------------------------------------------------------------
-- get_invitation(token): datos para la pantalla "Aceptar invitación".
-- ---------------------------------------------------------------------------
create or replace function public.get_invitation(p_token text)
returns table (
  org_name text,
  org_slug text,
  email text,
  role text,
  expires_at timestamptz,
  accepted boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.name, o.slug, i.email, i.role, i.expires_at, i.accepted_at is not null
  from public.invitations i
  join public.organizations o on o.id = i.org_id
  where auth.uid() is not null
    and i.token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
$$;

-- ---------------------------------------------------------------------------
-- accept_invitation(token): verifica el hash, la expiración y que el correo
-- coincida con el del usuario; lo agrega como miembro. Devuelve el slug.
-- ---------------------------------------------------------------------------
create or replace function public.accept_invitation(p_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_invitation public.invitations%rowtype;
  v_slug text;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select lower(u.email) into v_email from auth.users u where u.id = v_user;

  select * into v_invitation
  from public.invitations i
  where i.token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
  for update;

  if not found or v_invitation.accepted_at is not null then
    raise exception 'invalid_invitation' using errcode = 'P0001';
  end if;

  if v_invitation.expires_at < now() then
    raise exception 'expired_invitation' using errcode = 'P0001';
  end if;

  if v_invitation.email is distinct from v_email then
    raise exception 'email_mismatch' using errcode = 'P0001';
  end if;

  -- Si ya era miembro conserva su rol actual.
  insert into public.members (org_id, user_id, role)
  values (v_invitation.org_id, v_user, v_invitation.role)
  on conflict (org_id, user_id) do nothing;

  update public.invitations set accepted_at = now() where id = v_invitation.id;

  select o.slug into v_slug from public.organizations o where o.id = v_invitation.org_id;
  return v_slug;
end;
$$;

-- ---------------------------------------------------------------------------
-- transfer_ownership(org, user): el owner actual pasa a admin y el otro
-- miembro queda como owner, sin dejar la organización sin dueño.
-- ---------------------------------------------------------------------------
create or replace function public.transfer_ownership(p_org uuid, p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if public.org_role(p_org) is distinct from 'owner' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_user = v_user then
    raise exception 'same_user' using errcode = 'P0001';
  end if;

  -- Primero se promueve al nuevo owner para no pasar nunca por cero owners.
  update public.members set role = 'owner' where org_id = p_org and user_id = p_user;
  if not found then
    raise exception 'not_a_member' using errcode = 'P0001';
  end if;

  update public.members set role = 'admin' where org_id = p_org and user_id = v_user;
end;
$$;

-- ---------------------------------------------------------------------------
-- save_space: crea (p_space null) o actualiza un espacio y sus grupos con acceso
-- en una sola transacción. p_groups = [{"group_id": "...", "permission": "read|edit"}].
-- Corre con los permisos del usuario (RLS exige owner o admin).
-- ---------------------------------------------------------------------------
create or replace function public.save_space(
  p_org uuid,
  p_name text,
  p_slug text,
  p_icon text,
  p_visibility text,
  p_groups jsonb default '[]'::jsonb,
  p_space uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_space uuid := p_space;
begin
  if not public.is_org_admin(p_org) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_space is null then
    insert into public.spaces (org_id, name, slug, icon, visibility, position)
    values (
      p_org, btrim(p_name), p_slug, p_icon, p_visibility,
      coalesce((select max(s.position) + 1 from public.spaces s where s.org_id = p_org), 0)
    )
    returning id into v_space;
  else
    update public.spaces
    set name = btrim(p_name), slug = p_slug, icon = p_icon, visibility = p_visibility
    where id = v_space and org_id = p_org;
    if not found then
      raise exception 'not_found' using errcode = 'P0002';
    end if;
  end if;

  delete from public.space_groups where space_id = v_space;

  if p_visibility = 'restricted' then
    insert into public.space_groups (space_id, group_id, org_id, permission)
    select v_space, (g ->> 'group_id')::uuid, p_org, coalesce(g ->> 'permission', 'read')
    from jsonb_array_elements(coalesce(p_groups, '[]'::jsonb)) as g;
  end if;

  return v_space;
end;
$$;

-- ---------------------------------------------------------------------------
-- reorder_spaces / reorder_pages: guardan el orden recibido en una sola
-- transacción. Corren con los permisos del usuario.
-- ---------------------------------------------------------------------------
create or replace function public.reorder_spaces(p_org uuid, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_org_admin(p_org) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.spaces s
  set position = o.ord - 1
  from unnest(p_ids) with ordinality as o (id, ord)
  where s.id = o.id and s.org_id = p_org;
end;
$$;

create or replace function public.reorder_pages(p_space uuid, p_ids uuid[], p_parent uuid default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.can_edit_space(p_space) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.pages p
  set position = o.ord - 1
  from unnest(p_ids) with ordinality as o (id, ord)
  where p.id = o.id
    and p.space_id = p_space
    and p.parent_id is not distinct from p_parent;
end;
$$;

-- ---------------------------------------------------------------------------
-- search_pages(org, query): búsqueda de texto completo con prefijos para el
-- buscador Ctrl+K. Es "security invoker": RLS filtra lo que el usuario no
-- puede ver.
-- ---------------------------------------------------------------------------
create or replace function public.search_pages(p_org uuid, p_query text, p_limit integer default 20)
returns table (
  id uuid,
  title text,
  slug text,
  status text,
  space_id uuid,
  space_name text,
  space_slug text,
  space_icon text,
  snippet text,
  rank real
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_query text := btrim(coalesce(p_query, ''));
  v_terms text[];
  v_tsquery tsquery;
  v_like text;
begin
  if char_length(v_query) = 0 then
    return;
  end if;

  -- Cada palabra se busca como prefijo ("insta" encuentra "instalación").
  -- Se quitan los caracteres con significado especial en tsquery.
  select array_agg(t)
  into v_terms
  from (
    select regexp_replace(w, '[&|!():*<>''\\]', '', 'g') as t
    from regexp_split_to_table(lower(left(v_query, 200)), '\s+') as w
  ) words
  where t <> '';

  if v_terms is not null then
    v_tsquery := to_tsquery(
      'spanish',
      array_to_string(
        array(select quote_literal(t) || ':*' from unnest(v_terms[1:8]) as t),
        ' & '
      )
    );
  end if;

  v_like := '%' || replace(replace(replace(left(v_query, 200), '\', '\\'), '%', '\%'), '_', '\_') || '%';

  return query
  select
    p.id,
    p.title,
    p.slug,
    p.status,
    s.id,
    s.name,
    s.slug,
    s.icon,
    ts_headline(
      'spanish',
      regexp_replace(p.content_md, '(:{2,}[a-z-]*(\{[^}\n]*\})?)|[#*_`>|~]', ' ', 'g'),
      coalesce(v_tsquery, to_tsquery('spanish', '')),
      'MaxWords=24, MinWords=8, MaxFragments=1, FragmentDelimiter=" … ", StartSel=⟦, StopSel=⟧'
    ),
    case when v_tsquery is null then 0::real else ts_rank(p.search, v_tsquery) end
  from public.pages p
  join public.spaces s on s.id = p.space_id
  where p.org_id = p_org
    and (
      (v_tsquery is not null and p.search @@ v_tsquery)
      or p.title ilike v_like
    )
  order by (p.title ilike v_like) desc, 10 desc, p.title
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
end;
$$;

-- Función mínima para el keep-alive de GitHub Actions (evita que Supabase
-- pause el proyecto gratuito por inactividad).
create or replace function public.keep_alive()
returns text
language sql
stable
set search_path = ''
as $$
  select 'ok'::text;
$$;

revoke execute on function public.create_organization(text, text) from public, anon;
revoke execute on function public.get_invitation(text) from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
revoke execute on function public.transfer_ownership(uuid, uuid) from public, anon;
revoke execute on function public.save_space(uuid, text, text, text, text, jsonb, uuid) from public, anon;
revoke execute on function public.reorder_spaces(uuid, uuid[]) from public, anon;
revoke execute on function public.reorder_pages(uuid, uuid[], uuid) from public, anon;
revoke execute on function public.search_pages(uuid, text, integer) from public, anon;

grant execute on function public.create_organization(text, text) to authenticated;
grant execute on function public.get_invitation(text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.transfer_ownership(uuid, uuid) to authenticated;
grant execute on function public.save_space(uuid, text, text, text, text, jsonb, uuid) to authenticated;
grant execute on function public.reorder_spaces(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_pages(uuid, uuid[], uuid) to authenticated;
grant execute on function public.search_pages(uuid, text, integer) to authenticated;
grant execute on function public.keep_alive() to anon, authenticated;
