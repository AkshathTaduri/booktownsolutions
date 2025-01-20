"use client";

import { useEffect, useState } from "react";
import HorizontalSection from "./horizontalsection"; // Import the HorizontalSection component
import { Product } from "../types/product";

interface Category {
  id: number;
  category_name: string;
}

export default function HomeClient({ categories }: { categories: Category[] }) {
  const [categoryProducts, setCategoryProducts] = useState<
    { categoryName: string; products: Product[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCategoriesWithProducts = async () => {
      try {
        const results = await Promise.all(
          categories.map(async (category) => {
            // Fetch products for the current category
            const productResponse = await fetch(
              `/api/products?category_id=${category.id}`
            );
            if (!productResponse.ok) {
              throw new Error(
                `Failed to fetch products for category ${category.id}`
              );
            }
            const products = await productResponse.json();

            // Fetch images for each product and map all product fields
            const productsWithDetails: Product[] = await Promise.all(
              products.map(async (product: Product) => {
                const imageResponse = await fetch(
                  `/api/products/images?product_id=${product.id}`
                );
                if (!imageResponse.ok) {
                  throw new Error(
                    `Failed to fetch images for product ${product.id}`
                  );
                }
                const images = await imageResponse.json();

                return {
                  ...product,
                  image_urls: images.map((img: { image_url: string }) => img.image_url),
                };
              })
            );

            return {
              categoryName: category.category_name,
              products: productsWithDetails,
            };
          })
        );

        setCategoryProducts(results);
      } catch (error) {
        console.error("Error fetching categories or products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCategoriesWithProducts();
  }, [categories]);

  const handleQuickViewClick = (productId: number) => {
    console.log(`Product ${productId} clicked`);
    // Add navigation or other logic for handling product clicks here
  };

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        categoryProducts.map(({ categoryName, products }) => (
          <HorizontalSection
            key={categoryName}
            title={categoryName}
            products={products}
            onQuickViewClick={handleQuickViewClick}
          />
        ))
      )}
    </div>
  );
}
