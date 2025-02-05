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

    // Make the API call to fetch products
    const response = await fetch(`/api/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    
    const products: Product[] = await response.json();
    
    // Fetch images for each product
    await Promise.all(
      products.map(async (product) => {
        const imageResponse = await fetch(`/api/products/images?product_id=${product.id}`);
        if (imageResponse.ok) {
          const images = await imageResponse.json();
          product.image_urls = images.map((img: { image_url: string }) => img.image_url);
        } else {
          product.image_urls = [];
        }
      })
    );
    
    return products;
  } catch (err: any) {
    console.error(err.message);
    return [];
  }
}