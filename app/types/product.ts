export interface Product {
    id: number;
    name: string;
    author: string;
    description: string;
    quantity: number;
    active: boolean | null;
    price: number; // Add price field if applicable
    condition: string; // Add condition field if applicable
    image_urls: string[]; // Array of image URLs
}