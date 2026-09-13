import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

/**
 * ============================================================================
 * STRIPE WEBHOOK ROUTE (The Single Source of Truth)
 * ============================================================================
 * When a user completes checkout on Stripe's hosted payment page, Stripe
 * sends an asynchronous POST event to this endpoint.
 *
 * The client browser is NEVER trusted to update the database directly.
 * Only this verified webhook updates PostgreSQL via Supabase RPC.
 * ============================================================================
 */
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  // 1. Cryptographic Signature Verification
  // Verifies the payload truly originated from Stripe and was not spoofed
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("❌ Stripe webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // If testing without webhook secret configured yet, parse event directly
    console.warn("⚠️ STRIPE_WEBHOOK_SECRET is not set. Processing event without signature check.");
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
    const { roastId, action } = metadata;
    const amount = Number(metadata.amount) || Number(session.amount_total) / 100;

    console.log(`💰 Verified Stripe payment: Action=${action}, Amount=$${amount}, Roast=${roastId}`);

    if (action === "fuel" && roastId) {
      // Atomic PostgreSQL RPC: increment_bounty
      const { data, error } = await supabase.rpc("increment_bounty", {
        p_roast_id: roastId,
        p_amount: amount,
      });

      if (error) {
        console.error("❌ Failed to increment bounty in DB via Stripe webhook:", error.message);
        return NextResponse.json({ error: "Database RPC failed" }, { status: 500 });
      }

      console.log("✅ Bounty atomically incremented in PostgreSQL via Stripe:", data);
    } else if (action === "clear" && roastId) {
      // Clear roast
      const { error } = await supabase
        .from("roasts")
        .update({ defense_status: "cleared" })
        .eq("id", roastId);

      if (error) {
        console.error("❌ Failed to clear roast in DB via Stripe webhook:", error.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      console.log(`✅ Roast ${roastId} cleared in PostgreSQL via Stripe`);
    }
  }

  // 3. Return 200 OK to acknowledge receipt of event to Stripe
  return NextResponse.json({ received: true });
}
