-- M4: Ticket Logic & Purchasing Flow Database Schema
-- Run these scripts in your Supabase SQL Editor after M3 setup

-- =====================================================
-- 1. ORDERS TABLE
-- =====================================================
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_email text not null,
  customer_name text not null,
  event_id uuid references events on delete cascade not null,
  total_amount integer not null check (total_amount >= 0),
  status text check (status in ('pending', 'paid', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- 2. ORDER_ITEMS TABLE
-- =====================================================
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders on delete cascade not null,
  ticket_id uuid references tickets on delete cascade not null,
  quantity integer not null check (quantity > 0),
  price_at_purchase integer not null check (price_at_purchase >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on orders table
alter table orders enable row level security;

-- Enable RLS on order_items table
alter table order_items enable row level security;

-- =====================================================
-- 4. RLS POLICIES FOR ORDERS
-- =====================================================

-- Policy: Anyone can create orders (for public checkout)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

-- Policy: Users can view their own orders by email
create policy "Users can view own orders"
  on orders for select
  using (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

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

-- Policy: Admins can view all orders
create policy "Admins can view all orders"
  on orders for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- 5. RLS POLICIES FOR ORDER_ITEMS
-- =====================================================

-- Policy: Anyone can create order items (during checkout)
create policy "Anyone can create order items"
  on order_items for insert
  with check (true);

-- Policy: Users can view order items for their orders
create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.customer_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Policy: Organizers can view order items for their events
create policy "Organizers can view event order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      join events on events.id = orders.event_id
      where orders.id = order_items.order_id
      and events.organizer_id = auth.uid()
    )
  );

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on customer_email for faster order queries
create index orders_customer_email_idx on orders(customer_email);

-- Index on event_id for faster event order queries
create index orders_event_id_idx on orders(event_id);

-- Index on order_id for faster order item queries
create index order_items_order_id_idx on order_items(order_id);

-- Index on ticket_id for faster ticket order queries
create index order_items_ticket_id_idx on order_items(ticket_id);

-- =====================================================
-- 7. UPDATE TIMESTAMP TRIGGER
-- =====================================================

-- Trigger for orders table
create trigger update_orders_updated_at
  before update on orders
  for each row
  execute procedure update_updated_at_column();

-- =====================================================
-- 8. ADD QUANTITY_AVAILABLE TO TICKETS TABLE
-- =====================================================

-- Add quantity_available column to track remaining tickets
alter table tickets add column quantity_available integer;

-- Set initial quantity_available to match quantity for existing tickets
update tickets set quantity_available = quantity where quantity_available is null;

-- Make quantity_available not null and add check constraint
alter table tickets alter column quantity_available set not null;
alter table tickets add constraint tickets_quantity_available_check check (quantity_available >= 0);

-- =====================================================
-- 9. FUNCTION TO DECREMENT TICKET QUANTITY
-- =====================================================

-- Function to safely decrement ticket quantity
create or replace function decrement_ticket_quantity(
  ticket_uuid uuid,
  decrement_amount integer
)
returns boolean as $$
declare
  current_available integer;
begin
  -- Get current available quantity with row lock
  select quantity_available into current_available
  from tickets
  where id = ticket_uuid
  for update;

  -- Check if enough tickets are available
  if current_available < decrement_amount then
    raise exception 'Not enough tickets available';
  end if;

  -- Decrement the quantity
  update tickets
  set quantity_available = quantity_available - decrement_amount
  where id = ticket_uuid;

  return true;
end;
$$ language plpgsql;
