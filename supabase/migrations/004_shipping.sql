-- Shipping fields for orders
-- Run this in the Supabase SQL Editor

alter table orders
  add column if not exists delivery_type text not null default 'pickup',
  -- 'pickup' | 'delivery'

  add column if not exists shipping_origin text,
  -- 'barat' | 'tengah' — null when pickup

  add column if not exists shipping_destination text,
  -- 'barat' | 'pusat' | 'selatan' | 'tengah' | 'timur' — null when pickup

  add column if not exists shipping_cost numeric(12,2) not null default 0;
  -- snapshot of cost at time of order, never recalculated
