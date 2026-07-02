-- Peace Baptist — Daily Walk + Web Push subscriptions
-- Run in Supabase SQL Editor on the church project (arqdowwawfjfypigwxhp)

-- Daily devotions (App Institute "Daily Walk" replacement)
create table if not exists public.daily_devotions (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  devotion_date date not null,
  title text,
  scripture_reference text not null,
  scripture_text text not null,
  message text not null,
  author text not null default 'Pastor Rudy Shepard',
  status text not null default 'published' check (status in ('draft', 'scheduled', 'published')),
  publish_hour int,
  publish_minute int default 0,
  notification_sent_at timestamptz,
  unique (devotion_date)
);

create index if not exists daily_devotions_date_idx on public.daily_devotions (devotion_date desc);

-- Web push subscriber endpoints (server-managed via service role)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  topics text[] not null default array['daily_walk', 'prayer', 'live'],
  user_agent text
);

create index if not exists push_subscriptions_topics_idx on public.push_subscriptions using gin (topics);

-- Optional: default notification time (7:00 AM Eastern)
insert into public.site_settings (key, value, label)
values ('daily_walk_notify_hour', '7', 'Daily Walk push hour (Eastern)')
on conflict (key) do nothing;