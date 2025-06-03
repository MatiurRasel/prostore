'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Product } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";

const ProductCarousel = ({data}: {data: Product[]}) => {
    return ( 
        <Carousel className="w-full mb-12" opts={{
            loop: true,
        }}
        plugins={[
            Autoplay({
                delay: 5000,
                stopOnInteraction: true,
                stopOnFocusIn: true,
            })
        ]}>
            <CarouselContent>
            {data.map((product: Product) => (
              <CarouselItem key={product.id}>
                <Link href={`/product/${product.slug}`}>
                  <div className="relative mx-auto w-full h-48 sm:h-64 md:h-80 lg:h-96">
                    {product.banner ? (
                      <Image
                        src={product.banner}
                        alt={product.name}
                        fill
                        sizes="100vw"
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                        No Image Available
                      </div>
                    )}
            
                    <div className="absolute inset-0 flex items-end justify-center">
                      <div className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                        {product.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious/>
            <CarouselNext/>
            
        </Carousel>
     );
}
 
export default ProductCarousel;