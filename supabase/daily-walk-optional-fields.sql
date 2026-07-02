-- Allow optional devotion fields (only date is required)
-- Run in Supabase SQL Editor on the church project

alter table public.daily_devotions
  alter column scripture_reference drop not null,
  alter column scripture_text drop not null,
  alter column message drop not null,
  alter column author drop not null;