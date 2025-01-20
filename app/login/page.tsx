"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { syncCart } = useCart(); // Access syncCart from CartContext

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Sync the cart after successful login
        await syncCart(data.user.id, null); // Pass userId, sessionId is null
        alert("Login successful!");
        router.push("/"); // Redirect to homepage or dashboard
      }
    } catch (err) {
      // Type guard to check if 'err' is an instance of Error
      if (err instanceof Error) {
        setError(err.message || "An error occurred during login.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        {/* Login Form */}
        <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } transition`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* Sign Up Option */}
        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
