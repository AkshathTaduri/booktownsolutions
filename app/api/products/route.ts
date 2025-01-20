import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);

    // Handle product search by name
    const productName = searchParams.get("name");
    if (productName) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${productName}%`)
        .limit(7);

      if (error) throw error;
      return NextResponse.json(data, { status: 200 });
    }

    // Handle product retrieval by IDs
    const ids = searchParams.get("ids");
    if (ids) {
      const productIds = ids.split(",").map(Number);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (error) throw error;
      return NextResponse.json(data, { status: 200 });
    }

    // Handle product retrieval by category_id and subcategory_id
    const categoryId = searchParams.get("category_id");
    const subcategoryId = searchParams.get("subcategory_id");

    if (!categoryId) {
      return NextResponse.json(
        { error: "category_id is required" },
        { status: 400 }
      );
    }

    let query = supabase.from("products").select("*").eq("category_id", categoryId);

    if (subcategoryId) {
      query = query.eq("subcategory_id", subcategoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
