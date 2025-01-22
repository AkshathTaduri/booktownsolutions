"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function UpdateEmailDialog() {
  const [step, setStep] = useState(1); // Track dialog step
  const [newEmail, setNewEmail] = useState(""); // New email input
  const [otp, setOtp] = useState(""); // OTP input
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message
  const [success, setSuccess] = useState(""); // Success message

  // Handle sending OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send OTP to the new email address
      const { error } = await supabase.auth.signInWithOtp({
        email: newEmail,
      });

      if (error) throw new Error(error.message);

      setSuccess("OTP has been sent to your new email address.");
      setStep(2); // Move to the OTP verification step
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to send OTP.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        type: "magiclink", // The type can also be "signup" or "recovery" if applicable
        token: otp,
        email: newEmail,
      });

      if (error) throw new Error(error.message);

      setSuccess("Email address has been successfully updated.");
      setStep(1); // Reset to step 1
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to verify OTP.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>{step === 1 ? "Update Email" : "Enter OTP"}</DialogTitle>
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Update Email</h2>
            <p className="mb-4">
              Enter your new email address to send an OTP for verification.
            </p>
            <Input
              type="email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-red-600 mt-2">{error}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}
            <DialogFooter>
              <Button
                onClick={handleSendOtp}
                disabled={loading || !newEmail}
                className="w-full"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
            <p className="mb-4">
              Enter the OTP sent to your new email address.
            </p>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-red-600 mt-2">{error}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}
            <DialogFooter>
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
                className="w-full"
              >
                {loading ? "Verifying..." : "Change Email"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep(1)} // Go back to the first step
                className="w-full mt-2"
              >
                Back
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
