-- M6: Check-in App & QR Validation Database Schema
-- Add check-in tracking fields to order_items table

-- Add check_in_token column for unique ticket identification
alter table order_items add column if not exists check_in_token text unique;

-- Add used_at timestamp to track when ticket was checked in
alter table order_items add column if not exists used_at timestamptz;

-- Create index on check_in_token for faster lookups during scanning
create index if not exists order_items_check_in_token_idx on order_items(check_in_token);

-- Create index on used_at for reporting
create index if not exists order_items_used_at_idx on order_items(used_at);

-- Add comment for documentation
comment on column order_items.check_in_token is 'Unique token for QR code check-in validation';
comment on column order_items.used_at is 'Timestamp when ticket was checked in at event';
