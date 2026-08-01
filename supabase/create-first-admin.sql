-- STEP 1:
-- In Supabase Dashboard, open Authentication > Users.
-- Choose "Add user" and create:
-- Email: Samir.m.raut72@gmail.com
-- Password: choose a strong private password
-- Enable "Auto Confirm User".

-- STEP 2:
-- Copy the new user's UUID and replace YOUR_AUTH_USER_UUID below.

insert into public.admin_users (
  user_id,
  email,
  display_name
)
values (
  'YOUR_AUTH_USER_UUID',
  'Samir.m.raut72@gmail.com',
  'Sameer Raut'
)
on conflict (user_id) do update set
  email = excluded.email,
  display_name = excluded.display_name;
