# SouqJari Admin Panel

Admin panel for the SouqJari marketplace platform. Built with Next.js 14, Supabase, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Auth**: Supabase SSR (@supabase/ssr)
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- npm or yarn
- Access to SouqJari Supabase instance

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/souqjari-admin.git
cd souqjari-admin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://api.souqjari.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
souqjari-admin/
├── app/
│   ├── (auth)/           # Auth routes (login)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── page.tsx      # Dashboard overview
│   │   ├── reports/      # Reports management
│   │   ├── listings/     # Listings moderation
│   │   ├── users/        # User management
│   │   ├── feedback/     # User feedback
│   │   └── settings/     # Admin settings (super_admin only)
│   ├── api/auth/         # Auth callback handlers
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (Sidebar, Header, etc.)
│   └── auth/             # Auth components
├── lib/
│   ├── supabase/         # Supabase client utilities
│   ├── constants.ts      # App constants
│   └── utils.ts          # Utility functions
├── hooks/
│   ├── useAdminAuth.ts   # Admin authentication hook
│   └── usePermissions.ts # Role-based permissions hook
├── types/
│   └── index.ts          # TypeScript type definitions
└── middleware.ts         # Route protection middleware
```

## Admin Roles & Permissions

| Permission       | super_admin | admin | moderator |
|-----------------|-------------|-------|-----------|
| View reports    | ✅          | ✅    | ✅        |
| Dismiss reports | ✅          | ✅    | ✅        |
| Warn users      | ✅          | ✅    | ✅        |
| Remove listings | ✅          | ✅    | ✅        |
| Suspend users   | ✅          | ✅    | ❌        |
| Ban users       | ✅          | ✅    | ❌        |
| Manage admins   | ✅          | ❌    | ❌        |
| View audit log  | ✅          | ✅    | ❌        |
| System settings | ✅          | ❌    | ❌        |

## Database Schema

The admin panel uses the `admin_users` table:

```sql
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.admin_users(id),
    is_active BOOLEAN DEFAULT TRUE
);
```

## Adding Admin Users

To add a new admin user:

1. Create a user account through the main SouqJari app or Supabase Auth
2. Insert a row into `admin_users` with the user's ID and desired role:

```sql
INSERT INTO admin_users (id, role, created_by)
VALUES ('user-uuid-here', 'moderator', 'super-admin-uuid');
```

## Deployment

### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set the build command: `npm run build`
3. Set the output directory: `.next`
4. Add environment variables in the Cloudflare dashboard
5. Deploy!

The admin panel will be available at `admin.souqjari.com`.

## Development

### Adding New Pages

1. Create a new folder in `app/(dashboard)/`
2. Add a `page.tsx` file with the page component
3. Update the navigation in `components/layout/Sidebar.tsx`
4. Add any required permissions checks

### Adding UI Components

Use the shadcn/ui CLI to add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Proprietary - SouqJari
