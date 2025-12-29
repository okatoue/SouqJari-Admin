# SouqJari Admin Panel - Setup Documentation

This document covers the complete setup and configuration of the SouqJari Admin Panel.

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [Role-Based Permissions](#role-based-permissions)
7. [Environment Configuration](#environment-configuration)
8. [Supabase Server Configuration](#supabase-server-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The SouqJari Admin Panel is a Next.js 14 application that provides administrative functionality for the SouqJari marketplace. It connects to a self-hosted Supabase instance at `api.souqjari.com`.

**Key Features:**
- Email/password authentication for admins
- Role-based access control (super_admin, admin, moderator)
- Protected dashboard routes
- Sidebar navigation with role-based visibility

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.28 | React framework with App Router |
| React | 18.3.x | UI library |
| TypeScript | 5.6.x | Type safety |
| Tailwind CSS | 3.4.x | Styling |
| shadcn/ui | - | UI components |
| @supabase/ssr | 0.5.x | Supabase SSR client |
| @supabase/supabase-js | 2.45.x | Supabase JS client |
| React Hook Form | 7.53.x | Form handling |
| Zod | 3.23.x | Schema validation |
| TanStack Query | 5.56.x | Data fetching |
| Lucide React | 0.468.x | Icons |

---

## Project Structure

```
souqjari-admin/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── layout.tsx            # Auth layout (centered)
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Dashboard home
│   │   ├── reports/page.tsx      # Reports management
│   │   ├── listings/page.tsx     # Listings moderation
│   │   ├── users/page.tsx        # User management
│   │   ├── feedback/page.tsx     # User feedback
│   │   └── settings/page.tsx     # Admin settings (restricted)
│   ├── api/auth/callback/
│   │   └── route.ts              # OAuth callback handler
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + CSS variables
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── tooltip.tsx
│   ├── layout/
│   │   ├── Header.tsx            # Page header with user menu
│   │   ├── NavItem.tsx           # Navigation item component
│   │   ├── Sidebar.tsx           # Main sidebar navigation
│   │   └── UserMenu.tsx          # User dropdown menu
│   └── auth/
│       └── LoginForm.tsx         # Login form component
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Middleware helpers
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Utility functions (cn helper)
├── hooks/
│   ├── useAdminAuth.ts           # Admin authentication hook
│   ├── usePermissions.ts         # Permission checking hook
│   └── use-toast.ts              # Toast notifications
├── types/
│   └── index.ts                  # TypeScript type definitions
├── middleware.ts                 # Next.js middleware for auth
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment (gitignored)
└── docs/
    └── SETUP.md                  # This file
```

---

## Database Schema

### admin_users Table

The `admin_users` table stores admin user information and roles.

```sql
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'moderator'
        CHECK (role IN ('super_admin', 'admin', 'moderator')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    appointed_by UUID REFERENCES public.admin_users(id),
    appointed_at TIMESTAMPTZ DEFAULT NOW(),
    last_action_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_admin_user UNIQUE (user_id)
);
```

**Important:** The table uses `user_id` (not `id`) to reference the auth.users table. All queries must use `.eq('user_id', user.id)`.

### Row Level Security (RLS)

RLS must be enabled with the following policy:

```sql
-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own admin record
CREATE POLICY "Users can read own admin record"
ON admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Required Grants

The following grants are required for the PostgREST API to work:

```sql
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT ON admin_users TO anon;
```

---

## Authentication Flow

### Login Process

1. User enters email/password on `/login`
2. `LoginForm.tsx` calls `supabase.auth.signInWithPassword()`
3. On success, queries `admin_users` table to verify admin status
4. If user is not an admin or not active, signs out and shows error
5. If user is an admin, redirects to dashboard

### Middleware Protection

The `middleware.ts` file protects all routes:

1. **Unauthenticated users:** Redirected to `/login`
2. **Authenticated non-admins:** Signed out and redirected to `/login?error=unauthorized`
3. **Authenticated admins on `/login`:** Redirected to `/`
4. **Authenticated admins:** Allowed through

### Session Management

- Sessions are managed via Supabase SSR cookies
- The middleware refreshes the session on each request
- Cookies are automatically set/updated via the Supabase SSR client

---

## Role-Based Permissions

### Role Hierarchy

| Role | Description |
|------|-------------|
| `super_admin` | Full access to all features |
| `admin` | Most features except admin management and system settings |
| `moderator` | Basic moderation capabilities |

### Permission Matrix

| Permission | super_admin | admin | moderator |
|------------|:-----------:|:-----:|:---------:|
| view_reports | ✅ | ✅ | ✅ |
| dismiss_reports | ✅ | ✅ | ✅ |
| warn_users | ✅ | ✅ | ✅ |
| remove_listings | ✅ | ✅ | ✅ |
| suspend_users | ✅ | ✅ | ❌ |
| ban_users | ✅ | ✅ | ❌ |
| manage_admins | ✅ | ❌ | ❌ |
| view_audit_log | ✅ | ✅ | ❌ |
| system_settings | ✅ | ❌ | ❌ |

### Using Permissions in Code

```typescript
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { canBanUsers, canManageAdmins, hasPermission } = usePermissions(role)

  if (canBanUsers) {
    // Show ban button
  }

  if (hasPermission('system_settings')) {
    // Show settings link
  }
}
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://api.souqjari.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Getting the Keys

The keys are stored on the server at:
```
/root/supabase-secrets/secrets.env
```

SSH into the server and run:
```bash
cat /root/supabase-secrets/secrets.env
```

---

## Supabase Server Configuration

### Docker Containers

The self-hosted Supabase runs these containers:

| Container | Image | Purpose |
|-----------|-------|---------|
| supabase-auth | supabase/gotrue | Authentication |
| supabase-rest | postgrest/postgrest | REST API |
| supabase-kong | kong | API Gateway |
| supabase-studio | supabase/studio | Dashboard |
| supabase-realtime | supabase/realtime | Realtime subscriptions |
| supabase-storage | supabase/storage-api | File storage |
| supabase-meta | supabase/postgres-meta | Postgres metadata |
| supabase-functions | supabase/edge-runtime | Edge functions |

### Reloading Schema

After creating new tables or changing permissions, reload the PostgREST schema:

```sql
NOTIFY pgrst, 'reload schema';
```

Or restart the REST container:

```bash
docker restart supabase-rest
```

---

## Troubleshooting

### "You are not authorized to access this admin panel"

**Possible causes:**

1. **User not in admin_users table:**
   ```sql
   SELECT * FROM admin_users WHERE user_id = 'your-user-id';
   ```

   If no row exists, add one:
   ```sql
   INSERT INTO admin_users (user_id, role, is_active)
   VALUES ('your-user-id', 'super_admin', true);
   ```

2. **is_active is false:**
   ```sql
   UPDATE admin_users SET is_active = true WHERE user_id = 'your-user-id';
   ```

3. **Query using wrong column:** Ensure all queries use `user_id`, not `id`

### 403 Forbidden on admin_users API

**Possible causes:**

1. **Missing grants:**
   ```sql
   GRANT SELECT ON admin_users TO authenticated;
   GRANT SELECT ON admin_users TO anon;
   ```

2. **PostgREST schema not reloaded:**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

   Or restart the container:
   ```bash
   docker restart supabase-rest
   ```

3. **RLS blocking access:** Ensure the policy exists:
   ```sql
   CREATE POLICY "Users can read own admin record"
   ON admin_users
   FOR SELECT
   TO authenticated
   USING (user_id = auth.uid());
   ```

### OAuth User Can't Login (No Password)

For users who signed up via OAuth (Google, Apple, etc.), set a password:

```sql
UPDATE auth.users
SET encrypted_password = crypt('YourNewPassword123', gen_salt('bf'))
WHERE email = 'user@example.com';
```

### Login Works but Dashboard Shows Unauthorized

Check the middleware and dashboard layout queries - they might be using different column names or missing the admin check.

### Next.js Cache Issues

Clear the Next.js cache:

```bash
rm -rf .next
npm run dev
```

---

## Adding a New Admin User

1. Get the user's ID from auth.users:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'newadmin@example.com';
   ```

2. Insert into admin_users:
   ```sql
   INSERT INTO admin_users (user_id, role, is_active, notes)
   VALUES (
     'user-uuid-here',
     'moderator',  -- or 'admin' or 'super_admin'
     true,
     'Added by Omar on 2025-12-29'
   );
   ```

3. If the user signed up via OAuth, set a password:
   ```sql
   UPDATE auth.users
   SET encrypted_password = crypt('TempPassword123', gen_salt('bf'))
   WHERE id = 'user-uuid-here';
   ```

4. Share the credentials with the new admin and have them change their password.

---

## Deployment

### Cloudflare Pages

1. Connect the repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy

The admin panel will be available at `admin.souqjari.com`.

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client |
| `components/auth/LoginForm.tsx` | Login form |
| `app/(dashboard)/layout.tsx` | Dashboard layout with auth check |
| `types/index.ts` | TypeScript types and permissions |

### Key Queries

All admin_users queries must use `user_id`:

```typescript
// Correct
.eq('user_id', user.id)

// Wrong - will not find records
.eq('id', user.id)
```

### Common SQL Commands

```sql
-- Check if user is admin
SELECT * FROM admin_users WHERE user_id = 'uuid';

-- Make user super_admin
UPDATE admin_users SET role = 'super_admin' WHERE user_id = 'uuid';

-- Deactivate admin
UPDATE admin_users SET is_active = false WHERE user_id = 'uuid';

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'admin_users';

-- Reload PostgREST schema
NOTIFY pgrst, 'reload schema';
```
