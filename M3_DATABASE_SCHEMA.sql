-- M3: Event Management Database Schema
-- Run these scripts in your Supabase SQL Editor after M2 setup

-- =====================================================
-- 1. EVENTS TABLE
-- =====================================================
create table events (
  id uuid default uuid_generate_v4() primary key,
  organizer_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  location text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- 2. TICKETS TABLE
-- =====================================================
create table tickets (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events on delete cascade not null,
  name text not null,
  price integer not null check (price >= 0),
  quantity integer not null check (quantity >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on events table
alter table events enable row level security;

-- Enable RLS on tickets table
alter table tickets enable row level security;

-- =====================================================
-- 4. RLS POLICIES FOR EVENTS
-- =====================================================

-- Policy: Organizers can view their own events
create policy "Organizers can view own events"
  on events for select
  using (auth.uid() = organizer_id);

-- Policy: Anyone can view published events (for future public listing)
create policy "Anyone can view events"
  on events for select
  using (true);

-- Policy: Organizers can create events
create policy "Organizers can create events"
  on events for insert
  with check (auth.uid() = organizer_id);

-- Policy: Organizers can update their own events
create policy "Organizers can update own events"
  on events for update
  using (auth.uid() = organizer_id);

-- Policy: Organizers can delete their own events
create policy "Organizers can delete own events"
  on events for delete
  using (auth.uid() = organizer_id);

-- =====================================================
-- 5. RLS POLICIES FOR TICKETS
-- =====================================================

-- Policy: Anyone can view tickets for events
create policy "Anyone can view tickets"
  on tickets for select
  using (true);

-- Policy: Organizers can create tickets for their events
create policy "Organizers can create tickets"
  on tickets for insert
  with check (
    exists (
      select 1 from events
      where events.id = tickets.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- Policy: Organizers can update tickets for their events
create policy "Organizers can update tickets"
  on tickets for update
  using (
    exists (
      select 1 from events
      where events.id = tickets.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- Policy: Organizers can delete tickets for their events
create policy "Organizers can delete tickets"
  on tickets for delete
  using (
    exists (
      select 1 from events
      where events.id = tickets.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on organizer_id for faster event queries
create index events_organizer_id_idx on events(organizer_id);

-- Index on event_id for faster ticket queries
create index tickets_event_id_idx on tickets(event_id);

-- Index on event_date for sorting
create index events_event_date_idx on events(event_date);

-- =====================================================
-- 7. UPDATE TIMESTAMP TRIGGER
-- =====================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger for events table
create trigger update_events_updated_at
  before update on events
  for each row
  execute procedure update_updated_at_column();

-- Trigger for tickets table
create trigger update_tickets_updated_at
  before update on tickets
  for each row
  execute procedure update_updated_at_column();
