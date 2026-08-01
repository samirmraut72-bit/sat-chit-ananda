# Sat-Chit-Ananda Production Build

This is the database-connected version of the approved demo.

## Included

- Premium public event website
- Public registration without attendee login
- Permanent Supabase registration storage
- Capacity enforcement at 350 attendees
- Maximum six places per registration
- Duplicate email prevention
- Free ticket value of `$0.00`
- Supabase email/password admin authentication
- Approved-admin database privileges
- Protected registration dashboard
- Search, check-in and undo check-in
- CSV attendee export
- Secure sign-out
- Row Level Security policies

## Security design

- Attendees never receive database credentials.
- The Supabase secret key is used only by the server registration route.
- The secret key must never use a `NEXT_PUBLIC_` prefix.
- Admin sessions use Supabase Auth cookies.
- `proxy.js` refreshes authentication cookies.
- Every protected page and API operation verifies the signed-in user again.
- Row Level Security allows registration access only to users listed in
  `public.admin_users`.
- There is no public admin signup page.

## 1. Install software

Install Node.js 20.9 or later, Git and Visual Studio Code.

Open PowerShell in this folder and run:

```powershell
npm install
```

## 2. Create Supabase project

Create a new Supabase project.

Open **SQL Editor**, paste the complete contents of:

```text
supabase/schema.sql
```

Run the query.

This creates the event, registration system, admin list, database function,
capacity protection and security policies.

## 3. Create the first admin account

Open:

```text
Supabase Dashboard
Authentication
Users
Add user
```

Create:

```text
Email: Samir.m.raut72@gmail.com
Password: choose a strong private password
Auto Confirm User: enabled
```

Copy the user's UUID.

Open:

```text
supabase/create-first-admin.sql
```

Replace:

```text
YOUR_AUTH_USER_UUID
```

with the copied UUID, then run the SQL in Supabase SQL Editor.

Only users present in `public.admin_users` receive dashboard access.

## 4. Add environment variables

Copy:

```text
.env.example
```

to:

```text
.env.local
```

In Supabase, open the project's **Connect** or **API Keys** section and enter:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
SUPABASE_SECRET_KEY=sb_secret_YOUR_SECRET_KEY
```

Never commit `.env.local`.

Never expose `SUPABASE_SECRET_KEY` in browser code.

## 5. Start locally

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin login:

```text
http://localhost:3000/admin/login
```

## 6. Test

### Public test

1. Open `/register`.
2. Submit a real test registration.
3. Confirm the registration code appears.
4. Register again with the same email and confirm it is blocked.

### Admin test

1. Open `/admin`.
2. Sign in using the admin account created in Supabase.
3. Confirm the test attendee appears.
4. Search for the attendee.
5. Mark the attendee as checked in.
6. Undo check-in.
7. Export the CSV.
8. Sign out.
9. Confirm `/admin` returns to the login screen.

### Permission test

Create another Supabase Auth user but do not insert that UUID into
`public.admin_users`. That account must not receive dashboard access.

## 7. Deploy to Vercel

1. Upload the project to a private or public GitHub repository.
2. Import the repository into Vercel.
3. Add all three environment variables in Vercel Project Settings.
4. Deploy.
5. Test registration and admin login on the deployed address.

After changing environment variables, redeploy.

## Adding another admin

Create the person in Supabase Authentication, copy their UUID and run:

```sql
insert into public.admin_users (
  user_id,
  email,
  display_name
)
values (
  'THEIR_AUTH_USER_UUID',
  'their@email.com',
  'Their Name'
);
```

## Removing admin access

```sql
delete from public.admin_users
where email = 'their@email.com';
```

Their Auth account may still exist, but the database policies and dashboard
will deny access.

## Before the public launch

Recommended next additions:

- Confirmation email through Resend
- Cloudflare Turnstile or another anti-bot control
- Privacy policy page
- Artist photographs
- Venue map and transport details
- Password-reset flow for admins
- Optional multi-factor authentication for admin accounts
