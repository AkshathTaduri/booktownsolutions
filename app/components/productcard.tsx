"use client";

import { useRouter } from "next/navigation";
import { Product } from "../types/product";

const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${product.id}`);
  };

  const imageUrl = product.image_urls?.length
    ? product.image_urls[0]
    : "/placeholder_book.png";
  console.log(imageUrl);
  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border border-gray-300 rounded-lg p-4 hover:shadow-lg transition"
    >
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover mb-4"
      />
      <h3 className="font-medium text-lg">{product.name}</h3>
      <p className="text-gray-600">{product.author}</p>
      <p className="text-blue-600 font-semibold mt-2">
        ${product.price.toFixed(2)}
      </p>
    </div>
  );
};

export default ProductCard;
