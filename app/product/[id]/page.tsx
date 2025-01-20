"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext"; // Import CartContext

interface Product {
  id: number;
  name: string;
  author: string;
  description: string;
  quantity: number;
  active: boolean | null;
  price: number;
  condition: string;
  image_urls: string[];
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams(); // Use useParams to get the `id`
  const { addToCart } = useCart(); // Access the addToCart function from CartContext

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!params?.id) {
          throw new Error("Product ID not found in the URL");
        }

        const response = await fetch(`/api/products/${params.id}`); // Adjust API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params?.id]); // Ensure params?.id is included in the dependency array

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1, // Add 1 item by default
      });
      alert("Added to cart!");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Product Title */}
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <h2 className="text-lg text-gray-600 mt-2">by {product.author}</h2>

      {/* Product Image and Details */}
      <div className="flex flex-wrap mt-4">
        {/* Left: Product Image */}
        <div className="w-full md:w-1/3">
          <img
            src={product.image_urls[0] || "/placeholder_book.png"} // Add placeholder fallback
            alt={product.name}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-2/3 md:pl-8">
          <p className="text-2xl font-semibold text-green-600">
            ${product.price}
          </p>
          <p className="mt-2 text-gray-600">
            <strong>Condition:</strong> {product.condition}
          </p>
          <p className="mt-2 text-gray-600">
            <strong>Stock:</strong>{" "}
            {product.quantity > 0
              ? `${product.quantity} in stock`
              : "Out of stock"}
          </p>
          <button
            className={`mt-4 px-4 py-2 ${
              product.quantity > 0
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-gray-400 cursor-not-allowed"
            } text-white rounded`}
            onClick={handleAddToCart}
            disabled={product.quantity <= 0} // Disable if out of stock
          >
            {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-8">
        <h3 className="text-xl font-bold">Description</h3>
        <p className="mt-2 text-gray-700">{product.description}</p>
      </div>
    </div>
  );
}
