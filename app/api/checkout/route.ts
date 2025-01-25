import Stripe from "stripe";
import { NextResponse } from "next/server";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const { cart, userId, shippingAddress } = await request.json();

    // Validate the request
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required for checkout." },
        { status: 400 }
      );
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode
    ) {
      return NextResponse.json(
        { error: "Shipping address is incomplete." },
        { status: 400 }
      );
    }

    // Map the cart items to Stripe's line items format
    const lineItems = cart.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert price to cents
      },
      quantity: item.quantity,
    }));

    // Include product IDs and quantities in the metadata as JSON strings
    const productIds = cart.map((item: any) => item.productId);
    const quantities = cart.map((item: any) => item.quantity);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        userId, // Include the user ID for tracking
        shippingAddress: JSON.stringify(shippingAddress), // Include shipping address
        productIds: JSON.stringify(productIds), // Include product IDs
        quantities: JSON.stringify(quantities), // Include quantities
      },
    });

    // Respond with the session ID
    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
