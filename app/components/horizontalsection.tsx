"use client";

import React, { useState, useRef, useEffect } from "react";
import QuickView from "./quickview";
import { Product } from "../types/product";

interface HorizontalSectionProps {
  title: string;
  products: Product[];
  onSeeMoreClick: () => void; // Function to handle the "See More" button click
}

const HorizontalSection: React.FC<HorizontalSectionProps> = ({
  title,
  products,
  onSeeMoreClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    // Calculate how many items fit in the container based on its width
    const updateItemsPerView = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const itemWidth = 144; // Width of a single QuickView item (based on the w-36 class)
        setItemsPerView(Math.floor(containerWidth / itemWidth));
      }
    };

    // Initialize and update on resize
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => {
      window.removeEventListener("resize", updateItemsPerView);
    };
  }, []);

  // Scroll to the left
  const handleLeftClick = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  // Scroll to the right
  const handleRightClick = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, products.length - itemsPerView)
    );
  };

  return (
    <div className="p-4 relative">
      {/* Title */}
      <h2 className="text-xl font-bold mb-2">{title}</h2>

      {/* Left Arrow */}
      <button
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow ${
          currentIndex === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        onClick={handleLeftClick}
        disabled={currentIndex === 0}
      >
        ←
      </button>

      {/* Right Arrow */}
      <button
        className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow ${
          currentIndex >= products.length - itemsPerView
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        onClick={handleRightClick}
        disabled={currentIndex >= products.length - itemsPerView}
      >
        →
      </button>

      {/* Horizontal Scrollable Section */}
      <div className="flex overflow-x-hidden space-x-4 p-2" ref={containerRef}>
        {products
          .slice(currentIndex, currentIndex + itemsPerView)
          .map((product) => (
            <QuickView key={product.id} product={product} />
          ))}
      </div>

      {/* "See More" Button */}
      {products.length > 20 && (
        <div className="mt-4 text-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onSeeMoreClick}
          >
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default HorizontalSection;
