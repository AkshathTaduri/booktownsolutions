"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { supabase } from "@/lib/supabaseClient";

// Define the type for the context value
interface UserContextType {
  user: any; // Replace `any` with your user type, e.g., `User` if you have a defined type
  setUser: Dispatch<SetStateAction<any>>; // Replace `any` with your user type
}

// Initialize the context with a default value of `null`
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null); // Replace `any` with your user type if applicable

  useEffect(() => {
    // Fetch the current user from Supabase when the component mounts
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      setUser(data.user); // Set the user data in the state
    };

    fetchUser();

    // Subscribe to auth state changes to update the user
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          setUser(session?.user); // Update user on sign-in
        } else if (event === "SIGNED_OUT") {
          setUser(null); // Clear user on sign-out
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.subscription.unsubscribe(); // Unsubscribe from auth state changes
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
