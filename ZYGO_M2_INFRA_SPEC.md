# M2 Sprint: Core Infrastructure Setup

## 1. Project Initialization

- Initialize Next.js 14+ (App Router) with TypeScript.
- Install core dependencies: `lucide-react`, `clsx`, `tailwind-merge`, `zod`.
- Initialize ShadcnUI (all-in-one setup).

## 2. Supabase Integration

- Install `@supabase/supabase-js` and `@supabase/ssr`.
- Create `src/lib/supabase/client.ts` (Browser client).
- Create `src/lib/supabase/server.ts` (Server client for Server Components/Actions).
- Create a `middleware.ts` in the root for session refreshing (Supabase standard).

## 3. Database & Auth (SQL to run in Supabase SQL Editor)

- Enable Auth with Email/Password.
- Create `profiles` table:
  ```sql
  create table profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text,
    role text check (role in ('admin', 'organizer', 'customer')) default 'customer',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```
