"use client";

import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateEmailDialog from "./updateemail"; // Import the UpdateEmailDialog component

export default function UserProfile() {
  const { user } = useUser(); // From the UserContext
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
  });
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Current password for verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`/api/account?userId=${user.id}`);
          const data = await response.json();

          if (response.ok) {
            setFormData({
              first_name: data.first_name || "",
              last_name: data.last_name || "",
            });
          } else {
            setError(data.error || "Failed to fetch user data.");
          }
        } catch (err) {
          setError("An unexpected error occurred.");
        }
      };

      fetchUserData();
    }
  }, [user?.id]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes function
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user information");
      }

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Update password function
  const handlePasswordUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          password,
          currentPassword, // Verify the current password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess("Password updated successfully!");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      <ul className="space-y-4">
        {/* Name Field */}
        <li className="flex justify-between items-center">
          <div>
            <p className="font-medium">Name</p>
            <p className="text-gray-600">{`${formData.first_name} ${formData.last_name}`}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Name</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </li>

        {/* Email Field */}
        <li className="flex justify-between items-center">
          <div>
            <p className="font-medium">Email</p>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          {/* Use UpdateEmailDialog component */}
          <UpdateEmailDialog />
        </li>

        {/* Password Field */}
        <li className="flex justify-between items-center">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-gray-600">********</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                />
                <Button onClick={handlePasswordUpdate} disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </li>
      </ul>
    </div>
  );
}
