export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  export const syncCart = async (userId: string, guestCart: CartItem[]) => {
    const response = await fetch(`/api/cart?userId=${userId}`);
    const userCart = await response.json();
  
    const mergedCart = [...userCart, ...guestCart].reduce((acc, item) => {
      const existingItem = acc.find((i:any) => i.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as CartItem[]);
  
    await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cart: mergedCart }),
    });
  
    localStorage.removeItem("cart");
  };
  