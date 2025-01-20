import fsPromises from "fs/promises";
import path from "path";
import HomeClient from "./components/homeclient";

interface SubCategory {
  id: number;
  sub_category_name: string;
}

interface Category {
  id: number;
  category_name: string;
  subcategories?: SubCategory[]; // Optional since not all categories may have subcategories
}

// Server Component: Fetch categories and pass them as props
export default async function Page() {
  const filePath = path.join(process.cwd(), "data/categories.json");
  const jsonData = await fsPromises.readFile(filePath, "utf-8");
  const data = JSON.parse(jsonData) as Category[];

  return (
    <div>
      <HomeClient categories={data} />
    </div>
  );
}
