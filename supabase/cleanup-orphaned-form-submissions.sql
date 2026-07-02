-- Remove orphaned form submissions
-- Run in Supabase SQL Editor on the church project

-- 1) Custom form deleted but submissions remain
delete from public.form_submissions fs
where fs.form_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and not exists (
    select 1 from public.custom_forms cf where cf.id::text = fs.form_id
  );

-- 2) Event deleted but RSVP/sign-up submissions remain
delete from public.form_submissions fs
where fs.event_id is not null
  and fs.event_id <> ''
  and not exists (
    select 1 from public.events e where e.id::text = fs.event_id
  );

-- Optional: remove ALL event RSVP/sign-up test rows (uncomment if needed)
-- delete from public.form_submissions where form_id like 'default_%';

-- Verify orphans (should return 0 rows)
select fs.id, fs.form_id, fs.form_title, fs.event_id, fs.created_date
from public.form_submissions fs
where (
  fs.form_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and not exists (select 1 from public.custom_forms cf where cf.id::text = fs.form_id)
) or (
  fs.event_id is not null
  and fs.event_id <> ''
  and not exists (select 1 from public.events e where e.id::text = fs.event_id)
);