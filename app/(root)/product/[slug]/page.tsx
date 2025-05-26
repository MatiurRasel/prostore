import { Badge } from "@/components/ui/badge";
import { Card,CardContent } from "@/components/ui/card";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";

import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import { auth } from "@/auth";
import Rating from "@/components/shared/product/rating";
import ReviewsCount from "@/components/shared/product/reviews-count";
import ProductDescription from "@/components/shared/product/product-description";
import ProductReviews from "@/components/shared/product/product-reviews";

const ProductDetailsPage = async (props: {
    params: Promise<{slug: string}>
}) => {
    const {slug} = await props.params;

    const product = await getProductBySlug(slug);
    if(!product) notFound();

    const session = await auth();
    const userId = session?.user?.id;

    const cart = await getMyCart();

    return ( 
        <>
           <section>
                <div className="grid grid-cols-1 md:grid-cols-5">
                {/* Images Column */}
                    <div className="col-span-2">
                        <ProductImages images={product.images}>
                            
                        </ProductImages>
                    </div>
                    {/* Details Column */}
                    <div className="col-span-2 p-5">
                        <div className="flex flex-col gap-6">
                            <p>
                                {product.brand} 
                                {product.category}
                            </p>
                            <h1 className="h3-bold">{product.name}</h1>
                            <div className="flex flex-col gap-2">
                                <Rating value={Number(product.rating)} />
                                <ReviewsCount count={product.numReviews} />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <ProductPrice value={Number(product.price)} 
                                    className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2">

                                </ProductPrice>
                            </div>
                        </div>
                        <ProductDescription description={product.description} />
                    </div>
                    {/* Action Column */}
                    <div>
                        <Card>
                            <CardContent className="p-4">
                                <div className="mb-2 flex justify-between">
                                    <div>Price</div>
                                    <div>
                                        <ProductPrice value={Number(product.price)}>

                                        </ProductPrice>
                                    </div>
                                </div>
                                <div className="mb-2 flex justify-between">
                                    <div>Status</div>
                                        {
                                            product.stock > 0 ? (
                                                <Badge variant='outline'>In Stock</Badge>
                                            ) : (
                                                <Badge variant='destructive'>Out Of Stock</Badge>
                                            )
                                        }
                                </div>
                                {product.stock > 0 && (
                                    <div className="flex-center">
                                       <AddToCart 
                                       cart={cart}
                                       item={{
                                        productId: product.id,
                                        name: product.name,
                                        slug: product.slug,
                                        price: product.price,
                                        qty: 1,
                                        image: product.images![0]
                                       }}></AddToCart>
                                    </div>

                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
           </section>
           <ProductReviews 
                userId={userId || ''}
                productId={product.id}
                productSlug={product.slug}
           />
        </>
     );
}
 
export default ProductDetailsPage;