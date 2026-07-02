-- Event sign-up toggle + announcement field
-- Run in Supabase SQL Editor on the church project

alter table public.events
  add column if not exists sign_up_enabled boolean default false,
  add column if not exists announcement text;