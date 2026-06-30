-- Update Youth Ministry card image (run once in Supabase SQL editor)
update public.ministries
set image_url = '/images/youth-ministry.jpg'
where name = 'Youth Ministry';