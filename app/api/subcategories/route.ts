import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET method to fetch subcategories by category_id
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    if (!categoryId) {
      return NextResponse.json(
        { error: "`category_id` must be provided" },
        { status: 400 }
      );
    }

    // Fetch subcategories by category ID
    const { data, error } = await supabase
      .from("subcategories")
      .select("id, subcategory_name")
      .eq("category_id", categoryId);

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
