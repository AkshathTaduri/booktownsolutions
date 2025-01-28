import { useRouter } from "next/navigation";
import { Product } from "../types/product";

export default function QuickView({ product }: { product: Product }) {
  const router = useRouter();

  // Use the first image or a placeholder if the array is empty or undefined
  const imageUrl =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls[0]
      : "/placeholder_book.png"; // Replace with your actual placeholder image path

  return (
    <div
      className="cursor-pointer w-36"
      onClick={() => router.push(`/product/${product.id}`)}
      style={{
        flexShrink: 0, // Prevent the component from shrinking in a flex container
      }}
    >
      <img
        src={imageUrl}
        alt={product.name}
        className="w-36 h-48 object-cover rounded-lg shadow-md"
        style={{
          width: "144px", // Fixed width (consistent with w-36)
          height: "192px", // Fixed height (consistent with h-48)
        }}
      />
      <h2
        className="mt-2 text-sm font-bold text-center truncate"
        style={{
          maxWidth: "144px", // Matches the fixed width of the container
        }}
      >
        {product.name}
      </h2>
      <p
        className="text-xs text-gray-600 text-center truncate"
        style={{
          maxWidth: "144px", // Matches the fixed width of the container
        }}
      >
        {product.author || "Unknown Author"}
      </p>
    </div>
  );
}
