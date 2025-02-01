import { NextResponse } from "next/server";
import fsPromises from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data/categories.json");
    const data = await fsPromises.readFile(filePath, "utf-8");
    const categories = JSON.parse(data);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error reading categories.json:", error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
