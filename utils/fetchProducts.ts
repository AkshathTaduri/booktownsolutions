import { Product } from "../app/types/product";

export async function fetchProducts(
  categoryId: string,
  subcategoryId?: string
): Promise<Product[]> {
  try {
    // Build the query parameters
    const params = new URLSearchParams({ category_id: categoryId });
    if (subcategoryId) {
      params.append("subcategory_id", subcategoryId);
    }

    // Make the API call
    const response = await fetch(`/api/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data: Product[] = await response.json();
    return data;
  } catch (err: any) {
    console.error(err.message);
    return [];
  }
}
