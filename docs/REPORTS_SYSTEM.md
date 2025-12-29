# SouqJari Admin - Reports Management System

This document covers the implementation details, database requirements, and troubleshooting guide for the Reports Management System.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Requirements](#database-requirements)
4. [Authentication & Authorization](#authentication--authorization)
5. [Components & Hooks](#components--hooks)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Testing Checklist](#testing-checklist)

---

## Overview

The Reports Management System allows administrators to:
- View and filter reports submitted by users
- Take moderation actions (warn, suspend, ban users; remove content)
- Track action history via audit logs
- Manage reports through different statuses (pending, under_review, resolved, dismissed)

---

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI + Tailwind CSS
- **Authentication**: Supabase SSR Auth

### File Structure
```
app/
├── (auth)/
│   └── login/
│       └── page.tsx           # Login page
├── (dashboard)/
│   ├── layout.tsx             # Dashboard layout with admin check
│   ├── page.tsx               # Dashboard home
│   └── reports/
│       ├── page.tsx           # Reports list page
│       └── [id]/
│           └── page.tsx       # Report detail page

components/
├── auth/
│   └── LoginForm.tsx          # Login form with error handling
├── layout/
│   └── Sidebar.tsx            # Navigation sidebar
├── reports/
│   ├── ReportsTable.tsx       # Reports data table
│   ├── ReportCard.tsx         # Individual report card
│   ├── ReportDetail.tsx       # Full report details view
│   ├── ReportFilters.tsx      # Filter controls
│   ├── ReportedListingCard.tsx # Reported listing display
│   ├── ReportedUserCard.tsx   # Reported user display
│   ├── ActionModal.tsx        # Moderation action modal
│   └── ActionHistory.tsx      # Audit log display
└── ui/
    └── [various UI components]

hooks/
├── useReports.ts              # Fetch paginated reports list
├── useReport.ts               # Fetch single report details
└── useReportActions.ts        # Moderation action mutations

lib/
└── supabase/
    ├── client.ts              # Browser Supabase client
    ├── server.ts              # Server Supabase client
    └── middleware.ts          # Middleware Supabase client

middleware.ts                  # Auth middleware
```

---

## Database Requirements

### Required Tables

#### 1. `admin_users`
Stores admin/moderator accounts.

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for admin panel access
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
```

#### 2. `reports`
Stores user-submitted reports.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  reported_listing_id INTEGER REFERENCES listings(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. `admin_audit_log`
Tracks all moderation actions.

```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Permissions Setup

**CRITICAL**: The admin panel requires TWO types of permissions:
1. **GRANT** - Table-level access (required even if RLS is disabled)
2. **RLS Policies** - Row-level access control

#### Step 1: Grant Table Permissions (REQUIRED)
```sql
-- Grant table-level permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_audit_log TO authenticated;
GRANT SELECT ON admin_users TO authenticated;
```

#### Step 2: Handle RLS (Choose One)

**Option A: Disable RLS (Simplest for admin-only tables)**
```sql
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log DISABLE ROW LEVEL SECURITY;
```

**Option B: Keep RLS with Permissive Policies**
```sql
-- Create permissive policies for admin access
CREATE POLICY "admin_read_reports" ON reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_update_reports" ON reports
  FOR UPDATE TO authenticated USING (true);
```

> **Note**: Even with RLS disabled, you MUST run the GRANT commands. RLS and GRANT are separate permission systems in PostgreSQL.

### Checking Permissions

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('reports', 'admin_users', 'admin_audit_log');

-- Check existing policies
SELECT * FROM pg_policies
WHERE tablename IN ('reports', 'admin_users', 'admin_audit_log');

-- Check table grants
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'reports';
```

---

## Authentication & Authorization

### Middleware (`middleware.ts`)

The middleware handles:
1. Session refresh for server components
2. Redirecting unauthenticated users to `/login`
3. Redirecting authenticated users away from `/login` (unless they have an error param)

```typescript
// Key logic:
// - Unauthenticated users → /login
// - Authenticated users on /login (no error) → /
// - Authenticated users on /login?error=unauthorized → stay (will be signed out)
```

**Important**: The middleware does NOT check admin status. This is done in the dashboard layout.

### Dashboard Layout (`app/(dashboard)/layout.tsx`)

The layout performs the admin check:
1. Verifies user is authenticated
2. Queries `admin_users` table for the user
3. Checks `is_active` is true
4. Redirects non-admins to `/login?error=unauthorized`

```typescript
const { data: adminUser } = await supabase
  .from('admin_users')
  .select('id, user_id, role, is_active, created_at')
  .eq('user_id', user.id)
  .single()

if (!adminUser || !adminUser.is_active) {
  redirect('/login?error=unauthorized')
}
```

### Login Form (`components/auth/LoginForm.tsx`)

Handles:
1. Email/password authentication
2. Post-login admin verification
3. Auto sign-out when redirected with `?error=unauthorized`

```typescript
// Signs out user if they arrive with unauthorized error
useEffect(() => {
  if (unauthorizedError) {
    const signOut = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    signOut()
  }
}, [unauthorizedError])
```

---

## Components & Hooks

### Hooks

#### `useReports(options)`
Fetches paginated list of reports with filtering.

```typescript
const { data, isLoading, error, fetchNextPage, hasNextPage } = useReports({
  status: 'pending',      // Filter by status
  reason: ['spam'],       // Filter by reasons
  targetType: 'listing',  // 'listing' | 'user' | 'all'
  pageSize: 25,
})
```

#### `useReport(id)`
Fetches a single report with action history.

```typescript
const { data: report, isLoading, error } = useReport(reportId)
```

#### `useReportActions()`
Provides mutations for moderation actions.

```typescript
const {
  updateReportStatus,
  warnUser,
  suspendUser,
  banUser,
  removeListing,
  dismissReport,
  isLoading
} = useReportActions()

// Example usage
await warnUser.mutateAsync({
  reportId: 'xxx',
  userId: 'yyy',
  reason: 'Spam posting',
})
```

### Components

| Component | Purpose |
|-----------|---------|
| `ReportsTable` | Displays paginated reports in a table |
| `ReportCard` | Card view for individual report |
| `ReportDetail` | Full report details with actions |
| `ReportFilters` | Filter controls (status, reason, type) |
| `ReportedListingCard` | Shows reported listing info |
| `ReportedUserCard` | Shows reported user info |
| `ActionModal` | Modal for taking moderation actions |
| `ActionHistory` | Displays audit log entries |

---

## Common Issues & Solutions

### 1. Redirect Loop Between `/` and `/login`

**Symptom**: Browser shows infinite redirects between dashboard and login.

**Cause**: Middleware and layout both doing admin checks, with cookies not being applied to redirects.

**Solution**:
- Simplified middleware to only handle basic auth redirects
- Admin check moved to dashboard layout only
- Middleware doesn't redirect if `?error` param exists
- Login form signs out user when `?error=unauthorized` is present

### 2. "Column X does not exist" Error

**Symptom**: Query fails with error about missing column.

**Example**: `column admin_users.created_by does not exist`

**Solution**: Update the query to only select columns that exist in the table:
```typescript
// Before (broken)
.select('id, user_id, role, is_active, created_at, created_by')

// After (fixed)
.select('id, user_id, role, is_active, created_at')
```

### 3. "Could not find relationship" Error

**Symptom**: `Could not find a relationship between 'reports' and 'profiles'`

**Cause**: Query tries to join tables that don't have foreign key relationships configured.

**Solution**: Simplify query to not use joins:
```typescript
// Before (broken)
.select(`*, reporter:profiles!reporter_id(id, email)`)

// After (fixed)
.select('*')
```

### 4. "Permission denied for table" (RLS Issue)

**Symptom**: 403 Forbidden or "permission denied for table reports"

**Cause**: Row Level Security blocking access.

**Solution**:
```sql
-- Disable RLS
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- Or grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON reports TO authenticated;
```

### 5. 403 Forbidden Despite RLS Disabled

**Symptom**: Still getting 403 even after disabling RLS.

**Cause**: Table-level GRANT permissions missing (separate from RLS).

**Solution**:
```sql
-- Check current grants
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'reports';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON reports TO authenticated;
```

### 6. Cookie Type Errors in Supabase SSR

**Symptom**: TypeScript error about cookie parameter types.

**Solution**: Add interface for cookie types:
```typescript
interface CookieToSet {
  name: string
  value: string
  options?: CookieOptions
}
```

---

## Testing Checklist

### Authentication
- [ ] Login with valid admin credentials
- [ ] Login with non-admin credentials (should show unauthorized error)
- [ ] Logout functionality
- [ ] Session persistence on page refresh

### Reports List (`/reports`)
- [ ] Page loads without errors
- [ ] Tabs work (All, Pending, Under Review, Resolved, Dismissed)
- [ ] Filters work (type, reason, priority)
- [ ] Search functionality
- [ ] Pagination (if multiple reports exist)
- [ ] Empty state displays correctly

### Report Detail (`/reports/[id]`)
- [ ] Clicking a report navigates to detail page
- [ ] Report information displays correctly
- [ ] Action buttons appear based on user role
- [ ] Action history displays

### Moderation Actions
- [ ] Warn User action
- [ ] Suspend User action
- [ ] Ban User action
- [ ] Remove Content action
- [ ] Dismiss Report action
- [ ] Actions create audit log entries

---

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Adding a New Admin User

```sql
-- First, the user must have an auth account (sign up via the app or Supabase dashboard)

-- Then add them to admin_users
INSERT INTO admin_users (user_id, role, is_active)
VALUES (
  'user-uuid-from-auth-users',  -- Get this from auth.users table
  'moderator',                   -- 'super_admin', 'admin', or 'moderator'
  true
);
```

---

## Future Improvements

1. **Add table joins**: Once foreign keys are set up, restore the joined queries for richer data
2. **Server-side API routes**: Move sensitive operations to API routes using service_role key
3. **Real-time updates**: Add Supabase realtime subscriptions for live report updates
4. **Bulk actions**: Allow selecting multiple reports for batch operations
5. **Export functionality**: Export reports to CSV/Excel
