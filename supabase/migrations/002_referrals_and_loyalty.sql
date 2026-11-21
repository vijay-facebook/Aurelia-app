-- =============================================================================
-- Aurelia App: Loyalty Points, Activity Ledger & Dual-Sided Referral Rewards
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. Loyalty accounts table (idempotent)
create table if not exists public.loyalty_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_appointments integer not null default 0,
  available_points integer not null default 0,
  threshold_points integer not null default 500,
  reward_label text not null default 'Complimentary Studio Blowout or 20% Off Next Ritual',
  referral_code text unique,
  referred_by uuid references auth.users(id) on delete set null,
  referral_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.loyalty_accounts
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references auth.users(id) on delete set null,
  add column if not exists referral_count integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists loyalty_accounts_referral_code_uidx
  on public.loyalty_accounts (upper(referral_code))
  where referral_code is not null;

-- 2. Loyalty points activity ledger
create table if not exists public.loyalty_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('purchase', 'engagement', 'redemption', 'referral')),
  label text not null,
  points_delta integer not null,
  created_at timestamptz not null default now()
);

create index if not exists loyalty_activities_user_created_idx
  on public.loyalty_activities (user_id, created_at desc);

-- 3. Referrals attribution table (strictly one referral per new user)
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  referral_code text not null,
  referrer_points integer not null default 150,
  referred_points integer not null default 100,
  created_at timestamptz not null default now(),
  constraint referrals_no_self_referral check (referrer_user_id <> referred_user_id)
);

-- 4. Enable RLS
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_activities enable row level security;
alter table public.referrals enable row level security;

drop policy if exists "Users read own loyalty account" on public.loyalty_accounts;
create policy "Users read own loyalty account"
  on public.loyalty_accounts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users upsert own loyalty account" on public.loyalty_accounts;
create policy "Users upsert own loyalty account"
  on public.loyalty_accounts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own loyalty account" on public.loyalty_accounts;
create policy "Users update own loyalty account"
  on public.loyalty_accounts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users read own loyalty activities" on public.loyalty_activities;
create policy "Users read own loyalty activities"
  on public.loyalty_activities
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own loyalty activities" on public.loyalty_activities;
create policy "Users insert own loyalty activities"
  on public.loyalty_activities
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read own referrals" on public.referrals;
create policy "Users read own referrals"
  on public.referrals
  for select
  to authenticated
  using (auth.uid() = referrer_user_id or auth.uid() = referred_user_id);

-- 5. Deterministic referral code helper
create or replace function public.default_referral_code(uid uuid)
returns text
language sql
immutable
as $$
  select 'AUR-' || upper(substr(replace(uid::text, '-', ''), 1, 6));
$$;

-- 6. Server-side atomic dual-sided referral award helper
create or replace function public.apply_referral_reward_internal(
  p_referred_user_id uuid,
  p_referral_code text,
  p_referrer_points integer default 150,
  p_referred_points integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean_code text;
  v_referrer_id uuid;
  v_existing_referral_id uuid;
begin
  v_clean_code := upper(trim(coalesce(p_referral_code, '')));
  if v_clean_code = '' then
    return jsonb_build_object('awarded', false, 'reason', 'empty_code');
  end if;

  -- Ensure new user's loyalty account exists
  insert into public.loyalty_accounts (user_id, referral_code)
  values (p_referred_user_id, public.default_referral_code(p_referred_user_id))
  on conflict (user_id) do nothing;

  -- Prevent duplicate attribution for same referred user
  select id into v_existing_referral_id
  from public.referrals
  where referred_user_id = p_referred_user_id;

  if v_existing_referral_id is not null then
    return jsonb_build_object('awarded', false, 'reason', 'already_claimed');
  end if;

  -- Locate referrer by code
  select user_id into v_referrer_id
  from public.loyalty_accounts
  where upper(referral_code) = v_clean_code
  limit 1;

  if v_referrer_id is null then
    return jsonb_build_object('awarded', false, 'reason', 'invalid_code');
  end if;

  if v_referrer_id = p_referred_user_id then
    return jsonb_build_object('awarded', false, 'reason', 'self_referral');
  end if;

  -- Record attribution
  insert into public.referrals (
    referrer_user_id,
    referred_user_id,
    referral_code,
    referrer_points,
    referred_points
  )
  values (
    v_referrer_id,
    p_referred_user_id,
    v_clean_code,
    p_referrer_points,
    p_referred_points
  );

  -- Award referrer
  update public.loyalty_accounts
  set
    available_points = available_points + p_referrer_points,
    referral_count = referral_count + 1,
    updated_at = now()
  where user_id = v_referrer_id;

  insert into public.loyalty_activities (user_id, type, label, points_delta)
  values (v_referrer_id, 'referral', 'Referral Bonus: Friend Signed Up', p_referrer_points);

  -- Award referred new member
  update public.loyalty_accounts
  set
    available_points = available_points + p_referred_points,
    referred_by = v_referrer_id,
    updated_at = now()
  where user_id = p_referred_user_id;

  insert into public.loyalty_activities (user_id, type, label, points_delta)
  values (p_referred_user_id, 'referral', 'Welcome Referral Bonus (' || v_clean_code || ')', p_referred_points);

  return jsonb_build_object(
    'awarded', true,
    'referrer_user_id', v_referrer_id,
    'referred_user_id', p_referred_user_id,
    'referrer_points', p_referrer_points,
    'referred_points', p_referred_points
  );
end;
$$;

-- 7. RPC callable by newly signed-up / signed-in customer
create or replace function public.claim_referral_reward(p_referral_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required to claim referral reward';
  end if;

  return public.apply_referral_reward_internal(v_uid, p_referral_code, 150, 100);
end;
$$;

grant execute on function public.claim_referral_reward(text) to authenticated;

-- 8. Trigger on auth.users creation to provision loyalty_account + claim signup referral immediately
create or replace function public.handle_new_loyalty_and_referral()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referred_code text;
begin
  insert into public.loyalty_accounts (user_id, referral_code)
  values (new.id, public.default_referral_code(new.id))
  on conflict (user_id) do update
  set referral_code = coalesce(public.loyalty_accounts.referral_code, excluded.referral_code);

  v_referred_code := new.raw_user_meta_data ->> 'referred_by_code';
  if v_referred_code is not null and trim(v_referred_code) <> '' then
    perform public.apply_referral_reward_internal(new.id, v_referred_code, 150, 100);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_loyalty_referral on auth.users;
create trigger on_auth_user_loyalty_referral
  after insert on auth.users
  for each row execute function public.handle_new_loyalty_and_referral();
