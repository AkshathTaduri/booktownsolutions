"use client";

import SearchBar from "./searchbar";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "../context/CartContext"; // Import CartContext

export default function Header() {
  const { cart, totalItems } = useCart(); // Access cart and total items from context
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("first_name")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else if (data) {
          setFirstName(data.first_name);
        }
      }
    };

    // Fetch the user on initial load
    fetchUser();

    // Set up real-time listener for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUser(); // Re-fetch the user data
        } else {
          setUser(null);
          setFirstName(null); // Clear user-specific data on logout
        }
      }
    );

    // Cleanup the subscription on component unmount
    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-gray-100 shadow-md w-full">
      {/* Left - Logo */}
      <button
        className="text-xl font-bold text-blue-600 hover:underline"
        onClick={() => router.push("/")}
      >
        Book Town Solutions
      </button>

      {/* Center - Search Bar */}
      <div className="flex-grow mx-4">
        <SearchBar />
      </div>

      {/* Right - User Info */}
      <div className="flex items-center gap-4">
        {user ? (
          <button
            className="text-sm font-medium text-blue-600 hover:underline"
            onClick={() => router.push("/account")}
          >
            <div>
              <div>Hello {firstName || "User"}!</div>
              <div className="text-xs">Account Info</div>
            </div>
          </button>
        ) : (
          <button
            className="text-sm font-medium text-blue-600 hover:underline"
            onClick={() => router.push("/login")}
          >
            Log in
          </button>
        )}

        {/* Shopping Cart */}
        <div
          className="relative cursor-pointer"
          onClick={() => router.push("/cart")}
        >
          <FaShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
