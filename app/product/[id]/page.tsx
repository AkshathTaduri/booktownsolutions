"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

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
  const [inFocusImage, setInFocusImage] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false); // Toggle for full description
  const params = useParams();
  const { addToCart } = useCart();
  const IMAGE_BOX_SIZE = 400; // Fixed size for the image container

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!params?.id) {
          throw new Error("Product ID not found in the URL");
        }

        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const productData = await response.json();
        setProduct(productData);
        setInFocusImage(productData.image_urls[0] || "/placeholder_book.png");
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params?.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1, // Always add 1 item
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
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-wrap md:flex-nowrap items-start space-x-8">
        {/* Left: Small Thumbnails */}
        <div className="flex flex-col space-y-2">
          {product.image_urls.length > 0 ? (
            product.image_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Thumbnail ${index + 1}`}
                className={`cursor-pointer rounded-md shadow-md w-16 h-20 object-cover ${
                  inFocusImage === url
                    ? "ring-2 ring-yellow-500"
                    : "hover:ring-2 hover:ring-gray-300"
                }`}
                onClick={() => setInFocusImage(url)}
              />
            ))
          ) : (
            <img
              src="/placeholder_book.png"
              alt="Placeholder"
              className="rounded-md shadow-md w-16 h-20"
            />
          )}
        </div>

        {/* Middle: In-Focus Image inside a 400x400 box (Fits Entire Image) */}
        <div className="w-[400px] h-[400px] bg-white shadow-lg flex justify-center items-center">
          <img
            src={inFocusImage || "/placeholder_book.png"}
            alt="In Focus"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Right: Additional Information & Add to Cart */}
        <div className="flex flex-col space-y-4 w-full md:w-1/3 pl-10">
          {/* Product Info */}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <h2 className="text-md text-gray-600 mt-1">by {product.author}</h2>

          {/* Price and Stock Info */}
          <div className="mt-4">
            <p className="text-2xl font-semibold text-green-600">
              ${product.price}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Condition:{" "}
              <span className="font-medium">{product.condition}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Stock:{" "}
              <span
                className={`font-medium ${
                  product.quantity > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.quantity > 0
                  ? `${product.quantity} in stock`
                  : "Out of stock"}
              </span>
            </p>
            <button
              className={`mt-4 px-6 py-2 ${
                product.quantity > 0
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white rounded w-full`}
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
            >
              {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-bold">Summary</h3>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>Free shipping in the US over $10</li>
              <li>Supporting authors with AuthorSHARE</li>
              <li>100% recyclable packaging</li>
              <li>Proud to be a B Corp - A Business for good</li>
              <li>Sell-back with World of Books - Sell your Books</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Description Below */}
      <div className="mt-10">
        <h3 className="text-lg font-bold">Description</h3>
        <p
          className={`mt-2 text-gray-700 ${
            !showFullDescription ? "line-clamp-4" : ""
          }`}
        >
          {product.description}
        </p>
        {product.description.split(" ").length > 50 && (
          <button
            className="text-blue-600 mt-2 text-sm"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
}
