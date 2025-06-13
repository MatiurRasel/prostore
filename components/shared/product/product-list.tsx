'use client';

import ProductCard from "./product-card";
import { Product } from "@/types";
import { addItemsToCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

const ProductList = ({data, title, limit} : {
    data: Product[]; 
    title?: string; 
    limit?: number; 
}) => {
    const limitedData = limit ? data.slice(0, limit) : data;
    const { toast } = useToast();
    const [, startTransition] = useTransition();
    const router = useRouter();

    const handleAddToCart = (product: Product) => {
        startTransition(async () => {
            try {
                const res = await addItemsToCart({
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    qty: 1,
                    image: product.images?.[0] || ""
                });
                if (res.success) {
                    toast({
                        description: 'Added to cart successfully',
                        action: (
                            <ToastAction
                                className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                                altText="Go To Cart"
                                onClick={() => router.push('/cart')}
                            >
                                Go To Cart
                            </ToastAction>
                        )
                    });
                } else {
                    toast({ description: res.message, variant: "destructive" });
                }
            } finally {
            }
        });
    };

    return (
        <div className="my-10">
            <h2 className="h2-bold mb-4">{title}</h2>
            {data.length > 0 ? (
                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {limitedData.map((product: Product) =>{
                        const plainProduct = JSON.parse(JSON.stringify({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            category: product.category,
                            images: product.images,
                            brand: product.brand,
                            description: product.description,
                            stock: product.stock,
                            price: product.price,
                            rating: product.rating,
                            numReviews: product.numReviews,
                            isFeatured: product.isFeatured,
                            banner: product.banner,
                            createdAt: product.createdAt
                        }));
                        return (
                            <ProductCard key={plainProduct.slug} product={plainProduct} onAddToCart={() => handleAddToCart(plainProduct)}/>
                        );
                    })}
                </div>
            ): (
                <div>
                    <p>No Products found</p>
                </div>
            )}
        </div>
      );
}
 
export default ProductList;