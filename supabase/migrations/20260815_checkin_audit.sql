alter table public.registrations
add column if not exists checked_in_at
timestamp with time zone;

alter table public.registrations
add column if not exists checked_in_by
text;