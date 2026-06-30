-- Promote Peace Baptist church staff to admin (run after transfer to church-owned account)
-- Prerequisite: Authentication → Users → Add user (church email + password, Auto Confirm)

-- Fix role constraint if needed
alter table public.profiles drop constraint if exists profiles_role_check;

update public.profiles
set role = 'user'
where role is null
   or role not in ('user', 'admin');

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists created_date timestamptz default now();

-- ── Change this email to church staff ────────────────────────────────────────
-- Recommended: peacebible@bellsouth.net

update public.profiles p
set
  role = 'admin',
  email = coalesce(p.email, u.email),
  full_name = coalesce(p.full_name, 'Peace Baptist Admin')
from auth.users u
where p.id = u.id
  and u.email = 'peacebible@bellsouth.net';

insert into public.profiles (id, role, email, full_name)
select u.id, 'admin', u.email, 'Peace Baptist Admin'
from auth.users u
where u.email = 'peacebible@bellsouth.net'
  and not exists (select 1 from public.profiles p where p.id = u.id);

-- Optional: demote developer test account after church admin works
-- update public.profiles p
-- set role = 'user'
-- from auth.users u
-- where p.id = u.id and u.email = 'brianbuildzwebs@gmail.com';

-- Verify
select u.email, p.role, p.full_name
from auth.users u
left join public.profiles p on p.id = u.id
where u.email in ('peacebible@bellsouth.net', 'brianbuildzwebs@gmail.com', 'peacebaptist320@gmail.com')
order by u.email;