"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "../types/product";
import ProductCard from "../components/productcard";
import { useCategory } from "@/app/context/CategoryContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export async function fetchProducts(
  categoryId: string,
  subcategoryId?: string
): Promise<Product[]> {
  try {
    const params = new URLSearchParams({ category_id: categoryId });
    if (subcategoryId) {
      params.append("subcategory_id", subcategoryId);
    }

    const response = await fetch(`/api/products?${params.toString()}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products. Status: ${response.status} ${response.statusText}`
      );
    }

    const products: Product[] = await response.json();

    await Promise.all(
      products.map(async (product) => {
        try {
          const imageResponse = await fetch(
            `/api/products/images?product_id=${product.id}`
          );

          if (!imageResponse.ok) {
            console.error(
              `Failed to fetch images for product ID ${product.id}. Status: ${imageResponse.status} ${imageResponse.statusText}`
            );
            product.image_urls = [];
            return;
          }

          const images = await imageResponse.json();
          product.image_urls = images.map(
            (img: { image_url: string }) => img.image_url
          );
        } catch (imageError) {
          console.error(
            `Error fetching images for product ID ${product.id}:`,
            imageError
          );
          product.image_urls = [];
        }
      })
    );

    return products;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id");
  const subcategoryId = searchParams.get("subcategory_id");
  const [products, setProducts] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState("relevance");
  const { categories, loading } = useCategory();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (categoryId) {
        const data = await fetchProducts(
          categoryId,
          subcategoryId || undefined
        );
        setProducts(data);
      }
    };
    fetchCategoryAndProducts();
  }, [categoryId, subcategoryId]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "low_to_high") {
      return a.price - b.price;
    } else if (sortOption === "high_to_low") {
      return b.price - a.price;
    }
    return 0;
  });

  if (loading) {
    return <p>Loading categories...</p>;
  }

  const category = categories.find((cat) => cat.id.toString() === categoryId);
  const subcategory = category?.subcategories?.find(
    (sub) => sub.id.toString() === subcategoryId
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-gray-500 hover:underline">
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/products?category_id=${category.id}`}
                    className="text-gray-500 hover:underline"
                  >
                    {category.category_name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
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
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {subcategory?.sub_category_name ||
                category?.category_name ||
                "All Products"}
            </h2>
            <p className="text-gray-500">{sortedProducts.length} Products</p>
          </div>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="relevance">Sort By: Relevance</option>
            <option value="low_to_high">Price: Low to High</option>
            <option value="high_to_low">Price: High to Low</option>
          </select>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
