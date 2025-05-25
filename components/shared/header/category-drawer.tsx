import { getAllCategories } from "@/lib/actions/product.actions";
import CategoryDrawerClient from "./category-drawer-client";

const CategoryDrawer = async() => {
    const categories = await getAllCategories();
    // Serialize the data to plain objects
    const serializedCategories = categories.map(cat => ({
        category: cat.category,
        count: cat._count
    }));
    
    return <CategoryDrawerClient categories={serializedCategories} />;
}
 
export default CategoryDrawer;