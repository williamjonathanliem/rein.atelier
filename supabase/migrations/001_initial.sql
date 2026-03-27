-- ─── CLIENTS ──────────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── ORDERS ────────────────────────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,

  -- Client snapshot (stored directly, not just FK, so invoice stays accurate if client is edited)
  client_id uuid references clients(id) on delete set null,
  client_name text not null,
  client_phone text,
  client_email text,
  client_address text,

  -- Classification
  status text not null default 'pending',
  -- values: 'pending' | 'in_progress' | 'revision' | 'completed' | 'cancelled'
  priority text not null default 'medium',
  -- values: 'low' | 'medium' | 'high' | 'urgent'

  -- Order details
  description text,
  price numeric(12,2) not null default 0,
  deposit_paid boolean default false,
  deposit_amount numeric(12,2) default 0,

  -- Dates (stored as date, not timestamptz)
  order_date date not null default current_date,
  deadline date not null,
  due_date date,

  -- Payment
  payment_status text default 'unpaid',
  -- values: 'paid' | 'unpaid' | 'partial'

  -- Invoice design preferences (persisted per order)
  invoice_template text default 'classic',
  invoice_color text default '#a78bfa',
  invoice_font text default 'Instrument Sans',
  invoice_date_format text default 'MMM D, YYYY',

  -- WhatsApp
  whatsapp_sent boolean default false,

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── INVOICE ITEMS (for multi-line invoices) ───────────────────
create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  description text not null,
  sub_description text,
  qty numeric not null default 1,
  price numeric(12,2) not null default 0,
  sort_order integer default 0
);

-- ─── SETTINGS (key-value store) ────────────────────────────────
create table settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  updated_at timestamptz default now()
);

insert into settings (key, value) values
  ('business_name', 'rein.atelier'),
  ('business_email', ''),
  ('business_phone', ''),
  ('business_address', ''),
  ('business_logo_url', ''),
  ('tax_name', ''),
  ('tax_number', ''),
  ('currency', 'IDR'),
  ('order_number_prefix', 'ORD-'),
  ('invoice_number_prefix', 'INV-'),
  ('default_payment_bank', ''),
  ('default_payment_account_name', ''),
  ('default_payment_account_number', ''),
  ('whatsapp_number', ''),
  ('default_invoice_terms', 'Pembayaran mohon dilakukan dalam 14 hari setelah invoice diterima.'),
  ('default_invoice_notes', 'Terima kasih sudah memesan di rein.atelier! 🌸');

-- ─── RLS: disable for single-owner app (enable + add policies for multi-user) ──
-- EXTENSIBLE: Add Row Level Security policies here when multi-user auth is added
alter table clients disable row level security;
alter table orders disable row level security;
alter table invoice_items disable row level security;
alter table settings disable row level security;

-- ─── UPDATED_AT TRIGGERS ───────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();
