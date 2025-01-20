"use client";

import React from "react";
import QuickView from "./quickview";
import {Product} from "../types/product";

interface HorizontalSectionProps {
  title: string;
  products: Product[];
  onQuickViewClick: (productId: number) => void; // Function to handle click events for QuickView
}

const HorizontalSection: React.FC<HorizontalSectionProps> = ({ title, products, onQuickViewClick }) => {
  return (
    <div className="p-4">
      {/* Title */}
      <h2 className="text-xl font-bold mb-2">{title}</h2>

      {/* Horizontal Scrollable Section */}
      <div className="flex overflow-x-auto space-x-4 p-2">
        {products.map((product) => (
          <QuickView
          key={product.id}
          product={product} // Pass product ID
        />
        
        ))}
      </div>
    </div>
  );
};

export default HorizontalSection;
