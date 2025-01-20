"use client";

import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: number;
  name: string;
  author: string;
  price: number;
  image_urls?: string[]; // Make image_urls optional
}

const ProductCard = ({
  id,
  name,
  author,
  price,
  image_urls,
}: ProductCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${id}`); // Navigate to product detail page
  };

  const imageUrl = image_urls?.length ? image_urls[0] : "/placeholder_book.png";

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border border-gray-300 rounded-lg p-4 hover:shadow-lg transition"
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-48 object-cover mb-4"
      />
      <h3 className="font-medium text-lg">{name}</h3>
      <p className="text-gray-600">{author}</p>
      <p className="text-blue-600 font-semibold mt-2">${price.toFixed(2)}</p>
    </div>
  );
};

export default ProductCard;
