"use client";

import SearchBar from "./searchbar";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "../context/CartContext"; // Import CartContext
import logo from "../../public/booktownlogo.svg";
import Image from "next/image";
import CartSheet from "./cartsheet";
import { Button } from "@/components/ui/button"; // Import Shadcn Button

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
    <header className="flex items-center justify-between px-8 pt-4 pb-2 w-full">
      {/* Left - Logo */}
      <button
        className="text-xl font-bold text-blue-600 hover:underline"
        onClick={() => router.push("/")}
      >
        <div
          style={{
            width: 120,
            height: 40,
            overflow: "hidden",
          }}
        >
          <Image src={logo} alt="Book" width={120} />
        </div>
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
          <Button variant="outline" onClick={() => router.push("/login")}>
            Log in
          </Button>
        )}

        <div className="flex items-center gap-4">
          <CartSheet /> {/* Render the cart sheet */}
        </div>
      </div>
    </header>
  );
}
