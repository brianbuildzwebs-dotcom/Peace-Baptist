-- Scheduled Daily Walk publish times (Eastern hour/minute on devotion_date)
-- Run in Supabase SQL Editor on the church project

alter table public.daily_devotions
  add column if not exists publish_hour int,
  add column if not exists publish_minute int default 0;

alter table public.daily_devotions drop constraint if exists daily_devotions_status_check;
alter table public.daily_devotions
  add constraint daily_devotions_status_check
  check (status in ('draft', 'scheduled', 'published'));