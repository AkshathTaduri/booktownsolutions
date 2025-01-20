"use client";

import { useRouter } from "next/navigation"; // Import from "next/navigation" for App Router

interface SubCategory {
  id: number;
  sub_category_name: string;
}

interface SubSectionProps {
  categoryId: string; // Ensure this is a string
  categoryName: string;
  subcategories: SubCategory[];
}

const SubSection = ({
  categoryId,
  categoryName,
  subcategories,
}: SubSectionProps) => {
  const router = useRouter(); // Ensure this is from "next/navigation"

  const handleOptionClick = (subcategoryId?: string) => {
    // Navigate to the products page with selected category/subcategory
    router.push(
      `/products?category_id=${categoryId}${
        subcategoryId ? `&subcategory_id=${subcategoryId}` : ""
      }`
    );
  };

  return (
    <div className="absolute left-0 top-full w-screen bg-white shadow-lg z-20">
      <ul className="grid grid-cols-4 gap-4 px-8 py-4">
        {/* All {category_name} Books Option */}
        <li
          onClick={() => handleOptionClick()}
          className="font-semibold text-blue-600 cursor-pointer hover:underline"
        >
          All {categoryName} Books
        </li>

        {/* Render Subcategories */}
        {subcategories.map((subcategory) => (
          <li
            key={subcategory.id}
            onClick={() => handleOptionClick(subcategory.id.toString())}
            className="text-gray-800 cursor-pointer hover:text-blue-600 hover:underline"
          >
            {subcategory.sub_category_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubSection;
