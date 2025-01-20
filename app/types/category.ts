export interface SubCategory {
    id: number;
    sub_category_name: string;
}

export interface Category {
    id: number;
    category_name: string;
    subcategories?: SubCategory[]; // Optional because some categories may not have subcategories
}

export interface CategoryList {
    categories: Category[];
}
