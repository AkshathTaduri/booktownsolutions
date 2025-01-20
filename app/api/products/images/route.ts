import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request): Promise<Response> {
  try {
    // Parse the product ID from query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    // Fetch images from the productimages table based on the product ID
    const { data, error } = await supabase
      .from("productimages")
      .select("image_url")
      .eq("product_id", productId);

    if (error) {
      throw error;
    }

    // Return the list of images
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching product images:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching images." },
      { status: 500 }
    );
  }
}
