"use client";

import { useState, useEffect, useRef } from "react";
import SubSection from "./subsection"; // Import the new SubSection component
import { Category } from "../types/category";

interface NavbarProps {
  categories?: Category[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null); // Tracks the active dropdown
  const navbarRef = useRef<HTMLDivElement | null>(null);

  const handleCategoryInteraction = (categoryId: number) => {
    // Set the active category on hover or click
    setActiveCategory(categoryId);
  };

  const handleMouseLeaveNavbar = () => {
    // Close the dropdown when the user leaves both the buttons and the dropdown
    setActiveCategory(null);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setActiveCategory(null); // Close dropdown when clicking outside
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <nav
      ref={navbarRef}
      className="relative w-full bg-gray-200 dark:bg-gray-800 py-4 z-10"
    >
      {/* Navbar Content */}
      <div className="flex gap-8 px-8">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => handleCategoryInteraction(category.id)}
            >
              {/* Category Button */}
              <button
                onClick={() => handleCategoryInteraction(category.id)} // Unified behavior for hover and click
                className={`rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
                  activeCategory === category.id ? "bg-blue-700" : ""
                }`}
              >
                {category.category_name}
              </button>
            </div>
          ))
        ) : (
          <span>Loading categories...</span>
        )}
      </div>

      {/* SubSection Dropdown */}
      {activeCategory !== null &&
        categories.find((c) => c.id === activeCategory)?.subcategories && (
          <div
            className="absolute left-0 top-full w-screen bg-white shadow-lg z-20"
            onMouseEnter={() => handleCategoryInteraction(activeCategory)} // Keep it open when hovering the dropdown
            onMouseLeave={handleMouseLeaveNavbar} // Close when leaving the dropdown
          >
            <SubSection
              categoryId={activeCategory.toString()} // Convert to string
              categoryName={
                categories.find((c) => c.id === activeCategory)
                  ?.category_name || ""
              }
              subcategories={
                categories.find((c) => c.id === activeCategory)
                  ?.subcategories || []
              }
            />
          </div>
        )}
    </nav>
  );
}
