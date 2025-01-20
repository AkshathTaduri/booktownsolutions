import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia", // Use the correct API version
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string // Use the service role key to access DB securely
);

export async function POST(request: Request) {
    try {
      const { cart, userId } = await request.json();
  
      // Validate the request
      if (!cart || cart.length === 0) {
        return NextResponse.json(
          { error: "Cart is empty." },
          { status: 400 }
        );
      }
  
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required for checkout." },
          { status: 400 }
        );
      }
  
    //   // Simplify the cart for the stored procedure
    //   const simplifiedCart = cart.map((item: any) => ({
    //     productId: item.productId,
    //     quantity: item.quantity,
    //   }));
    //   console.log(simplifiedCart);
      // Call the stored procedure with the simplified cart
      const { data, error } = await supabase.rpc("validate_and_update_stock", {
        product_ids: cart.map((item: any) => item.productId), // Array of product IDs
        quantities: cart.map((item: any) => item.quantity), // Array of quantities
      });
      
      
  
      if (error) {
        throw new Error(`Stock validation/update failed: ${error.message}`);
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
  
      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
        metadata: {
          userId, // Include the user ID for tracking
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
  
