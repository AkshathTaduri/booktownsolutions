"use client";

import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator"; // Import Separator from Shadcn
import SubSection from "./subsection"; // Import SubSection component
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
    <nav ref={navbarRef} className="relative w-full z-10 bg-cyan-500 shadow">
      {/* Navbar Content */}
      <Separator className="mb-2 bg-gray" />
      <div className="flex items-center gap-2 px-8 ">
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <div key={category.id} className="flex items-center">
              {/* Category Button */}
              <button
                onClick={() => handleCategoryInteraction(category.id)}
                onMouseEnter={() => handleCategoryInteraction(category.id)}
                className={`text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors px-4 ${
                  activeCategory === category.id ? "font-bold" : ""
                }`}
              >
                {category.category_name}
              </button>
              {/* Separator after each category except the last one */}
              {index < categories.length - 1 && (
                <Separator
                  orientation="vertical"
                  className="h-6 mx-2 bg-black"
                />
              )}
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
      <Separator className="mt-2" />
    </nav>
  );
}
