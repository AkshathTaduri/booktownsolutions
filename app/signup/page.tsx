"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async () => {
    setError(null);

    try {
      // Sign up user with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        alert(
          "Signup successful! A confirmation OTP has been sent to your email."
        );
        setOtpSent(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "An error occurred during signup.");
      } else {
        setError("An unknown error occurred during signup.");
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);

    try {
      // Verify OTP
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) throw error;

      // Get the user details from Supabase Auth
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data?.user)
        throw new Error("Failed to retrieve user info.");

      // Save user info to Supabase `users` table
      const { error: dbError } = await supabase.from("users").insert({
        uid: data.user.id, // Use the `id` from Supabase Auth
        first_name: firstName,
        last_name: lastName,
        email,
      });

      if (dbError) throw dbError;

      alert("Email confirmed and user info saved successfully!");
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Failed to verify OTP or save user info.");
      } else {
        setError("An unknown error occurred during verification.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      {!otpSent ? (
        <>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full max-w-md p-2 mb-4 border rounded"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full max-w-md p-2 mb-4 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-md p-2 mb-4 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full max-w-md p-2 mb-4 border rounded"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={handleSignup}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </>
      ) : (
        <>
          <p className="mb-4">Enter the 6-digit OTP sent to your email:</p>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full max-w-md p-2 mb-4 border rounded"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={handleVerifyOtp}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
