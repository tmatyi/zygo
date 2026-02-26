-- Fix RLS policies to allow updating orders with payment_id
-- The issue is that orders can be created but not updated

-- Drop existing update policies if any
drop policy if exists "Anyone can update orders" on orders;
drop policy if exists "Users can update own orders" on orders;

-- Add policy to allow updating orders (needed for payment_id updates)
create policy "Anyone can update orders"
  on orders for update
  using (true)
  with check (true);
