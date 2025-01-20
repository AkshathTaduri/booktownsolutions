import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// To handle a GET request to /api/categories/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const { id } = params;

    // Fetch category by ID
    const { data, error } = await supabase
      .from("categories")
      .select("id, category_name")
      .eq("id", id)
      .single(); // Fetch a single category

    if (error) {
      throw error; // Throw error if there's an issue with the Supabase query
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
