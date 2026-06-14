-- =========================================================================
-- HA-MEEM CHING TAI ERP - SUPABASE SCHEMA SETUP
-- Copy and paste this script into your Supabase SQL Editor to set up tables.
-- =========================================================================

-- 1. Create erp_settings table
create table if not exists erp_settings (
  key text primary key,
  value text not null
);

-- 2. Create erp_users table
create table if not exists erp_users (
  username text primary key,
  "employeeName" text not null,
  password text not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create erp_orders table
create table if not exists erp_orders (
  id text primary key,
  "piRecDate" text,
  "piNo" text,
  "piDate" text,
  "orderRef" text,
  "orderType" text,
  "mktPerson" text,
  buyer text,
  customer text,
  "teamLeader" text,
  "custType" text,
  remarks text,
  items jsonb default '[]'::jsonb,
  status text default 'Active',
  "warpTaken" numeric default 0,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create erp_planning_sheets table
create table if not exists erp_planning_sheets (
  id text primary key,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  "setNo" bigint,
  date text,
  buyer text,
  "styleCode" text,
  "endBuyer" text,
  "mktPerson" text,
  remarks text,
  "setLength" text,
  "orderRef" text,
  "piWidth" text,
  "piShrink" text,
  weave text,
  colour text,
  "orderQnty" text,
  "reqProd" text,
  "pDyeing" text,
  remain1 text,
  "todayTaken" text,
  remain2 text,
  "piRecDate" text,
  "warpingRows" jsonb default '[]'::jsonb,
  sizing jsonb default '{}'::jsonb,
  "weavingRows" jsonb default '[]'::jsonb,
  "orderId" text references erp_orders(id) on delete set null
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable access for anonymous roles (public access using the anon key)
-- =========================================================================

-- Enable RLS on all tables
alter table erp_settings enable row level security;
alter table erp_users enable row level security;
alter table erp_orders enable row level security;
alter table erp_planning_sheets enable row level security;

-- Create policies for erp_settings
create policy "Allow all actions for anon on erp_settings" on erp_settings
  for all to anon using (true) with check (true);

-- Create policies for erp_users
create policy "Allow all actions for anon on erp_users" on erp_users
  for all to anon using (true) with check (true);

-- Create policies for erp_orders
create policy "Allow all actions for anon on erp_orders" on erp_orders
  for all to anon using (true) with check (true);

-- Create policies for erp_planning_sheets
create policy "Allow all actions for anon on erp_planning_sheets" on erp_planning_sheets
  for all to anon using (true) with check (true);

-- 5. Create erp_yarn_stock table
create table if not exists erp_yarn_stock (
  id text primary key,
  plant text,
  "storageLocation" text,
  "materialDescription" text,
  unit text,
  "supplierName" text,
  "supplierLot" text,
  "unrestrictedStock" numeric default 0,
  "lastGoodsReceiptDate" text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_yarn_stock
alter table erp_yarn_stock enable row level security;

-- Create policy for erp_yarn_stock
create policy "Allow all actions for anon on erp_yarn_stock" on erp_yarn_stock
  for all to anon using (true) with check (true);

-- =========================================================================
-- DEFAULT ADMIN SEED
-- =========================================================================
insert into erp_settings (key, value)
values ('admin_password', '0707')
on conflict (key) do nothing;


-- 6. Create erp_yarn_demands table
create table if not exists erp_yarn_demands (
  id text primary key,
  "prNo" bigint not null unique,
  date text not null,
  items jsonb default '[]'::jsonb,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_yarn_demands
alter table erp_yarn_demands enable row level security;

-- Create policy for erp_yarn_demands
create policy "Allow all actions for anon on erp_yarn_demands" on erp_yarn_demands
  for all to anon using (true) with check (true);
-- 7. Create erp_yarn_receipts table
create table if not exists erp_yarn_receipts (
  id text primary key,
  plant text,
  "storageLocation" text,
  "materialDescription" text,
  unit text,
  "supplierName" text,
  "supplierLot" text,
  "receiveQty" numeric default 0,
  "rcvDate" text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_yarn_receipts
alter table erp_yarn_receipts enable row level security;

-- Create policy for erp_yarn_receipts
create policy "Allow all actions for anon on erp_yarn_receipts" on erp_yarn_receipts
  for all to anon using (true) with check (true);

-- 8. Create erp_production_entries table
create table if not exists erp_production_entries (
  id text primary key,
  "setNo" bigint not null,
  date text not null,
  "loomNo" text not null,
  shift text not null check (shift in ('A shift', 'B shift', 'C shift')),
  "loomOperator" text not null,
  "shiftIncharge" text not null,
  "productionQty" numeric not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_production_entries
alter table erp_production_entries enable row level security;

-- Create policy for erp_production_entries
create policy "Allow all actions for anon on erp_production_entries" on erp_production_entries
  for all to anon using (true) with check (true);
