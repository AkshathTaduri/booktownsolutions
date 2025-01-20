"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "../context/CartContext";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { cart, clearCart } = useCart(); // Access cart and clearCart from CartContext

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      if (user) {
        // Sync the cart to the backend before logout
        await fetch(`/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, sessionId: null, cart }),
        });
      }

      // Clear the cart from localStorage and state
      clearCart();

      // Sign out the user
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      alert("You have been logged out.");
      router.push("/");

      // Refresh after a small delay to ensure redirection completes
      setTimeout(() => router.refresh(), 200);
    } catch (err) {
      console.error("Error during logout:", err);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Account Info</h1>
      {user && (
        <div className="mb-6">
          <p className="mb-2">Name: {user.user_metadata?.name || "Unknown"}</p>
          <p className="mb-2">Email: {user.email}</p>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
      >
        Log Out
      </button>
    </div>
  );
}
