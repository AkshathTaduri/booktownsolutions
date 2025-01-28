import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context; // Destructure params from context

  try {
    // Fetch product details
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch product images
    const { data: images, error: imageError } = await supabase
      .from("productimages")
      .select("image_url")
      .eq("product_id", params.id);

    if (imageError) {
      return NextResponse.json(
        { error: "Failed to fetch product images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...data,
      image_urls: images.map((img) => img.image_url),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
