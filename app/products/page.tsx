"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/utils/fetchProducts";
import { Product } from "../types/product";
import ProductCard from "../components/productcard";

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id");
  const subcategoryId = searchParams.get("subcategory_id");
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [subcategoryName, setSubcategoryName] = useState<string>("");

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (categoryId) {
        // Fetch products
        const data = await fetchProducts(
          categoryId,
          subcategoryId || undefined
        );
        setProducts(data);

        // Fetch category name
        const categoryResponse = await fetch(`/api/categories/${categoryId}`);
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategoryName(categoryData.category_name);
        }

        // Fetch subcategory name if subcategoryId is provided
        if (subcategoryId) {
          const subcategoryResponse = await fetch(
            `/api/subcategories/${subcategoryId}`
          );
          if (subcategoryResponse.ok) {
            const subcategoryData = await subcategoryResponse.json();
            console.log(subcategoryData);
            setSubcategoryName(subcategoryData.subcategory_name);
          }
        }
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId, subcategoryId]);

  return (
    <div className="flex">
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {subcategoryName || categoryName || "All Products"}
            </h2>
            <p className="text-gray-500">{products.length} Products</p>
          </div>
          <select className="border border-gray-300 rounded px-2 py-1">
            <option>Sort By: Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
