-- Set (or change) the Peace Baptist admin login user.
-- Run in Supabase → SQL Editor (one block at a time if needed).
--
-- Prerequisite: Authentication → Users → Add user (email + password, Auto Confirm)

-- ── Step 1: Fix legacy role constraint (run this first) ─────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;

update public.profiles
set role = 'user'
where role is null
   or role not in ('user', 'admin');

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

-- ── Step 2: Ensure columns our app uses ─────────────────────────────────────
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists created_date timestamptz default now();

-- ── Step 3: Grant admin (change email below) ────────────────────────────────
update public.profiles p
set
  role = 'admin',
  email = coalesce(p.email, u.email),
  full_name = coalesce(p.full_name, split_part(u.email, '@', 1))
from auth.users u
where p.id = u.id
  and u.email = 'brianbuildzwebs@gmail.com';

-- If Step 3 says "0 rows", the user has no profile row yet — run this instead:
insert into public.profiles (id, role, email, full_name)
select u.id, 'admin', u.email, split_part(u.email, '@', 1)
from auth.users u
where u.email = 'brianbuildzwebs@gmail.com'
  and not exists (select 1 from public.profiles p where p.id = u.id);

-- Optional: demote old admin
-- update public.profiles p
-- set role = 'user'
-- from auth.users u
-- where p.id = u.id and u.email = 'peacebaptist320@gmail.com';

-- ── Step 4: Verify ──────────────────────────────────────────────────────────
select u.email, p.role, p.full_name
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'brianbuildzwebs@gmail.com';