-- Peace Baptist — verify database after transfer to church-owned Supabase org
-- Run in Supabase → SQL Editor on project arqdowwawfjfypigwxhp (or new ref after Option B)

-- 1) Project identity (note the URL in dashboard — should match Vercel SUPABASE_URL)
select current_database() as database_name;

-- 2) Table row counts (compare before/after transfer; should match)
select 'ministries' as table_name, count(*) as rows from public.ministries
union all select 'events', count(*) from public.events
union all select 'testimonials', count(*) from public.testimonials
union all select 'prayer_requests', count(*) from public.prayer_requests
union all select 'contact_messages', count(*) from public.contact_messages
union all select 'form_submissions', count(*) from public.form_submissions
union all select 'media_items', count(*) from public.media_items
union all select 'giving_records', count(*) from public.giving_records
union all select 'profiles', count(*) from public.profiles
order by table_name;

-- 3) Admin users (church staff should appear here with role = admin)
select u.email, u.created_at, p.role, p.full_name
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;

-- 4) Recent prayer requests (sanity check live data)
select id, category, is_anonymous, created_date
from public.prayer_requests
order by created_date desc
limit 5;