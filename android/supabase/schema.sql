-- Trusted PostgreSQL Schema, RLS Policies, and Private Supabase Storage Rules
-- for the Aurelia Studio Native Android App

create extension if not exists "pgcrypto";

create table if not exists public.services (
  id text primary key,
  title text not null,
  category text not null,
  subtitle text not null default '',
  extended_description text not null default '',
  price text not null,
  numeric_price integer not null default 0,
  duration text not null default '60 min',
  image_url text not null default ''
);

create table if not exists public.staff_members (
  id text primary key,
  name text not null,
  role text not null,
  specialties text[] not null default '{}',
  availability_status text not null default 'Available',
  available_next text not null default 'Today',
  avatar_url text not null default ''
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_ref text not null unique,
  services text[] not null,
  appointment_date text not null,
  time_slot text not null,
  status text not null default 'confirmed',
  payment_upi_uri text not null default '',
  estimated_total integer not null default 0,
  points_earned integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_appointments integer not null default 0,
  available_points integer not null default 0,
  threshold_points integer not null default 500,
  reward_label text not null default 'Complimentary Blowout or 20% Off Next Visit',
  updated_at timestamptz not null default now()
);

create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.device_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  fcm_token text not null,
  platform text not null default 'android',
  updated_at timestamptz not null default now(),
  primary key (user_id, fcm_token)
);

-- Enable Row Level Security
alter table public.services enable row level security;
alter table public.staff_members enable row level security;
alter table public.bookings enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.client_documents enable row level security;
alter table public.device_tokens enable row level security;

create policy "Public catalog readable" on public.services for select using (true);
create policy "Public staff readable" on public.staff_members for select using (true);

create policy "Users view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users view own loyalty" on public.loyalty_accounts
  for select using (auth.uid() = user_id);

create policy "Users upsert own loyalty" on public.loyalty_accounts
  for insert with check (auth.uid() = user_id);

create policy "Users update own loyalty" on public.loyalty_accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own documents" on public.client_documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own device tokens" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private Storage buckets for profile photos and permitted documents
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false),
       ('permitted-documents', 'permitted-documents', false)
on conflict (id) do nothing;

create policy "Users manage own profile photos" on storage.objects
  for all using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users manage own permitted documents" on storage.objects
  for all using (bucket_id = 'permitted-documents' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'permitted-documents' and auth.uid()::text = (storage.foldername(name))[1]);
