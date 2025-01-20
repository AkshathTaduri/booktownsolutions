import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET method to fetch a subcategory by ID
export async function GET(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const { id: subcategoryId } = params;

    if (!subcategoryId) {
      return NextResponse.json(
        { error: "`id` must be provided" },
        { status: 400 }
      );
    }

    // Fetch subcategory by ID
    const { data, error } = await supabase
      .from("subcategories")
      .select("subcategory_name")
      .eq("id", subcategoryId)
      .single(); // Expect a single subcategory

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
