-- M5: Payment Integration Database Schema
-- Add payment tracking fields to orders table

-- Add payment_id column to track Barion payment ID
alter table orders add column if not exists payment_id text;

-- Add payment_request_id for idempotency
alter table orders add column if not exists payment_request_id text;

-- Create index on payment_id for faster lookups
create index if not exists orders_payment_id_idx on orders(payment_id);

-- Create index on payment_request_id
create index if not exists orders_payment_request_id_idx on orders(payment_request_id);
