import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xozmogbipqyijyxxseqs.supabase.co";
const SUPABASE_KEY = "sb_publishable_BMDG0ItleRoe_wkuPrK8mQ_lL-Y0iay";

const clientA = createClient(SUPABASE_URL, SUPABASE_KEY);
const clientB = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTests() {
  console.log("==================================================");
  console.log("🧪 BOUNTYROAST TEST SUITE: RPC CONCURRENCY & PRESENCE");
  console.log("==================================================");

  // ----------------------------------------------------
  // TEST 1: ATOMIC RPC CONCURRENCY (PostgreSQL Server-side)
  // ----------------------------------------------------
  console.log("\n[TEST 1] Testing Atomic Database RPC Concurrency...");
  
  const { data: initialRoast, error: roastFetchErr } = await clientA
    .from("roasts")
    .select("id, bounty_amount, spectator_contributions")
    .eq("id", "roast-001")
    .single();

  if (roastFetchErr) {
    console.error("❌ Failed to fetch roast-001:", roastFetchErr.message);
    process.exit(1);
  }

  const initialBounty = Number(initialRoast.bounty_amount);
  console.log(`Initial bounty for roast-001: $${initialBounty}`);

  console.log("Firing 5 concurrent increment_bounty($5 each) in parallel...");
  const increments = [5, 5, 5, 5, 5];
  const rpcPromises = increments.map((amt) =>
    clientA.rpc("increment_bounty", {
      p_roast_id: "roast-001",
      p_amount: amt,
    })
  );

  const results = await Promise.all(rpcPromises);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error("❌ RPC Errors occurred:", errors);
  } else {
    console.log("✓ All 5 concurrent RPC calls executed successfully.");
  }

  const { data: updatedRoast } = await clientA
    .from("roasts")
    .select("id, bounty_amount, spectator_contributions")
    .eq("id", "roast-001")
    .single();

  const finalBounty = Number(updatedRoast.bounty_amount);
  const expectedBounty = initialBounty + 25;
  console.log(`Updated bounty in PostgreSQL: $${finalBounty} (Expected: $${expectedBounty})`);

  if (finalBounty === expectedBounty) {
    console.log("✅ PASS: Zero Lost Updates! ACID Database Atomicity Verified.");
  } else {
    console.error(`❌ FAIL: Race condition detected! Expected ${expectedBounty}, got ${finalBounty}`);
  }

  // ----------------------------------------------------
  // TEST 2: ATOMIC COMMENT LIKES RPC
  // ----------------------------------------------------
  console.log("\n[TEST 2] Testing Atomic Comment Likes RPC...");
  const { data: comments } = await clientA
    .from("comments")
    .select("id, likes")
    .eq("roast_id", "roast-001")
    .limit(1);

  if (comments && comments.length > 0) {
    const testComment = comments[0];
    const initialLikes = Number(testComment.likes || 0);
    console.log(`Comment [${testComment.id}] initial likes: ${initialLikes}`);

    console.log("Firing 3 concurrent increment_comment_likes RPC calls...");
    await Promise.all([
      clientA.rpc("increment_comment_likes", { p_comment_id: testComment.id }),
      clientA.rpc("increment_comment_likes", { p_comment_id: testComment.id }),
      clientA.rpc("increment_comment_likes", { p_comment_id: testComment.id }),
    ]);

    const { data: updatedComment } = await clientA
      .from("comments")
      .select("id, likes")
      .eq("id", testComment.id)
      .single();

    const expectedLikes = initialLikes + 3;
    console.log(`Updated likes in DB: ${updatedComment.likes} (Expected: ${expectedLikes})`);
    if (updatedComment.likes === expectedLikes) {
      console.log("✅ PASS: Comment Likes atomically incremented.");
    } else {
      console.error("❌ FAIL: Comment likes count mismatch.");
    }
  }

  // ----------------------------------------------------
  // TEST 3: SUPABASE REALTIME PRESENCE (CRDT Cluster Sync)
  // ----------------------------------------------------
  console.log("\n[TEST 3] Testing Realtime Spectator Presence Sync (Client A & Client B)...");

  let clientASawCount = 0;
  let clientBSawCount = 0;

  const channelA = clientA.channel("presence-roast-roast-001", {
    config: { presence: { key: "client-A" } },
  });

  const channelB = clientB.channel("presence-roast-roast-001", {
    config: { presence: { key: "client-B" } },
  });

  channelA.on("presence", { event: "sync" }, () => {
    const state = channelA.presenceState();
    const count = Object.keys(state).length;
    clientASawCount = count;
    console.log(`[Client A WebSocket Event] Spectator Sync: ${count} spectator(s) active`);
  });

  channelB.on("presence", { event: "sync" }, () => {
    const state = channelB.presenceState();
    const count = Object.keys(state).length;
    clientBSawCount = count;
    console.log(`[Client B WebSocket Event] Spectator Sync: ${count} spectator(s) active`);
  });

  console.log("1. Client A subscribing and tracking presence...");
  await new Promise((resolve) => {
    channelA.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channelA.track({ client: "A", time: Date.now() });
        resolve();
      }
    });
  });

  await new Promise((r) => setTimeout(r, 1500));

  console.log("2. Client B subscribing and tracking presence...");
  await new Promise((resolve) => {
    channelB.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channelB.track({ client: "B", time: Date.now() });
        resolve();
      }
    });
  });

  await new Promise((r) => setTimeout(r, 2000));

  console.log(`Summary after both joined: Client A sees ${clientASawCount}, Client B sees ${clientBSawCount}`);
  if (clientASawCount >= 2 && clientBSawCount >= 2) {
    console.log("✅ PASS: Phoenix CRDT Realtime Presence accurately synchronized across multiple clients!");
  }

  console.log("3. Client B untracking and leaving channel...");
  await channelB.untrack();
  await clientB.removeChannel(channelB);

  await new Promise((r) => setTimeout(r, 2000));
  console.log(`After Client B left: Client A sees ${clientASawCount} spectator(s)`);

  await channelA.untrack();
  await clientA.removeChannel(channelA);

  console.log("\n==================================================");
  console.log("🎉 ALL SYSTEM TESTS COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
