-- Peace Baptist Church — Supabase schema
-- Run in Supabase Dashboard → SQL Editor → New query → Run
--
-- AFTER running this schema:
-- 1. Supabase → Authentication → Users → Add user (admin email + password)
-- 2. Run: update public.profiles set role = 'admin' where email = 'your-admin@email.com';

-- Profiles (extends auth.users for admin role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_date timestamptz not null default now()
);

-- If profiles already existed from an older Supabase template, fix role constraint + columns.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists created_date timestamptz default now();

update public.profiles
set role = 'user'
where role is null or role not in ('user', 'admin');

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

alter table public.profiles enable row level security;

create policy "Profiles readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  title text not null,
  description text,
  date date,
  time text,
  end_time text,
  location text,
  image_url text,
  category text,
  status text not null default 'upcoming',
  rsvp_enabled boolean default true,
  form_id text,
  featured boolean default false,
  max_attendees int
);

-- Ministries
create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  name text not null,
  description text not null,
  leader text,
  image_url text,
  meeting_time text,
  form_id text,
  status text not null default 'active'
);

-- Contact messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new'
);

-- Prayer requests
create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  name text,
  email text,
  request text not null,
  category text not null,
  is_anonymous boolean default false,
  is_public boolean default false,
  status text not null default 'new',
  admin_notes text,
  prayed_count int default 0
);

-- Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  name text not null,
  quote text not null,
  role text,
  image_url text,
  featured boolean default true
);

-- Media items
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  title text not null,
  description text,
  type text not null default 'sermon',
  video_url text,
  thumbnail_url text,
  speaker text,
  series text,
  date date,
  duration text,
  scripture text,
  featured boolean default false
);

-- Site settings (key-value)
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  key text not null unique,
  value text not null default '',
  label text
);

-- Custom forms
create table if not exists public.custom_forms (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  title text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  form_type text default 'general'
);

-- Form submissions
create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  form_id text not null,
  form_title text,
  event_id text,
  data jsonb not null default '{}'::jsonb,
  submitter_name text,
  submitter_email text,
  signature_url text
);

-- Giving records
create table if not exists public.giving_records (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  amount numeric,
  donor_name text,
  donor_email text,
  fund text,
  method text,
  notes text,
  status text default 'completed'
);

-- Seed ministries
insert into public.ministries (name, description, leader, meeting_time, image_url, status)
values
  (
    'Sunday School',
    'Bible-centered classes for all ages before morning worship. A great way to grow in Scripture and fellowship.',
    'Church Staff',
    'Sundays at 9:30 AM',
    '/images/hero-sanctuary.jpg',
    'active'
  ),
  (
    'Youth Ministry',
    'Teaching and activities for young people to grow in faith, build friendships, and serve the Lord.',
    'Youth Leaders',
    'Sunday & Wednesday',
    '/images/youth-ministry.jpg',
    'active'
  ),
  (
    'Nursery',
    'A safe, caring environment for infants and toddlers during worship services so families can attend with peace of mind.',
    'Nursery Volunteers',
    'During all services',
    '/images/nursery.jpg',
    'active'
  ),
  (
    'Soul Winning & Outreach',
    'Door-to-door visitation, community outreach, and sharing the Gospel throughout Wilmington and beyond.',
    'Pastor Rudy Shepard',
    'Ongoing',
    '/images/church-exterior.jpg',
    'active'
  ),
  (
    'Bus Ministry',
    'Transportation ministry helping families and individuals attend church services.',
    'Bus Captain',
    'Sundays',
    '/images/church-building.jpg',
    'active'
  )
;

-- Seed recurring-style events (edit dates in admin as needed)
insert into public.events (title, description, date, time, location, category, status, featured)
values
  (
    'Sunday Morning Worship',
    'Join us for dynamic, King James Bible preaching and congregational worship.',
    (current_date + ((7 - extract(dow from current_date)::int) % 7) * interval '1 day')::date,
    '10:30 AM',
    '320 Military Cutoff Rd, Wilmington, NC',
    'worship',
    'upcoming',
    true
  ),
  (
    'Sunday Evening Service',
    'Evening worship and preaching for the whole church family.',
    (current_date + ((7 - extract(dow from current_date)::int) % 7) * interval '1 day')::date,
    '6:00 PM',
    '320 Military Cutoff Rd, Wilmington, NC',
    'worship',
    'upcoming',
    false
  ),
  (
    'Wednesday Bible Study',
    'Mid-week Bible study and prayer meeting.',
    (current_date + ((3 - extract(dow from current_date)::int + 7) % 7) * interval '1 day')::date,
    '7:00 PM',
    '320 Military Cutoff Rd, Wilmington, NC',
    'study',
    'upcoming',
    false
  )
;

-- Seed testimonials
insert into public.testimonials (name, quote, role, featured)
values
  (
    'Longtime Member',
    'Peace Baptist has been our church home for years. The preaching is faithful, the people are genuine, and our children have grown up loving the Lord here.',
    'Wilmington, NC',
    true
  ),
  (
    'Church Family',
    'From the moment we visited, we felt welcomed. The King James preaching strengthened our faith and this congregation became our extended family.',
    'Member',
    true
  ),
  (
    'Youth Parent',
    'Pastor Shepard''s preaching is powerful and biblical. The youth ministry has been a blessing for our teenagers. This church lives what it teaches.',
    'Member',
    true
  )
;