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

    // 3. Dynamic redirect URLs based on action ("clear" vs "fuel")
    const successUrl =
      action === "clear"
        ? `${origin}/defend/${roastId}?payment_success=clear&amount=${numAmount}`
        : `${origin}/roast/${roastId}?payment_success&amount=${numAmount}`;
    const cancelUrl =
      action === "clear"
        ? `${origin}/defend/${roastId}?payment_cancelled=clear`
        : `${origin}/roast/${roastId}?payment_cancelled`;

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
      success_url: successUrl,
      // Where to send the user if they click "Back" on Stripe
      cancel_url: cancelUrl,
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
