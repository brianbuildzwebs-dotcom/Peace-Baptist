-- Remove form submissions whose custom form was deleted
-- Run in Supabase SQL Editor on the church project

delete from public.form_submissions fs
where fs.form_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and not exists (
    select 1 from public.custom_forms cf where cf.id::text = fs.form_id
  );

-- Verify (should return 0 rows)
select fs.id, fs.form_id, fs.form_title, fs.created_date
from public.form_submissions fs
where fs.form_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and not exists (
    select 1 from public.custom_forms cf where cf.id::text = fs.form_id
  );