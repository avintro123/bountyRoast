import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import {
  sanitizeHandle,
  sanitizeText,
  validateAmount,
  validateRoastId,
} from "@/lib/sanitize";

/**
 * ============================================================================
 * STRIPE WEBHOOK ROUTE (The Single Source of Truth)
 * ============================================================================
 * When a user completes checkout on Stripe's hosted payment page, Stripe
 * sends an asynchronous POST event to this endpoint.
 *
 * The client browser is NEVER trusted to update the database directly.
 * Only this cryptographically verified webhook updates PostgreSQL via Supabase RPC.
 * ============================================================================
 */
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  // 1. Cryptographic Signature Verification
  // Verifies the payload truly originated from Stripe and was not spoofed.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // In production, unverified webhook calls are strictly rejected
  if (process.env.NODE_ENV === "production" && !webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not configured in production environment!");
    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }

  if (webhookSecret) {
    if (!signature) {
      console.warn("⚠️ Missing stripe-signature header on webhook request.");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("❌ Stripe webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Only permitted in development mode when webhook secret is not yet set
    console.warn("⚠️ STRIPE_WEBHOOK_SECRET is not set in dev. Processing event without signature check.");
    try {
      event = JSON.parse(body);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  console.log(`🔔 Stripe event received: ${event.type} [${event.id}]`);

  // 2. Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const { action } = metadata;

    const allowedActions = new Set(["fuel", "drop", "clear"]);
    if (!allowedActions.has(action)) {
      console.warn(`⚠️ Unrecognized or missing action in session metadata: ${action}`);
      return NextResponse.json({ received: true });
    }

    const rawAmount = metadata.amount
      ? Number(metadata.amount)
      : Number(session.amount_total) / 100;
    const cleanAmount = validateAmount(rawAmount, 1, 10000);

    if (cleanAmount === null) {
      console.error(`❌ Invalid amount in session metadata: ${rawAmount}`);
      return NextResponse.json({ error: "Invalid amount in metadata" }, { status: 400 });
    }

    const cleanRoastId = validateRoastId(metadata.roastId);

    console.log(
      `💰 Verified Stripe payment: Action=${action}, Amount=$${cleanAmount}, Roast=${cleanRoastId}`
    );

    if (action === "fuel" && cleanRoastId) {
      // Atomic PostgreSQL RPC: increment_bounty
      const { data, error } = await supabase.rpc("increment_bounty", {
        p_roast_id: cleanRoastId,
        p_amount: cleanAmount,
      });

      if (error) {
        console.error("❌ Failed to increment bounty in DB via Stripe webhook:", error.message);
        return NextResponse.json({ error: "Database RPC failed" }, { status: 500 });
      }

      console.log("✅ Bounty atomically incremented in PostgreSQL via Stripe:", data);
    } else if (action === "clear" && cleanRoastId) {
      // Clear roast
      const { error } = await supabase
        .from("roasts")
        .update({ defense_status: "cleared" })
        .eq("id", cleanRoastId);

      if (error) {
        console.error("❌ Failed to clear roast in DB via Stripe webhook:", error.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      console.log(`✅ Roast ${cleanRoastId} cleared in PostgreSQL via Stripe`);
    } else if (action === "drop") {
      // Deploy brand new roast into Supabase
      const targetHandle = sanitizeHandle(metadata.targetHandle || "founder");
      const roastText = sanitizeText(
        metadata.roastText || "Put on The Grill via BountyRoast.",
        500
      );
      const newRoastId = cleanRoastId || `roast-${Date.now()}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

      const newRoastRow = {
        id: newRoastId,
        target_handle: targetHandle,
        target_name: targetHandle,
        target_avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(targetHandle)}`,
        roast_text: roastText,
        bounty_amount: cleanAmount,
        roaster_handle: "you",
        roaster_name: "You",
        roaster_avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=you",
        defense_status: "none",
        defense_text: null,
        upvotes: 0,
        spectator_contributions: 0,
        created_at: now.toISOString(),
        expires_at: expiresAt,
      };

      const { error } = await supabase.from("roasts").insert(newRoastRow);

      if (error) {
        console.error("❌ Failed to insert dropped roast via Stripe webhook:", error.message);
        return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
      }

      console.log(`✅ Dropped roast ${newRoastId} inserted in PostgreSQL via Stripe webhook!`);
    }
  }

  // 3. Return 200 OK to acknowledge receipt of event to Stripe
  return NextResponse.json({ received: true });
}
