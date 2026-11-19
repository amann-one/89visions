-- Bucket List – Umstellung auf Multi-User
-- Einmalig im Supabase Dashboard unter "SQL Editor" ausführen (nach schema.sql).
-- Mehrfaches Ausführen ist unschädlich.
--
-- Danach gilt:
--   * Jeder Eintrag und jedes Foto gehört genau einem Konto (user_id).
--   * Jeder sieht und ändert nur seine eigenen Daten (Row Level Security).
--   * Bilder liegen unter <user-id>/<item-id>/... im Storage-Bucket.
--   * Bereits vorhandene Einträge gehören dem ERSTEN Konto, das sich registriert.

-- ---------------------------------------------------------------------------
-- 1. Besitzer-Spalten
-- ---------------------------------------------------------------------------

alter table public.items
  add column if not exists user_id uuid references auth.users (id) on delete cascade
  default auth.uid();

alter table public.photos
  add column if not exists user_id uuid references auth.users (id) on delete cascade
  default auth.uid();

create index if not exists items_user_idx  on public.items (user_id);
create index if not exists photos_user_idx on public.photos (user_id);

-- ---------------------------------------------------------------------------
-- 2. Bestehende Daten dem ersten Konto zuweisen
--    (Einträge ohne user_id bleiben bis dahin für niemanden sichtbar.)
-- ---------------------------------------------------------------------------

create or replace function public.claim_legacy_data()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from auth.users) = 1 then
    update public.items  set user_id = new.id where user_id is null;
    update public.photos set user_id = new.id where user_id is null;
  end if;
  return new;
end;
$$;

drop trigger if exists claim_legacy_data_on_signup on auth.users;
create trigger claim_legacy_data_on_signup
  after insert on auth.users
  for each row execute function public.claim_legacy_data();

-- Falls schon Konten existieren: Altbestand dem ältesten Konto geben.
update public.items
  set user_id = (select id from auth.users order by created_at limit 1)
  where user_id is null and exists (select 1 from auth.users);
update public.photos
  set user_id = (select id from auth.users order by created_at limit 1)
  where user_id is null and exists (select 1 from auth.users);

-- ---------------------------------------------------------------------------
-- 3. Row Level Security: nur eigene Zeilen
-- ---------------------------------------------------------------------------

drop policy if exists "items anon all" on public.items;
drop policy if exists "items own rows" on public.items;
create policy "items own rows"
  on public.items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "photos anon all" on public.photos;
drop policy if exists "photos own rows" on public.photos;
create policy "photos own rows"
  on public.photos for all
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.items i
      where i.id = item_id and i.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Storage: Hochladen/Ändern/Löschen nur im eigenen Ordner
--    Lesen bleibt öffentlich (die URLs sind nicht erratbar), damit Bilder
--    ohne Token angezeigt werden können.
-- ---------------------------------------------------------------------------

drop policy if exists "bucket list anon upload" on storage.objects;
drop policy if exists "bucket list own upload" on storage.objects;
create policy "bucket list own upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'bucket-list'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "bucket list anon update" on storage.objects;
drop policy if exists "bucket list own update" on storage.objects;
create policy "bucket list own update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'bucket-list'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'bucket-list'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Löschen: eigener Ordner ODER ein Altbild (ohne user-id-Ordner), das zu einem
-- eigenen Foto gehört.
drop policy if exists "bucket list anon delete" on storage.objects;
drop policy if exists "bucket list own delete" on storage.objects;
create policy "bucket list own delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'bucket-list'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.photos p
        where p.user_id = auth.uid()
          and (
            p.storage_path = name
            or replace(p.storage_path, '.jpg', '-thumb.jpg') = name
          )
      )
    )
  );
