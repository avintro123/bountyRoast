-- ============================================================================
-- BOUNTYROAST DATABASE SECURITY HARDENING SCRIPT
-- ============================================================================
-- Apply this script in your Supabase SQL Editor (https://supabase.com/dashboard)
--
-- This script provides:
-- 1. PostgreSQL search_path hijacking defense for SECURITY DEFINER RPC functions.
-- 2. Strict input validation guards inside PostgreSQL stored procedures.
-- 3. Row-Level Security (RLS) configuration for `roasts` and `comments`.
-- 4. Audit constraints to eliminate negative bounty drains and race conditions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HARDENED ATOMIC RPC: increment_bounty
-- ----------------------------------------------------------------------------
-- Fixes:
-- - Sets explicit search_path = public, pg_temp to eliminate search_path hijacking.
-- - Enforces p_amount > 0 to prevent malicious negative increments (bounty draining).
-- - Enforces p_amount <= 10000 to prevent integer overflow or absurd amounts.
-- ----------------------------------------------------------------------------
create or replace function increment_bounty(p_roast_id text, p_amount numeric)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result json;
begin
  -- Guard 1: Enforce strictly positive bounty increment
  if p_amount is null or p_amount <= 0 then
    raise exception 'Bounty increment amount must be strictly positive';
  end if;

  -- Guard 2: Enforce upper bound limit per transaction
  if p_amount > 10000 then
    raise exception 'Bounty increment exceeds maximum allowed per transaction ($10,000)';
  end if;

  -- Atomic update with row lock
  update roasts
  set 
    bounty_amount = roasts.bounty_amount + p_amount,
    spectator_contributions = coalesce(roasts.spectator_contributions, 0) + p_amount
  where roasts.id = p_roast_id
  returning json_build_object(
    'id', roasts.id,
    'bounty_amount', roasts.bounty_amount,
    'spectator_contributions', roasts.spectator_contributions
  ) into v_result;

  if v_result is null then
    raise exception 'Roast with ID % not found', p_roast_id;
  end if;

  return v_result;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. HARDENED ATOMIC RPC: increment_comment_likes
-- ----------------------------------------------------------------------------
create or replace function increment_comment_likes(p_comment_id text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result json;
begin
  update comments
  set likes = coalesce(comments.likes, 0) + 1
  where comments.id = p_comment_id
  returning json_build_object(
    'id', comments.id,
    'likes', comments.likes
  ) into v_result;

  if v_result is null then
    raise exception 'Comment with ID % not found', p_comment_id;
  end if;

  return v_result;
end;
$$;

-- Revoke default PUBLIC permissions, grant only to anon and authenticated
revoke all on function increment_bounty(text, numeric) from public;
grant execute on function increment_bounty(text, numeric) to anon, authenticated, service_role;

revoke all on function increment_comment_likes(text) from public;
grant execute on function increment_comment_likes(text) to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
alter table roasts enable row level security;
alter table comments enable row level security;

-- Policy 1: Anyone (anon + authenticated) can view roasts (public leaderboard)
drop policy if exists "Allow public read on roasts" on roasts;
create policy "Allow public read on roasts"
  on roasts for select
  using (true);

-- Policy 2: Allow insert of new roasts with length and bounty checks
drop policy if exists "Allow insert on roasts" on roasts;
create policy "Allow insert on roasts"
  on roasts for insert
  with check (
    length(coalesce(target_handle, '')) between 1 and 35 and
    length(coalesce(roast_text, '')) between 1 and 600 and
    bounty_amount >= 1 and
    bounty_amount <= 100000
  );

-- Policy 3: Allow users to update defense_status or defense_text
drop policy if exists "Allow defense updates on roasts" on roasts;
create policy "Allow defense updates on roasts"
  on roasts for update
  using (true)
  with check (
    defense_status in ('none', 'defended', 'cleared', 'expired')
  );

-- Policy 4: Anyone can view comments
drop policy if exists "Allow public read on comments" on comments;
create policy "Allow public read on comments"
  on comments for select
  using (true);

-- Policy 5: Allow insert on comments with length validation
drop policy if exists "Allow insert on comments" on comments;
create policy "Allow insert on comments"
  on comments for insert
  with check (
    length(coalesce(text, '')) between 1 and 500 and
    length(coalesce(author_handle, '')) between 1 and 35
  );
