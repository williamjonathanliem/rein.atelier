-- Add discount fields to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_type  TEXT    NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percent')),
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;
