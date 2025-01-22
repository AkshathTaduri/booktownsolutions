"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: number;
  name: string;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          `/api/products?name=${encodeURIComponent(searchQuery)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        console.log(data);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products.", err);
      }
    };

    if (searchQuery) {
      loadProducts();
    } else {
      setProducts([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Input Component */}
      <Input
        type="text"
        className="w-full"
        placeholder="Search for a product..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Dropdown Menu */}
      {searchQuery && filteredProducts.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-60 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setSearchQuery(product.name);
                setFilteredProducts([]);
              }}
            >
              {product.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
