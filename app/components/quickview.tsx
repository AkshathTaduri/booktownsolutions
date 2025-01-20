import { useRouter } from "next/navigation";
import {Product } from "../types/product"

export default function QuickView({ product }: { product: Product }) {
  const router = useRouter();

  // Use the first image or a placeholder if the array is empty or undefined
  const imageUrl =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls[0]
      : "/placeholder_book.png"; // Replace with your actual placeholder image path

  return (
    <div
      className="cursor-pointer"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <img
        src={imageUrl}
        alt={product.name}
        className="w-30 h-40 object-cover rounded-lg" // Adjusted width and height
      />
      <h2 className="mt-2 text-sm font-bold text-center">{product.name}</h2>
    </div>
  );
}
