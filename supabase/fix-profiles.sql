-- Fix an existing Supabase starter "profiles" table for Peace Baptist admin login.
-- Run in SQL Editor on your Peace Baptist Supabase project.
-- To change admin login later, use set-admin.sql instead.

-- 1) See what you have
select table_schema, table_name
from information_schema.tables
where table_name = 'profiles'
order by table_schema;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- 2) Fix legacy role constraint (old Supabase templates use different allowed values)
alter table public.profiles drop constraint if exists profiles_role_check;

update public.profiles
set role = 'user'
where role is null or role not in ('user', 'admin');

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

-- 3) Add columns our app expects (safe if they already exist)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists created_date timestamptz default now();

update public.profiles p
set
  email = coalesce(p.email, u.email),
  full_name = coalesce(p.full_name, split_part(u.email, '@', 1)),
  role = coalesce(p.role, 'user'),
  created_date = coalesce(p.created_date, now())
from auth.users u
where p.id = u.id;

-- 3) Create profile rows for auth users that do not have one yet
insert into public.profiles (id, email, full_name, role, created_date)
select
  u.id,
  u.email,
  split_part(u.email, '@', 1),
  'user',
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 4) Promote church admin (run AFTER creating user in Authentication → Users)
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.email = 'YOUR_ADMIN_EMAIL';

-- 5) Verify
select
  (select count(*) from public.ministries) as ministries,
  (select count(*) from public.events) as events,
  (select count(*) from public.testimonials) as testimonials,
  u.email,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'YOUR_ADMIN_EMAIL';