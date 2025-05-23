import notFound from "@/app/not-found";
import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/actions/product.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Update Product'
}

const AdminProductUpdatePage = async(props: {
    params: Promise<{id: string}>
}) => {
    
    const {id} = await props.params;
    const product = await getProductById(id);

    if(!product) {
        return notFound();
    }

    return ( 
        <div className="space-y-8 max-w-5x mx-auto">
            <h1 className="font-bold">Update Product</h1>
            <ProductForm type="Update" product={product} productId={product.id}/>
        </div>
     );
}
 
export default AdminProductUpdatePage;