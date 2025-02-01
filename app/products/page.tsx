"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/utils/fetchProducts";
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

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id");
  const subcategoryId = searchParams.get("subcategory_id");
  const [products, setProducts] = useState<Product[]>([]);
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

  if (loading) {
    return <p>Loading categories...</p>;
  }

  // Find the category and subcategory names
  const category = categories.find((cat) => cat.id.toString() === categoryId);
  const subcategory = category?.subcategories?.find(
    (sub) => sub.id.toString() === subcategoryId
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Breadcrumb Navigation */}
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
