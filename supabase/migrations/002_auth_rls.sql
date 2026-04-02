-- ============================================================
-- rein.atelier — Migration 002: Auth & Row-Level Security
--
-- Run this in: Supabase Dashboard → SQL Editor
-- Or via CLI:  supabase db push
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. UPDATE DEFAULT SETTINGS TO ENGLISH
--    (fixes the Indonesian placeholder text from 001_initial)
-- ────────────────────────────────────────────────────────────

UPDATE settings SET value = 'Payment is due within 14 days of receiving this invoice.'
  WHERE key = 'default_invoice_terms';

UPDATE settings SET value = 'Thank you for your order at rein.atelier! 🌸'
  WHERE key = 'default_invoice_notes';


-- ────────────────────────────────────────────────────────────
-- 2. ENABLE RLS ON ALL TABLES
--    (overrides the "disable" from 001_initial)
-- ────────────────────────────────────────────────────────────

ALTER TABLE clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings      ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- 3. CLIENTS — authenticated users only
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- 4. ORDERS — authenticated users only
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_delete" ON orders;

CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "orders_delete" ON orders
  FOR DELETE USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- 5. INVOICE ITEMS — authenticated users only
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "invoice_items_select" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_update" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete" ON invoice_items;

CREATE POLICY "invoice_items_select" ON invoice_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "invoice_items_insert" ON invoice_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "invoice_items_update" ON invoice_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "invoice_items_delete" ON invoice_items
  FOR DELETE USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- 6. SETTINGS — authenticated users only
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "settings_select" ON settings;
DROP POLICY IF EXISTS "settings_insert" ON settings;
DROP POLICY IF EXISTS "settings_update" ON settings;
DROP POLICY IF EXISTS "settings_delete" ON settings;

CREATE POLICY "settings_select" ON settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "settings_insert" ON settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "settings_update" ON settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "settings_delete" ON settings
  FOR DELETE USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- 7. STORAGE — protect the business-assets bucket
-- ────────────────────────────────────────────────────────────

-- Create the bucket if it doesn't exist yet
INSERT INTO storage.buckets (id, name, public)
  VALUES ('business-assets', 'business-assets', false)
  ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "assets_select" ON storage.objects;
DROP POLICY IF EXISTS "assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "assets_update" ON storage.objects;
DROP POLICY IF EXISTS "assets_delete" ON storage.objects;

CREATE POLICY "assets_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-assets' AND auth.role() = 'authenticated'
  );

CREATE POLICY "assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-assets' AND auth.role() = 'authenticated'
  );

CREATE POLICY "assets_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-assets' AND auth.role() = 'authenticated'
  );

CREATE POLICY "assets_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-assets' AND auth.role() = 'authenticated'
  );


-- ────────────────────────────────────────────────────────────
-- 8. CREATE YOUR ADMIN USER
--
--    OPTION A — Supabase Dashboard (easiest):
--      Authentication → Users → Add User
--      Email: your@email.com
--      Password: YourStrongPassword!
--      ✓ Check "Auto Confirm User"
--
--    OPTION B — SQL (uncomment and fill in):
-- ────────────────────────────────────────────────────────────

-- SELECT auth.create_user(
--   '{"email": "your@email.com", "password": "YourStrongPassword!", "email_confirm": true}'::jsonb
-- );


-- ────────────────────────────────────────────────────────────
-- VERIFY — run this to confirm all policies are in place:
-- ────────────────────────────────────────────────────────────

-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('clients','orders','invoice_items','settings')
-- ORDER BY tablename, cmd;
