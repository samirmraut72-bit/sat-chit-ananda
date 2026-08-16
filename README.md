<div align="center">

# 🎵 Sat-Chit-Ananda Event Platform

### Full-stack event registration & administration system

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

A production-focused event platform built for **Sat-Chit-Ananda**, combining a public event website with secure registration storage and an authenticated administration workflow.

</div>

---

## ✨ Project Highlights

| Area | Implementation |
|---|---|
| 🌐 Public experience | Responsive event website and registration flow |
| 🗃️ Data layer | Permanent Supabase registration storage |
| 👥 Capacity | Event capacity enforcement for 350 attendees |
| 🔐 Admin security | Supabase Auth + approved-admin database access |
| 📋 Operations | Registration dashboard, search and attendee management |
| ✅ Check-in | Check-in and undo check-in workflow |
| 📤 Reporting | CSV attendee export |
| 🛡️ Database security | Row Level Security policies |
| ☁️ Deployment | Vercel-ready Next.js application |

## 🏗️ Architecture

```text
Visitor
   │
   ▼
Next.js Public Website
   │
   ├── Registration Flow
   │        │
   │        ▼
   │    Server Route
   │        │
   │        ▼
   │     Supabase
   │
   └── Admin Login
            │
            ▼
      Protected Dashboard
            │
            ▼
       Supabase Auth + RLS
```

## 🔐 Security Design

The application was designed so privileged database credentials are not exposed to attendees or browser-side code.

- Attendees never receive database credentials.
- The Supabase secret key is used only by server-side registration logic.
- Secret values are never given a `NEXT_PUBLIC_` prefix.
- Admin sessions use Supabase authentication cookies.
- Protected pages and API operations verify the signed-in user.
- Row Level Security restricts registration data to approved administrators.
- There is no public admin-signup page.

## 🧩 Core Features

- Premium public event website
- Public registration without attendee accounts
- Supabase-backed registration storage
- Capacity enforcement
- Maximum six places per registration
- Duplicate-email prevention
- Secure administrator authentication
- Protected registration dashboard
- Attendee search
- Check-in / undo check-in
- CSV attendee export
- Secure sign-out
- Row Level Security policies

## 🛠️ Technology Stack

**Frontend / Application**

`Next.js` · `JavaScript` · `React`

**Backend / Data**

`Supabase` · `PostgreSQL` · `Supabase Auth` · `Row Level Security`

**Deployment**

`Vercel` · `GitHub`

## 🚀 Local Setup

### 1. Install dependencies

Requires Node.js 20.9+.

```powershell
npm install
```

### 2. Configure Supabase

Run the database schema from:

```text
supabase/schema.sql
```

### 3. Configure environment variables

Copy:

```text
.env.example
```

to:

```text
.env.local
```

Then configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
SUPABASE_SECRET_KEY=sb_secret_YOUR_SECRET_KEY
```

> Never commit `.env.local` or expose the Supabase secret key in browser code.

### 4. Start locally

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🧪 Validation Workflow

Public flow testing includes:

- submitting a registration
- confirming capacity behaviour
- confirming duplicate-email prevention

Admin testing includes:

- authenticated dashboard access
- attendee search
- check-in and undo check-in
- CSV export
- sign-out and access protection

Permission testing confirms that a Supabase Auth user who is **not** listed in `public.admin_users` cannot access protected registration data.

## ☁️ Deployment

The application is designed for deployment through Vercel using GitHub as the source repository and Supabase as the backend platform.

Production environment variables must be configured securely in Vercel and never committed to source control.

## 🔭 Ongoing Development

The platform is being iterated as operational requirements evolve. Future or production-stage improvements can include stronger anti-bot controls, privacy tooling, additional admin security and expanded attendee-management workflows.

---

<div align="center">

### Skills Demonstrated

**Next.js · React · JavaScript · Supabase · PostgreSQL · Authentication · Row Level Security · Event Operations · Full-Stack Development · Deployment**

**Built by Sameer Raut**

</div>
