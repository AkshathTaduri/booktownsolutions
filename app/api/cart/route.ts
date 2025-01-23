import { supabase } from "@/lib/supabaseClient";

// Helper function to validate user or session ID
const validateUserOrSessionId = (userId: string | null, sessionId: string | null): boolean => {
  return !!userId || !!sessionId;
};

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, sessionId, cart } = await request.json();

    if (!validateUserOrSessionId(userId, sessionId) || !Array.isArray(cart)) {
      return new Response(
        JSON.stringify({
          error: "Invalid data: userId or sessionId and cart are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate cart items and check stock availability
    const validCart = [];
    for (const item of cart) {
      if (!item.productId || typeof item.productId !== "number") {
        throw new Error(`Invalid productId: ${item.productId}`);
      }
      if (
        item.quantity !== undefined &&
        (typeof item.quantity !== "number" || item.quantity <= 0)
      ) {
        throw new Error(`Invalid quantity for productId ${item.productId}`);
      }

      // Check stock availability for the product
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", item.productId)
        .single();

      if (productError) {
        throw new Error(productError.message || `Product ${item.productId} not found`);
      }

      if (item.quantity > product.quantity) {
        throw new Error(
          `Only ${product.quantity} items available in stock for product ${item.productId}`
        );
      }

      validCart.push({
        user_id: userId || null,
        product_id: item.productId,
        quantity: Math.max(1, item.quantity || 1),
      });
    }

    // Upsert the valid cart items into the database
    const { data, error } = await supabase.from("cart").upsert(validCart, {
      onConflict: "user_id,product_id", // Unique constraint ensures no duplicates
    });

    if (error) {
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return new Response(
        JSON.stringify({
          error: "Invalid data: userId and productId are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Remove the item from the cart
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      throw new Error(error.message || "Failed to remove item from cart");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
