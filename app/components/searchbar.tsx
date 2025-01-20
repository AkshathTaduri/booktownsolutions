"use client";

import { useState, useEffect } from "react";

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
        const response = await fetch(`/api/products?name=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
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
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search for a product..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && filteredProducts.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-60 overflow-y-auto">
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSearchQuery(product.name);
                setFilteredProducts([]);
              }}
            >
              {product.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
