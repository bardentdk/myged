-- ============================================================
-- Mar'my GED — Schéma Supabase
-- ============================================================

-- Extension pour UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles (étend auth.users)
-- ============================================================
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  role        text not null default 'Assistant admin',
  color       text not null default '#64748b',
  avatar_url  text,
  twofa       boolean default false,
  active      boolean default true,
  last_login  timestamptz,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profils visibles par tous les membres"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Chaque utilisateur peut modifier son profil"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- Dossiers
-- ============================================================
create table public.folders (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  kind        text not null,
  parent_id   uuid references public.folders(id),
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

alter table public.folders enable row level security;

create policy "Dossiers visibles par les membres"
  on public.folders for select
  using (auth.role() = 'authenticated');

create policy "Membres authentifiés peuvent créer des dossiers"
  on public.folders for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Documents
-- ============================================================
create table public.documents (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null,
  type            text not null check (type in ('pdf','doc','xls','img','zip','sig')),
  folder_id       uuid references public.folders(id),
  folder_path     text,
  size            text,
  version         text default '1.0',
  status          text default 'draft' check (status in ('draft','review','pending','validated','rejected','archived','expiring','expired')),
  owner_id        uuid references public.profiles(id),
  updated_by      uuid references public.profiles(id),
  confidential    text default 'Interne' check (confidential in ('Public','Interne','Confidentiel')),
  expires_at      date,
  tags            text[] default '{}',
  storage_path    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Documents visibles par les membres"
  on public.documents for select
  using (auth.role() = 'authenticated');

create policy "Création de documents"
  on public.documents for insert
  with check (auth.role() = 'authenticated');

create policy "Modification de documents"
  on public.documents for update
  using (auth.role() = 'authenticated');

-- ============================================================
-- Versions de documents
-- ============================================================
create table public.document_versions (
  id          uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade,
  version     text not null,
  author_id   uuid references public.profiles(id),
  note        text,
  size        text,
  milestone   boolean default false,
  storage_path text,
  created_at  timestamptz default now()
);

alter table public.document_versions enable row level security;

create policy "Versions visibles par les membres"
  on public.document_versions for select
  using (auth.role() = 'authenticated');

create policy "Création de versions"
  on public.document_versions for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Verrouillage de documents (Realtime)
-- ============================================================
create table public.document_locks (
  id          uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade unique,
  locked_by   uuid references public.profiles(id),
  locked_at   timestamptz default now(),
  expires_at  timestamptz default (now() + interval '2 hours')
);

alter table public.document_locks enable row level security;

create policy "Verrous visibles par les membres"
  on public.document_locks for select
  using (auth.role() = 'authenticated');

create policy "Créer un verrou"
  on public.document_locks for insert
  with check (auth.uid() = locked_by);

create policy "Supprimer son propre verrou"
  on public.document_locks for delete
  using (auth.uid() = locked_by);

-- Nettoie les verrous expirés automatiquement
create or replace function cleanup_expired_locks()
returns void language sql as $$
  delete from public.document_locks where expires_at < now();
$$;

-- ============================================================
-- Commentaires
-- ============================================================
create table public.comments (
  id          uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade,
  author_id   uuid references public.profiles(id),
  text        text not null,
  resolved    boolean default false,
  created_at  timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Commentaires visibles par les membres"
  on public.comments for select
  using (auth.role() = 'authenticated');

create policy "Ajouter un commentaire"
  on public.comments for insert
  with check (auth.uid() = author_id);

-- ============================================================
-- Journal d'activité
-- ============================================================
create table public.activity_log (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id),
  action      text not null,
  document_id uuid references public.documents(id),
  document_name text,
  metadata    jsonb default '{}',
  ip_address  text,
  created_at  timestamptz default now()
);

alter table public.activity_log enable row level security;

create policy "Journal visible par les admins et responsables"
  on public.activity_log for select
  using (auth.role() = 'authenticated');

create policy "Écriture journal"
  on public.activity_log for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Notifications
-- ============================================================
create table public.notifications (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text not null,
  icon        text,
  title       text not null,
  body        text,
  from_user   uuid references public.profiles(id),
  document_id uuid references public.documents(id),
  read        boolean default false,
  created_at  timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Notifications personnelles"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Créer une notification"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

create policy "Marquer comme lue"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ============================================================
-- Indicateurs Qualiopi
-- ============================================================
create table public.qualiopi_indicators (
  id          uuid default uuid_generate_v4() primary key,
  num         integer not null unique,
  label       text not null,
  status      text default 'warn' check (status in ('ok','warn','err','review')),
  docs        integer default 0,
  total       integer default 0,
  responsible uuid references public.profiles(id),
  updated_at  timestamptz default now()
);

alter table public.qualiopi_indicators enable row level security;

create policy "Indicateurs visibles par les membres"
  on public.qualiopi_indicators for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Modèles de documents
-- ============================================================
create table public.templates (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  category    text not null,
  type        text not null,
  version     text default '1.0',
  description text,
  uses        integer default 0,
  storage_path text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.templates enable row level security;

create policy "Modèles visibles par les membres"
  on public.templates for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Activer Realtime sur les tables critiques
-- ============================================================
alter publication supabase_realtime add table public.document_locks;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.documents;
