-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Drop all existing order policies
drop policy if exists "Anyone can create orders" on orders;
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Organizers can view event orders" on orders;
drop policy if exists "Admins can view all orders" on orders;

-- Recreate policies without the problematic admin check

-- Policy: Anyone can create orders (for public checkout)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

-- Policy: Users can view their own orders by email (simplified)
create policy "Users can view own orders"
  on orders for select
  using (
    customer_email = (select email from auth.users where id = auth.uid())
  );

-- Policy: Organizers can view orders for their events
create policy "Organizers can view event orders"
  on orders for select
  using (
    exists (
      select 1 from events
      where events.id = orders.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- Note: Removed admin policy to avoid recursion
-- Admins can use Supabase dashboard to view all orders directly
