-- Peace Baptist — Supabase Storage for admin image uploads
-- Run in Supabase SQL Editor (church project: arqdowwawfjfypigwxhp)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-uploads',
  'site-uploads',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read site uploads" on storage.objects;
create policy "Public read site uploads"
  on storage.objects for select
  using (bucket_id = 'site-uploads');

drop policy if exists "Admins upload site images" on storage.objects;
create policy "Admins upload site images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'site-uploads'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins update site images" on storage.objects;
create policy "Admins update site images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'site-uploads'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins delete site images" on storage.objects;
create policy "Admins delete site images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'site-uploads'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );