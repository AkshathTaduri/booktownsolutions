import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase Client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABSE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SUPABSE_SERVICE_KEY) {
  console.error("Missing Supabase URL or Anon Key in environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABSE_SERVICE_KEY);

// Bucket Name
const BUCKET_NAME = "product-images";

// Upload a Single Image to Supabase Bucket
async function uploadImage(filePath: string, productId: number): Promise<string> {
  try {
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const filePathInBucket = `productimgupload/${productId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePathInBucket, fileData, {
        cacheControl: "3600", // Optional caching
        upsert: false,        // Prevent overwriting
      });

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    // Get Public URL
    const { data: publicData} = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePathInBucket);

    if (!publicData) {
      throw new Error("Failed to retrieve public URL for the uploaded file.");
    }

    const publicURL = publicData.publicUrl;
    console.log(`File uploaded successfully: ${publicURL}`);
    return publicURL;
  } catch (error: any) {
    console.error("Error uploading image:", error.message);
    throw error;
  }
}

// Save Image Link in `productimages` Table
async function saveImageLink(productId: number, imageUrl: string) {
  try {
    const { data, error } = await supabase
      .from("productimages")
      .insert([{ product_id: productId, image_url: imageUrl }]);

    if (error) {
      throw new Error(`Error saving image link: ${error.message}`);
    }

    console.log("Image URL saved to database:", data);
    return data;
  } catch (error: any) {
    console.error("Error saving image link:", error.message);
    throw error;
  }
}

// Upload All Images in the Folder and Save Their Links
async function uploadFolderImages(folderPath: string, productId: number) {
  try {
    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder not found: ${folderPath}`);
    }

    const files = fs.readdirSync(folderPath).filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file) // Only process image files
    );

    if (files.length === 0) {
      console.log("No image files found in the folder.");
      return;
    }

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // Upload image and get public URL
      const imageUrl = await uploadImage(filePath, productId);

      // Save the public URL in the database
      await saveImageLink(productId, imageUrl);
    }

    console.log("All images uploaded and saved successfully.");
  } catch (error: any) {
    console.error("Error uploading folder images:", error.message);
    throw error;
  }
}

// Main Function
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: ts-node uploadProductImages.ts <folderPath> <productId>");
    process.exit(1);
  }

  const [folderPath, productIdString] = args;
  const productId = parseInt(productIdString, 10);

  if (isNaN(productId)) {
    console.error("Invalid productId. It must be a number.");
    process.exit(1);
  }

  try {
    console.log("Uploading images...");
    await uploadFolderImages(folderPath, productId);
    console.log("Operation completed successfully.");
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
