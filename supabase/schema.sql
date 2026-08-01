create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.events (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  venue text not null,
  ticket_price numeric(10,2) not null default 0.00
    check (ticket_price >= 0),
  capacity integer not null check (capacity > 0),
  registration_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id bigint not null
    references public.events(id)
    on delete cascade,
  registration_code text unique not null,
  full_name text not null,
  email text not null,
  phone text not null,
  ticket_quantity integer not null default 1
    check (ticket_quantity between 1 and 6),
  unit_price numeric(10,2) not null default 0.00
    check (unit_price >= 0),
  total_price numeric(10,2)
    generated always as (ticket_quantity * unit_price) stored,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled')),
  checked_in boolean not null default false,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create unique index if not exists registrations_event_email_unique
  on public.registrations (event_id, lower(email));

create index if not exists registrations_event_id_index
  on public.registrations (event_id);

create index if not exists registrations_created_at_index
  on public.registrations (created_at desc);

create index if not exists admin_users_email_index
  on public.admin_users (lower(email));

insert into public.events (
  slug,
  name,
  description,
  event_date,
  start_time,
  end_time,
  venue,
  ticket_price,
  capacity,
  registration_open
)
values (
  'sat-chit-ananda-2026',
  'Sat-Chit-Ananda',
  'An Intimate Kirtan Gathering Session',
  '2026-08-14',
  '19:00:00',
  '21:00:00',
  'Granville Community Centre',
  0.00,
  350,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  venue = excluded.venue,
  ticket_price = excluded.ticket_price,
  capacity = excluded.capacity;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Admins can read their own profile"
  on public.admin_users;

create policy "Admins can read their own profile"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Approved admins can view registrations"
  on public.registrations;

create policy "Approved admins can view registrations"
on public.registrations
for select
to authenticated
using ((select private.is_admin()));

drop policy if exists "Approved admins can update registrations"
  on public.registrations;

create policy "Approved admins can update registrations"
on public.registrations
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create or replace function public.register_for_event(
  p_event_slug text,
  p_registration_code text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_ticket_quantity integer
)
returns table (
  registration_code text,
  full_name text,
  ticket_quantity integer,
  unit_price numeric,
  total_price numeric,
  event_name text,
  event_date date,
  venue text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_event public.events%rowtype;
  registered_tickets integer;
begin
  if p_ticket_quantity < 1 or p_ticket_quantity > 6 then
    raise exception 'INVALID_TICKET_QUANTITY';
  end if;

  select *
  into selected_event
  from public.events
  where slug = p_event_slug
  for update;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if selected_event.registration_open = false then
    raise exception 'REGISTRATION_CLOSED';
  end if;

  select coalesce(sum(r.ticket_quantity), 0)
  into registered_tickets
  from public.registrations r
  where r.event_id = selected_event.id
    and r.status = 'confirmed';

  if registered_tickets + p_ticket_quantity > selected_event.capacity then
    raise exception 'CAPACITY_EXCEEDED';
  end if;

  insert into public.registrations (
    event_id,
    registration_code,
    full_name,
    email,
    phone,
    ticket_quantity,
    unit_price
  )
  values (
    selected_event.id,
    p_registration_code,
    trim(p_full_name),
    lower(trim(p_email)),
    trim(p_phone),
    p_ticket_quantity,
    selected_event.ticket_price
  );

  return query
  select
    r.registration_code,
    r.full_name,
    r.ticket_quantity,
    r.unit_price,
    r.total_price,
    selected_event.name,
    selected_event.event_date,
    selected_event.venue
  from public.registrations r
  where r.registration_code = p_registration_code;
end;
$$;

revoke all on function public.register_for_event(
  text,
  text,
  text,
  text,
  text,
  integer
) from public, anon, authenticated;

grant execute on function public.register_for_event(
  text,
  text,
  text,
  text,
  text,
  integer
) to service_role;
