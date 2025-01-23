"use client";

import { useCart } from "../context/CartContext"; // Import the CartContext
import { useUser } from "../context/UserContext"; // Import the UserContext
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart(); // Access cart and methods from context
  const { user } = useUser(); // Access the current user from UserContext
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to proceed to checkout.");
      router.push("/login"); // Redirect to the login page
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          userId: user.id, // Pass the user ID to the backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate checkout");
      }

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert("Stripe is not available. Please try again later.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to proceed to payment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return; // Ensure quantity cannot go below 1
    setIsLoading(true);
    try {
      if (user) {
        const response = await fetch(`/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            cart: [{ productId, quantity: newQuantity }],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update cart quantity");
        }
      }

      // Update local cart state
      updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update cart quantity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    setIsLoading(true);
    try {
      if (user) {
        const response = await fetch(`/api/cart`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            productId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to remove item from cart");
        }
      }

      // Update local cart state
      removeFromCart(productId);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert("Failed to remove item from cart.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      {cart.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <button
            onClick={() => router.push("/")}
            className="text-blue-500 underline"
          >
            Shop Now
          </button>
        </p>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-2">Order Summary</h2>
          <div className="border rounded-lg p-4">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between border-b py-2"
              >
                <div>
                  <h2 className="text-lg font-bold">{item.name}</h2>
                  <p>${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.productId,
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-16 border border-gray-300 rounded px-2 py-1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-red-500 hover:underline"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-4">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={handleCheckout}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
