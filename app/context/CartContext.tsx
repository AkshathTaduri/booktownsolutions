"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { supabase } from "@/lib/supabaseClient";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  setCart: Dispatch<SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from local storage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Helper to get the logged-in user ID
  const getUserId = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      console.error("Error fetching user:", error?.message);
      return null;
    }
    return data.user.id;
  };

  // Add item to the cart
  const addToCart = async (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.productId === item.productId);
      if (existingItem) {
        return prevCart.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevCart, item];
    });

    const userId = await getUserId();
    if (userId) {
      try {
        const response = await fetch(`/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            cart: [{ productId: item.productId, quantity: item.quantity }],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            `Failed to add item to backend: ${
              errorData.error || response.statusText
            }`
          );
        }
      } catch (error) {
        console.error("Error adding item to backend:", error);
      }
    }
  };

  // Remove item from the cart
  const removeFromCart = async (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );

    const userId = await getUserId();
    if (userId) {
      try {
        const response = await fetch(`/api/cart`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            `Failed to remove item from backend: ${
              errorData.error || response.statusText
            }`
          );
        }
      } catch (error) {
        console.error("Error removing item from backend:", error);
      }
    }
  };

  // Update quantity of an item in the cart
  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );

    const userId = await getUserId();
    if (userId) {
      try {
        const response = await fetch(`/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            cart: [{ productId, quantity }],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            `Failed to update item quantity in backend: ${
              errorData.error || response.statusText
            }`
          );
        }
      } catch (error) {
        console.error("Error updating item quantity in backend:", error);
      }
    }
  };

  // Clear the cart
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");

    const userId = await getUserId();
    if (userId) {
      try {
        const response = await fetch(`/api/cart/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            `Failed to clear cart in backend: ${
              errorData.error || response.statusText
            }`
          );
        }
      } catch (error) {
        console.error("Error clearing cart in backend:", error);
      }
    }
  };

  const syncCart = async () => {
    const userId = await getUserId();
    if (!userId) {
      console.error("Error: userId is required for syncing the cart.");
      return;
    }

    const guestCart = cart; // Local cart (guest cart)
    console.log("Guest Cart:", guestCart);

    try {
      // Fetch the user's existing cart from the backend
      const response = await fetch(`/api/cart?userId=${userId}`);
      const userCart = await response.json();

      if (!response.ok) {
        throw new Error(userCart.error || "Failed to fetch user cart");
      }

      console.log("User Cart:", userCart);

      let finalCart: CartItem[];

      if (userCart.length > 0) {
        // If the user's cart is not empty, fetch product details for the user's cart
        const productIds = userCart
          .map((item: any) => item.product_id)
          .join(",");
        const productResponse = await fetch(`/api/products?ids=${productIds}`);
        const products = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(products.error || "Failed to fetch product details");
        }

        // Map user cart items to include product information
        finalCart = userCart.map((item: any) => {
          const product = products.find((p: any) => p.id === item.product_id);
          return {
            productId: item.product_id,
            name: product?.name || "Unknown Product",
            price: product?.price || 0,
            quantity: item.quantity,
          };
        });
        console.log("Final User Cart with Product Info:", finalCart);
      } else {
        // If the user's cart is empty, use the guest cart and fetch product details
        // const productIds = guestCart.map((item: any) => item.productId).join(",");
        // const productResponse = await fetch(`/api/products?ids=${productIds}`);
        // const products = await productResponse.json();

        // if (!productResponse.ok) {
        //   throw new Error(products.error || "Failed to fetch product details");
        // }

        // finalCart = guestCart.map((item: any) => {
        //   const product = guestCart.find((p: any) => p.id === item.productId);
        //   return {
        //     productId: item.productId,
        //     name: product?.name || "Unknown Product",
        //     price: product?.price || 0,
        //     quantity: item.quantity,
        //   };
        // });
        // console.log("Final Guest Cart with Product Info:", finalCart);

        finalCart = guestCart;

        // Push the guest cart to the backend
        const postResponse = await fetch(`/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, cart: finalCart }),
        });

        if (!postResponse.ok) {
          const errorData = await postResponse.json();
          throw new Error(errorData.error || "Failed to sync cart to backend");
        }
      }

      // Update local state and localStorage with the final cart
      setCart(finalCart);
      localStorage.setItem("cart", JSON.stringify(finalCart));
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  // Calculate total items in the cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price of the cart
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
        totalItems,
        totalPrice,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
