import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete all items in the user's cart
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message || "Failed to clear the cart");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Cart cleared successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
