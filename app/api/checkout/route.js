import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  try {
    const { roastId, targetHandle, amount, action = "fuel", roastText = "" } = await req.json();

    // validate the amount (server-side-security check)
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      return NextResponse.json({ error: "Min payment is $1" }, { status: 400 });
    }

    // get the current website URL for redirects
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const effectiveRoastId = roastId || (action === "drop" ? `roast-${Date.now()}` : "");

    // 3. Dynamic redirect URLs based on action ("clear" vs "drop" vs "fuel")
    let successUrl;
    let cancelUrl;

    if (action === "clear") {
      successUrl = `${origin}/defend/${roastId}?payment_success=clear&amount=${numAmount}`;
      cancelUrl = `${origin}/defend/${roastId}?payment_cancelled=clear`;
    } else if (action === "drop") {
      successUrl = `${origin}/drop?payment_success=drop&roast_id=${effectiveRoastId}&handle=${encodeURIComponent(targetHandle || "")}&amount=${numAmount}`;
      cancelUrl = `${origin}/drop?payment_cancelled=drop`;
    } else {
      // fuel
      successUrl = `${origin}/roast/${roastId}?payment_success&amount=${numAmount}`;
      cancelUrl = `${origin}/roast/${roastId}?payment_cancelled`;
    }

    const productName =
      action === "drop"
        ? `DROP ROAST on @${targetHandle || "founder"} ($${numAmount} Bounty)`
        : `${action.toUpperCase()} on @${targetHandle || "founder"} | BountyRoast`;

    const productDescription =
      action === "drop"
        ? `Deploy a $${numAmount} initial cash bounty to place @${targetHandle || "founder"} on The Grill`
        : action === "fuel"
        ? `Fuel for the fire`
        : `Defense against the roast`;

    // create official stripe checkout session
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
            unit_amount: Math.round(numAmount * 100), // stripe takes amount in CENTS ($5=500)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Where to send the user after paying
      success_url: successUrl,
      // Where to send the user if they click "Back" on Stripe
      cancel_url: cancelUrl,
      // Crucial: Metadata travels with the payment to the webhook!
      metadata: {
        roastId: effectiveRoastId,
        targetHandle: targetHandle || "",
        roastText: (roastText || "").slice(0, 400),
        action: action, //"fuel" | "drop" | "clear"
        amount: String(numAmount),
      },
    });

    // Return the official Stripe Checkout URL to the browser
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
