-- Row Level Security en todas las tablas del esquema public.
--
-- Las políticas usan las funciones de permisos (security definer), nunca
-- consultan "members" directamente. Las altas que tocan varias tablas
-- (crear organización, aceptar invitación) van por funciones RPC.

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.members enable row level security;
alter table public.invitations enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.spaces enable row level security;
alter table public.space_groups enable row level security;
alter table public.pages enable row level security;
alter table public.attachments enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "ver perfil propio y de compañeros"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_org_with(id));

create policy "editar perfil propio"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- organizations (se crean con la RPC create_organization)
-- ---------------------------------------------------------------------------
create policy "miembros ven su organización"
  on public.organizations for select to authenticated
  using (public.org_role(id) is not null);

create policy "owner renombra la organización"
  on public.organizations for update to authenticated
  using (public.org_role(id) = 'owner')
  with check (public.org_role(id) = 'owner');

create policy "owner borra la organización"
  on public.organizations for delete to authenticated
  using (public.org_role(id) = 'owner');

-- ---------------------------------------------------------------------------
-- members (se agregan con create_organization y accept_invitation)
-- ---------------------------------------------------------------------------
create policy "miembros ven a los miembros"
  on public.members for select to authenticated
  using (public.org_role(org_id) is not null);

-- Owner cambia cualquier rol; admin cambia roles que no son owner y no puede
-- convertir a nadie en owner.
create policy "owner y admin cambian roles"
  on public.members for update to authenticated
  using (
    public.org_role(org_id) = 'owner'
    or (public.org_role(org_id) = 'admin' and role <> 'owner')
  )
  with check (
    public.org_role(org_id) = 'owner'
    or (public.org_role(org_id) = 'admin' and role <> 'owner')
  );

-- Owner quita a cualquiera, admin a quien no es owner y cada uno puede salir.
-- El trigger members_keep_one_owner impide quitar al último owner.
create policy "owner y admin quitan miembros; cada uno puede salir"
  on public.members for delete to authenticated
  using (
    user_id = (select auth.uid())
    or public.org_role(org_id) = 'owner'
    or (public.org_role(org_id) = 'admin' and role <> 'owner')
  );

-- ---------------------------------------------------------------------------
-- invitations (se aceptan con accept_invitation)
-- ---------------------------------------------------------------------------
create policy "owner y admin ven invitaciones"
  on public.invitations for select to authenticated
  using (public.is_org_admin(org_id));

create policy "owner y admin invitan"
  on public.invitations for insert to authenticated
  with check (
    public.org_role(org_id) = 'owner'
    or (public.org_role(org_id) = 'admin' and role <> 'owner')
  );

create policy "owner y admin revocan invitaciones"
  on public.invitations for delete to authenticated
  using (public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- groups y group_members
-- ---------------------------------------------------------------------------
create policy "miembros ven los grupos"
  on public.groups for select to authenticated
  using (public.org_role(org_id) is not null);

create policy "owner y admin crean grupos"
  on public.groups for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy "owner y admin renombran grupos"
  on public.groups for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "owner y admin borran grupos"
  on public.groups for delete to authenticated
  using (public.is_org_admin(org_id));

create policy "ver integrantes de grupos"
  on public.group_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_org_admin(org_id));

create policy "owner y admin agregan integrantes"
  on public.group_members for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy "owner y admin quitan integrantes"
  on public.group_members for delete to authenticated
  using (public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- spaces y space_groups
-- ---------------------------------------------------------------------------
-- Misma regla que can_read_space, pero evaluada con las columnas de la fila:
-- así también vale para la fila recién insertada (INSERT ... RETURNING).
create policy "ver espacios permitidos"
  on public.spaces for select to authenticated
  using (
    public.is_org_admin(org_id)
    or (visibility = 'org' and public.org_role(org_id) is not null)
    or public.is_space_group_member(id)
  );

create policy "owner y admin crean espacios"
  on public.spaces for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy "owner y admin editan espacios"
  on public.spaces for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "owner y admin borran espacios"
  on public.spaces for delete to authenticated
  using (public.is_org_admin(org_id));

create policy "owner y admin ven accesos de grupos"
  on public.space_groups for select to authenticated
  using (public.is_org_admin(org_id));

create policy "owner y admin dan acceso a grupos"
  on public.space_groups for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy "owner y admin cambian accesos de grupos"
  on public.space_groups for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "owner y admin quitan accesos de grupos"
  on public.space_groups for delete to authenticated
  using (public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- pages
-- ---------------------------------------------------------------------------
create policy "leer páginas"
  on public.pages for select to authenticated
  using (
    public.can_read_space(space_id)
    and (status = 'published' or public.can_edit_space(space_id))
  );

create policy "crear páginas"
  on public.pages for insert to authenticated
  with check (public.can_edit_space(space_id));

create policy "editar páginas"
  on public.pages for update to authenticated
  using (public.can_edit_space(space_id))
  with check (public.can_edit_space(space_id));

create policy "borrar páginas"
  on public.pages for delete to authenticated
  using (public.can_edit_space(space_id));

-- ---------------------------------------------------------------------------
-- attachments
-- ---------------------------------------------------------------------------
create policy "ver adjuntos de páginas visibles"
  on public.attachments for select to authenticated
  using (public.can_read_page(page_id));

create policy "adjuntar en páginas editables"
  on public.attachments for insert to authenticated
  with check (public.can_edit_page(page_id));

create policy "borrar adjuntos de páginas editables"
  on public.attachments for delete to authenticated
  using (public.can_edit_page(page_id));

-- ---------------------------------------------------------------------------
-- Privilegios: sin acceso anónimo y columnas editables acotadas.
-- ---------------------------------------------------------------------------
revoke all on table
  public.profiles, public.organizations, public.members, public.invitations,
  public.groups, public.group_members, public.spaces, public.space_groups,
  public.pages, public.attachments
from anon;

-- Solo se pueden cambiar estas columnas; el resto (org_id, created_by...) es
-- inmutable desde la API.
revoke update on table
  public.profiles, public.organizations, public.members, public.invitations,
  public.groups, public.group_members, public.spaces, public.space_groups,
  public.pages, public.attachments
from authenticated;

grant update (full_name, avatar_url) on public.profiles to authenticated;
grant update (name, slug, logo_url) on public.organizations to authenticated;
grant update (role) on public.members to authenticated;
grant update (name) on public.groups to authenticated;
grant update (name, slug, icon, visibility, position) on public.spaces to authenticated;
grant update (permission) on public.space_groups to authenticated;
grant update (parent_id, title, slug, content_md, status, position) on public.pages to authenticated;

-- Las altas de organizaciones, miembros y perfiles solo ocurren en funciones
-- RPC o triggers.
revoke insert on table public.profiles, public.organizations, public.members from authenticated;
