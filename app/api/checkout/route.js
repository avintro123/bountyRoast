import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  try {
    const { roastId, targetHandle, amount, action = "fuel" } = await req.json();

    // validate the amount (server-side-security check)
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      return NextResponse.json({ error: "Min payment is $1" }, { status: 400 });
    }

    // get the current website URL for redirects
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // create official stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${action.toUpperCase()} on @${targetHandle || "founder"} | BountyRoast`,
              description:
                action === "fuel"
                  ? `Fuel for the fire`
                  : `Defense against the roast`,
            },
            unit_amount: Math.round(numAmount * 100), // stripe takes amount in CENTS ($5=500)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Where to send the user after paying
      success_url: `${origin}/roast/${roastId}?payment_success&amount=${numAmount}`,
      // Where to send the user if they click "Back" on Stripe
      cancel_url: `${origin}/roast/${roastId}?payment_cancelled`,
      // Crucial: Metadata travels with the payment to the webhook!
      metadata: {
        roastId: roastId || "",
        targetHandle: targetHandle || "",
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
