import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// Helper function to validate user ID
const validateUserId = (userId: string | null): boolean => {
  return !!userId;
};

// Helper function to validate password update
const validatePasswordUpdate = (
  currentPassword: string | null,
  newPassword: string | null
): boolean => {
  return !!currentPassword && !!newPassword;
};

// GET Endpoint: Fetch User Details
export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");

    if (!validateUserId(userId)) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Query the "users" table for user information
    const { data, error } = await supabase
      .from("users")
      .select("first_name, last_name, email")
      .eq("uid", userId) // Assuming "uid" matches the user ID
      .single();

    if (error) {
      throw new Error(error.message || "Failed to fetch user details");
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST Endpoint: Update User Profile or Password
export async function POST(request: Request) {
  try {
    const {
      id,
      first_name,
      last_name,
      email,
      current_password,
      new_password,
    } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle password change
    if (current_password && new_password) {
      if (!validatePasswordUpdate(current_password, new_password)) {
        return new Response(
          JSON.stringify({
            error: "Both current and new passwords are required for a password change.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Authenticate the user with the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: current_password,
      });

      if (signInError) {
        throw new Error(
          "Current password is incorrect. Please try again."
        );
      }

      // Update the password
      const { error: passwordUpdateError } =
        await supabase.auth.admin.updateUserById(id, {
          password: new_password,
        });

      if (passwordUpdateError) {
        throw new Error(
          `Failed to update password: ${passwordUpdateError.message}`
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Password updated successfully." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle profile updates
    const updates: { [key: string]: string } = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;

    const { error: dbError } = await supabase
      .from("users")
      .update(updates)
      .eq("uid", id); // Assuming "uid" matches the user ID

    if (dbError) {
      throw new Error(`Failed to update user details: ${dbError.message}`);
    }

    // Update email in Supabase's auth system, if necessary
    if (email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email,
      });
      if (authError) {
        throw new Error(`Failed to update email: ${authError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Profile updated successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
