-- Bucket List – Supabase schema
-- Ausführen im Supabase Dashboard unter "SQL Editor" (einmalig, komplett einfügen).

-- ---------------------------------------------------------------------------
-- 1. Tabellen
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create table if not exists public.items (
  id           uuid primary key default gen_random_uuid(),
  title        text        not null,
  note         text,
  category     text        not null default 'travel',
  status       text        not null default 'idea',
  target_date  date,
  completed_at timestamptz,
  place_name   text,
  cost_target  numeric(12, 2),
  cost_saved   numeric(12, 2) not null default 0,
  rating       smallint,
  is_favorite  boolean     not null default false,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  constraint items_status_check check (status in ('idea', 'planned', 'done')),
  constraint items_rating_check check (rating is null or (rating >= 1 and rating <= 5))
);

create table if not exists public.photos (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references public.items (id) on delete cascade,
  url          text not null,
  thumb_url    text not null,
  storage_path text not null,
  width        integer,
  height       integer,
  created_at   timestamptz not null default now()
);

create index if not exists items_status_idx      on public.items (status) where deleted_at is null;
create index if not exists items_category_idx    on public.items (category) where deleted_at is null;
create index if not exists items_completed_idx   on public.items (completed_at desc);
create index if not exists photos_item_id_idx    on public.photos (item_id, created_at);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security
--
-- ACHTUNG: Diese Policies sind absichtlich offen und nur die Ausgangsbasis.
-- Die App nutzt Anmeldung pro Nutzer: Führe direkt danach
-- supabase/migration-multi-user.sql aus. Sie ergänzt user_id-Spalten, ersetzt
-- die offenen Policies durch "nur eigene Daten" und sichert den Storage ab.
-- ---------------------------------------------------------------------------

alter table public.items  enable row level security;
alter table public.photos enable row level security;

drop policy if exists "items anon all" on public.items;
create policy "items anon all"
  on public.items for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "photos anon all" on public.photos;
create policy "photos anon all"
  on public.photos for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 3. Storage-Bucket für die Bilder
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('bucket-list', 'bucket-list', true)
on conflict (id) do update set public = true;

drop policy if exists "bucket list public read" on storage.objects;
create policy "bucket list public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'bucket-list');

drop policy if exists "bucket list anon upload" on storage.objects;
create policy "bucket list anon upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'bucket-list');

drop policy if exists "bucket list anon update" on storage.objects;
create policy "bucket list anon update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'bucket-list')
  with check (bucket_id = 'bucket-list');

drop policy if exists "bucket list anon delete" on storage.objects;
create policy "bucket list anon delete"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'bucket-list');
