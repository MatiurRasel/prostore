'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "./product-price";
import { Product } from "@/types";
import Rating from "./rating";
import { ShoppingBag } from "lucide-react";
import { MotionButton } from '@/components/ui/motion';

const ProductCard = ({product, onAddToCart} : { product: Product; onAddToCart?: (product: Product) => void;}) => {
    const imageUrl = product.images?.[0] || "/images/placeholder.png";
    
    return ( 
        <Card className="w-full max-w-sm group relative overflow-visible">
            <CardHeader className="p-0 items-center relative">
                <Link href={`/product/${product.slug}`}>
                    <Image 
                        src={imageUrl}
                        alt={product.name}
                        height={300}
                        width={300}
                        priority={true}
                        className="rounded-t-lg object-cover w-full h-[200px]"
                    />
                </Link>
                {/* Floating Add to Cart Button */}
                {product.stock > 0 && (
                    <MotionButton
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onAddToCart && onAddToCart(product)}
                        className="absolute top-3 right-3 z-10 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-2 shadow-lg transition-all duration-200
                        opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                        aria-label="Add to cart"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </MotionButton>
                )}
            </CardHeader>
            <CardContent className="p-4 grid gap-4">
                <div className="text-xs">{product.brand}</div>
                    <Link href={`/product/${product.slug}`}>
                        <h2 className="text-sm font-medium">
                            {product.name}
                        </h2>
                    </Link>
                    <div className="flex-between gap-4">
                    <Rating value={Number(product.rating)} />
                        {product.stock > 0 ? (
                           <ProductPrice value={Number(product.price)}></ProductPrice>
                        ):(
                            <p className="text-destructive">Out Of Stock</p>
                        )}
                    </div>
            </CardContent>
        </Card>
     );
}
 
export default ProductCard;