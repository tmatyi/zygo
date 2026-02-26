# ZYGO - M2 Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

## 2. Database Setup

Run the following SQL scripts in your Supabase SQL Editor (in order):

### 2.1 Enable Required Extensions
```sql
-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";
```

### 2.2 Create Profiles Table
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'organizer', 'customer')) default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 2.3 Enable Row Level Security (RLS)
```sql
-- Enable RLS on profiles table
alter table profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Policy: Allow profile creation during signup
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Policy: Admins can view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 2.4 Create Profile Trigger (Auto-create profile on signup)
```sql
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 3. Authentication Setup

In your Supabase dashboard:
1. Go to Authentication > Providers
2. Enable **Email** provider
3. Configure email templates (optional but recommended)
4. Set up redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 5. Next Steps

After completing M2 setup:
- **M3:** Event Management (Organizer Dashboard)
- **M4:** Ticket Logic & Purchasing Flow
- **M5:** Payment Integration (Barion)
- **M6:** Check-in App & QR validation
- **M7:** Invoicing (Billingo) & Launch

## Troubleshooting

### Issue: "Invalid API key" error
- Verify your `.env.local` file exists and contains correct values
- Restart the dev server after adding environment variables

### Issue: Database connection errors
- Check that RLS policies are correctly applied
- Verify the anon key has appropriate permissions

### Issue: Authentication not working
- Ensure the trigger function is created
- Check Supabase Auth logs in the dashboard
