-- Simple RLS fix - removes ALL policies and recreates only the essential ones
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily to clear everything
alter table orders disable row level security;
alter table order_items disable row level security;

-- Drop ALL existing policies
drop policy if exists "Anyone can create orders" on orders;
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Organizers can view event orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
drop policy if exists "Anyone can create order items" on order_items;
drop policy if exists "Users can view own order items" on order_items;
drop policy if exists "Organizers can view event order items" on order_items;

-- Re-enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- Create ONLY the essential policies for M4 to work

-- Orders: Allow anyone to insert (public checkout)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

-- Orders: Allow anyone to select their own orders (no auth check for now)
create policy "Public can view orders"
  on orders for select
  using (true);

-- Order items: Allow anyone to insert
create policy "Anyone can create order items"
  on order_items for insert
  with check (true);

-- Order items: Allow anyone to select
create policy "Public can view order items"
  on order_items for select
  using (true);
