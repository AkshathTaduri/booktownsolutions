"use client";

import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to proceed to checkout.");
      router.push("/login");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (
      !shippingAddress.name ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode
    ) {
      alert("Please fill in all required shipping address fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          userId: user.id,
          shippingAddress,
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
                      updateQuantity(
                        item.productId,
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-16 border border-gray-300 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:underline"
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

          <h2 className="text-xl font-bold mt-6">Shipping Address</h2>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <input
              type="text"
              placeholder="Full Name"
              value={shippingAddress.name}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-2 py-1"
              required
            />
            <input
              type="text"
              placeholder="Address Line 1"
              value={shippingAddress.addressLine1}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  addressLine1: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded px-2 py-1"
              required
            />
            <input
              type="text"
              placeholder="Address Line 2 (Optional)"
              value={shippingAddress.addressLine2}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  addressLine2: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="City"
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, city: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-2 py-1"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={shippingAddress.state}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  state: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded px-2 py-1"
              required
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={shippingAddress.zipCode}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  zipCode: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded px-2 py-1"
              required
            />
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
