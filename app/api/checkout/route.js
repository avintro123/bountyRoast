import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  sanitizeHandle,
  sanitizeText,
  validateAmount,
  validateRoastId,
  getSafeOrigin,
} from "@/lib/sanitize";

// Allowed paid game actions
const ALLOWED_ACTIONS = new Set(["fuel", "drop", "clear"]);

export async function POST(req) {
  try {
    // 1. IP Rate Limiting (Defense against bot spam & wallet exhaustion)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`checkout-${clientIp}`, 15, 60000); // Max 15 sessions/min

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
          },
        },
      );
    }

    // 2. Parse & Validate Payload
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      roastId: rawRoastId,
      targetHandle: rawTargetHandle,
      amount: rawAmount,
      action = "fuel",
      roastText: rawRoastText = "",
    } = body;

    // Validate action enum
    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Validate & clamp amount ($1.00 - $10,000.00)
    const numAmount = validateAmount(rawAmount, 1, 10000);
    if (!numAmount) {
      return NextResponse.json(
        { error: "Amount must be between $1.00 and $10,000.00" },
        { status: 400 },
      );
    }

    // Sanitize target handle
    const targetHandle = sanitizeHandle(rawTargetHandle) || "founder";

    // Sanitize user-provided roast text
    const roastText = sanitizeText(rawRoastText, 280);

    // Validate or generate roast ID
    let effectiveRoastId = "";
    if (rawRoastId) {
      effectiveRoastId = validateRoastId(rawRoastId);
      if (!effectiveRoastId && action !== "drop") {
        return NextResponse.json({ error: "Invalid roast ID format" }, { status: 400 });
      }
    }
    if (!effectiveRoastId && action === "drop") {
      effectiveRoastId = `roast-${Date.now()}`;
    }

    // 3. Prevent Open Redirect Vulnerability by strictly validating origin
    const origin = getSafeOrigin(req);

    // 4. Construct Dynamic Return URLs
    let successUrl;
    let cancelUrl;

    if (action === "clear") {
      successUrl = `${origin}/defend/${effectiveRoastId}?payment_success=clear&amount=${numAmount}`;
      cancelUrl = `${origin}/defend/${effectiveRoastId}?payment_cancelled=clear`;
    } else if (action === "drop") {
      successUrl = `${origin}/drop?payment_success=drop&roast_id=${effectiveRoastId}&handle=${encodeURIComponent(targetHandle)}&amount=${numAmount}`;
      cancelUrl = `${origin}/drop?payment_cancelled=drop`;
    } else {
      // fuel
      successUrl = `${origin}/roast/${effectiveRoastId}?payment_success&amount=${numAmount}`;
      cancelUrl = `${origin}/roast/${effectiveRoastId}?payment_cancelled`;
    }

    const productName =
      action === "drop"
        ? `DROP ROAST on @${targetHandle} ($${numAmount} Bounty)`
        : `${action.toUpperCase()} on @${targetHandle} | BountyRoast`;

    const productDescription =
      action === "drop"
        ? `Deploy a $${numAmount} initial cash bounty to place @${targetHandle} on The Grill`
        : action === "fuel"
        ? `Fuel for the fire`
        : `Defense against the roast`;

    // 5. Create Official Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(numAmount * 100), // Stripe expects integer in CENTS
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        roastId: effectiveRoastId,
        targetHandle,
        roastText: roastText.slice(0, 400),
        action,
        amount: String(numAmount),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Secure Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
