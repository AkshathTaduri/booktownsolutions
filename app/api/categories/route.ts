import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// To handle a GET request to /api/categories
export async function GET(request: Request): Promise<Response> {
  try {
    // Fetching data from the categories table
    const { data, error } = await supabase.from("categories").select("id, category_name");

    if (error) {
      throw error; // Throw error if there's an issue with the Supabase query
    }

    // Return the fetched data
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    // Handle any errors that occur
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
