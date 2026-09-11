-- ==========================================================
-- BOUNTYROAST: Database Concurrency & Atomic RPC Functions
-- ==========================================================
-- Purpose: Eliminate "Lost Update" race conditions when multiple
-- users fuel bounties or like comments simultaneously.
-- ==========================================================

-- 1. Atomic Bounty Increment Function
create or replace function increment_bounty(p_roast_id text, p_amount numeric)
returns json
language plpgsql
security definer
as $$
declare
  v_result json;
begin
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

  return v_result;
end;
$$;

-- 2. Atomic Comment Likes Increment Function
create or replace function increment_comment_likes(p_comment_id text)
returns json
language plpgsql
security definer
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

  return v_result;
end;
$$;

-- Grant execution permissions to anon and authenticated roles
grant execute on function increment_bounty(text, numeric) to anon, authenticated;
grant execute on function increment_comment_likes(text) to anon, authenticated;
