-- Tablas principales de DOCSmd.
--
-- Jerarquía: organización -> espacios -> páginas -> adjuntos.
-- Toda tabla con datos de una organización lleva org_id. Las claves foráneas
-- compuestas (id, org_id) garantizan que nunca se mezclen filas de dos
-- organizaciones, aunque alguien envíe IDs a mano.

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users; los crea un trigger al registrarse)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  -- Copia del correo de auth.users para mostrarlo a los compañeros de organización.
  email text not null default '',
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 500),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organizaciones
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  slug text not null unique,
  logo_url text check (logo_url is null or char_length(logo_url) <= 500),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint organizations_slug_format check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 48
  ),
  -- Slugs que chocan con rutas de la aplicación (/orgs, /login, /api...).
  constraint organizations_slug_not_reserved check (
    slug <> all (array[
      'orgs', 'login', 'logout', 'registro', 'recuperar', 'actualizar-clave',
      'auth', 'invitacion', 'api', 'ajustes', 'admin', 'app', 'static',
      'public', 'assets', 'ayuda', 'help', 'docs', 'nueva', 'new'
    ])
  )
);

-- ---------------------------------------------------------------------------
-- Miembros con rol a nivel de organización
-- ---------------------------------------------------------------------------
create table public.members (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index members_user_id_idx on public.members (user_id);

-- ---------------------------------------------------------------------------
-- Invitaciones (solo se guarda el hash del token)
-- ---------------------------------------------------------------------------
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  email text not null check (email = lower(email) and char_length(email) between 3 and 254),
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);

create index invitations_org_id_idx on public.invitations (org_id);

-- Una sola invitación pendiente por correo y organización.
create unique index invitations_pending_email_idx
  on public.invitations (org_id, email)
  where accepted_at is null;

-- ---------------------------------------------------------------------------
-- Grupos y sus integrantes
-- ---------------------------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  constraint groups_org_name_key unique (org_id, name),
  constraint groups_id_org_key unique (id, org_id)
);

create table public.group_members (
  group_id uuid not null,
  user_id uuid not null,
  org_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id),
  constraint group_members_group_fkey
    foreign key (group_id, org_id) references public.groups (id, org_id) on delete cascade,
  -- Solo miembros de la organización pueden estar en sus grupos; al salir de la
  -- organización se borran también sus grupos.
  constraint group_members_member_fkey
    foreign key (org_id, user_id) references public.members (org_id, user_id) on delete cascade
);

create index group_members_user_id_idx on public.group_members (user_id);
create index group_members_org_user_idx on public.group_members (org_id, user_id);

-- ---------------------------------------------------------------------------
-- Espacios (pestañas superiores) y su acceso por grupos
-- ---------------------------------------------------------------------------
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  slug text not null,
  icon text not null default 'book-open' check (icon ~ '^[a-z0-9-]{1,40}$'),
  visibility text not null default 'org' check (visibility in ('org', 'restricted')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint spaces_slug_format check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 1 and 48
  ),
  -- /[org]/ajustes es una ruta de la aplicación.
  constraint spaces_slug_not_reserved check (slug <> all (array['ajustes'])),
  constraint spaces_org_slug_key unique (org_id, slug),
  constraint spaces_id_org_key unique (id, org_id)
);

create index spaces_org_position_idx on public.spaces (org_id, position);

create table public.space_groups (
  space_id uuid not null,
  group_id uuid not null,
  org_id uuid not null,
  permission text not null default 'read' check (permission in ('read', 'edit')),
  primary key (space_id, group_id),
  constraint space_groups_space_fkey
    foreign key (space_id, org_id) references public.spaces (id, org_id) on delete cascade,
  constraint space_groups_group_fkey
    foreign key (group_id, org_id) references public.groups (id, org_id) on delete cascade
);

create index space_groups_group_id_idx on public.space_groups (group_id);

-- ---------------------------------------------------------------------------
-- Páginas en markdown con jerarquía padre/hija
-- ---------------------------------------------------------------------------
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  space_id uuid not null,
  parent_id uuid,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  slug text not null,
  content_md text not null default '' check (char_length(content_md) <= 200000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  position integer not null default 0,
  -- Búsqueda de texto: el título pesa más que el contenido.
  search tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A')
    || setweight(to_tsvector('spanish', coalesce(content_md, '')), 'B')
  ) stored,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_slug_format check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 1 and 80
  ),
  -- /[org]/[space]/editar/... es la ruta del editor.
  constraint pages_slug_not_reserved check (slug <> all (array['editar'])),
  constraint pages_not_own_parent check (parent_id is null or parent_id <> id),
  constraint pages_space_slug_key unique (space_id, slug),
  constraint pages_id_org_key unique (id, org_id),
  constraint pages_id_space_key unique (id, space_id),
  constraint pages_space_fkey
    foreign key (space_id, org_id) references public.spaces (id, org_id) on delete cascade,
  -- La página padre tiene que estar en el mismo espacio.
  constraint pages_parent_fkey
    foreign key (parent_id, space_id) references public.pages (id, space_id) on delete cascade
);

create index pages_space_parent_position_idx on public.pages (space_id, parent_id, position);
create index pages_org_id_idx on public.pages (org_id);
create index pages_search_idx on public.pages using gin (search);

-- ---------------------------------------------------------------------------
-- Adjuntos (archivo en el bucket privado "attachments")
-- ---------------------------------------------------------------------------
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  page_id uuid not null,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 200),
  mime_type text not null check (char_length(mime_type) between 3 and 100),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint attachments_page_fkey
    foreign key (page_id, org_id) references public.pages (id, org_id) on delete cascade,
  -- La ruta siempre es org_id/page_id/archivo.
  constraint attachments_storage_path_format check (
    storage_path like (org_id::text || '/' || page_id::text || '/%')
  )
);

create index attachments_page_id_idx on public.attachments (page_id);
create index attachments_org_id_idx on public.attachments (org_id);
