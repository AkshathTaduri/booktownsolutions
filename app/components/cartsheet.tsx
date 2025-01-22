"use client";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartSheet() {
  const { cart, totalPrice, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return; // Ensure no quantity below 1
    setIsUpdating(true);
    updateQuantity(productId, quantity);
    setIsUpdating(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h18M3 3a2.003 2.003 0 00-2 2v14a2.003 2.003 0 002 2h18a2.003 2.003 0 002-2V5a2.003 2.003 0 00-2-2H3zm4 5h10m-6 0h6"
            />
          </svg>
          {cart.length > 0 && (
            <span className="absolute top-2.5 left-3 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Review your items and update your cart before checkout.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center border-b py-2"
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
                      disabled={isUpdating}
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
          )}
        </div>
        {cart.length > 0 && (
          <div className="mt-6 text-right">
            <button
              onClick={() => router.push("/checkout")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
