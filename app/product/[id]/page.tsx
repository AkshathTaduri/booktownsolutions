"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCategory } from "@/app/context/CategoryContext";

interface Product {
  id: number;
  name: string;
  category_id: number;
  subcategory_id: number | null;
  author: string;
  description: string;
  quantity: number;
  active: boolean | null;
  price: number;
  image_urls: string[];
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [inFocusImage, setInFocusImage] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const params = useParams();
  const { addToCart } = useCart();
  const { categories, loading: loadingCategories } = useCategory();
  console.log(categories);
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
        setLoadingProduct(false);
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

  if (loadingProduct || loadingCategories) {
    return <p>Loading...</p>;
  }

  if (!product) {
    return <p>Product not found</p>;
  }

  // Get category and subcategory names from the categories context
  const category = categories.find((cat) => cat.id === product.category_id);
  const subcategory = category?.subcategories?.find(
    (sub) => sub.id === product.subcategory_id
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* ShadCN Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-gray-500 hover:underline">
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                 href={`/products?category_id=${category?.id}`}
                className="text-gray-500 hover:underline"
              >
                {category?.category_name || "Unknown Category"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {subcategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                     href={`/products?category_id=${category?.id}&subcategory_id=${subcategory.id}`}
                    className="text-gray-500 hover:underline"
                  >
                    {subcategory.sub_category_name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Product Section */}
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

        {/* Middle: In-Focus Image */}
        <div className="w-[400px] h-[400px] bg-white shadow-lg flex justify-center items-center">
          <img
            src={inFocusImage || "/placeholder_book.png"}
            alt="In Focus"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Right: Product Information */}
        <div className="flex flex-col space-y-4 w-full md:w-1/3 pl-10">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <h2 className="text-md text-gray-600 mt-1">by {product.author}</h2>

          {/* Price & Stock */}
          <div className="mt-4">
            <p className="text-2xl font-semibold text-green-600">
              ${product.price}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Condition: <span className="font-medium">{"Very Good"}</span>
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
        </div>
      </div>

      {/* Description Section */}
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
