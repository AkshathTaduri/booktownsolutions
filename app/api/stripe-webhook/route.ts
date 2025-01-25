import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET as string, {
  apiVersion: "2024-12-18.acacia",
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Webhook error: ${err.message}`, { status: 400 });
    } else {
      console.error("Unknown error during webhook signature verification");
      return new Response("Unknown webhook error", { status: 400 });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Define a type for metadata
    type Metadata = {
      userId: string;
      shippingAddress: string;
      productIds: string;
      quantities: string; // Ensure this is parsed like productIds
    };

    const metadata = session.metadata as Metadata;

    if (
      !metadata ||
      !metadata.userId ||
      !metadata.shippingAddress ||
      !metadata.productIds ||
      !metadata.quantities
    ) {
      console.error("Missing metadata in Stripe session.");
      return new Response("Invalid metadata", { status: 400 });
    }

    const { userId, shippingAddress, productIds, quantities } = metadata;

    // Parse shipping address, product IDs, and quantities from JSON
    let parsedShippingAddress, parsedProductIds, parsedQuantities;
    try {
      parsedShippingAddress = JSON.parse(shippingAddress);
      parsedProductIds = JSON.parse(productIds);
      parsedQuantities = JSON.parse(quantities);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error parsing metadata:", err.message);
        return new Response(`Invalid metadata format: ${err.message}`, { status: 400 });
      } else {
        console.error("Unknown error parsing metadata");
        return new Response("Unknown metadata parsing error", { status: 400 });
      }
    }

    try {
      // Log parsed data for debugging
      console.log("Parsed Product IDs:", parsedProductIds);
      console.log("Parsed Quantities:", parsedQuantities);

      // Call the stored procedure to validate and update stock
      const { data, error } = await supabase.rpc("validate_and_update_stock", {
        product_ids: parsedProductIds,
        quantities: parsedQuantities,
      });

      if (error) {
        throw new Error(`Stock validation/update failed: ${error.message}`);
      }

      console.log("Stock updated successfully for user:", userId);

      // Save the shipping address and order info in the database
      const { error: insertError } = await supabase.from("orders").insert([
        {
          user_id: userId,
          shipping_address: parsedShippingAddress,
          stripe_session_id: session.id,
        },
      ]);

      if (insertError) {
        throw new Error(`Failed to insert order: ${insertError.message}`);
      }

      console.log("Order saved successfully for user:", userId);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error updating stock or saving order info:", err.message);
        return new Response(`Error: ${err.message}`, { status: 500 });
      } else {
        console.error("Unknown error updating stock or saving order info");
        return new Response("Unknown error", { status: 500 });
      }
    }
  }

  return new Response("Webhook received", { status: 200 });
}
