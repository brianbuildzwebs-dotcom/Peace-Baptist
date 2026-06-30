-- Fix profiles_role_check when Step 3 fails.
-- Run each section in Supabase SQL Editor.

-- A) See what role values exist right now
select role, count(*) as rows
from public.profiles
group by role
order by rows desc;

-- B) Drop any old role constraints
alter table public.profiles drop constraint if exists profiles_role_check;

-- C) Force every row to a valid value
update public.profiles set role = 'user' where role is distinct from 'admin';

-- D) Make sure column allows text + default
alter table public.profiles alter column role set default 'user';

-- E) Add constraint (should succeed now)
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

-- F) Confirm
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.profiles'::regclass
  and conname = 'profiles_role_check';