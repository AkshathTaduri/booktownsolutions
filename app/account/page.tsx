"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import Tabs from Shadcn
import UserProfile from "../components/userprofile";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-8 mt-4">
        <h1 className="text-3xl font-bold">Your Account</h1>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="login-security" className="flex-1 px-8 pt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="login-security">Login & Security</TabsTrigger>
          <TabsTrigger value="your-orders">Your Orders</TabsTrigger>
        </TabsList>

        {/* Login & Security Tab Content */}
        <TabsContent value="login-security">
          <h2 className="text-xl font-semibold mb-4">Login & Security</h2>
          {/* Render the UserProfile component here */}
          <UserProfile />
        </TabsContent>

        {/* Your Orders Tab Content */}
        <TabsContent value="your-orders">
          <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
          <p>View your recent orders and order history.</p>
        </TabsContent>
      </Tabs>

      {/* Logout Button */}
      <footer className="p-4 bg-white shadow-md">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Log Out
        </button>
      </footer>
    </div>
  );
}
