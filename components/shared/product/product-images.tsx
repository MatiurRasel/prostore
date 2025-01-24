'use client';
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);

    if (!images || images.length === 0) {
        return <p>No images available.</p>;
    }

    return (
        <div className="space-y-4">
            <Image
                src={images[current]}
                alt={`product image ${current + 1}`}
                width={1000}
                height={1000}
                className="min-h-[300px] object-cover object-center"
            />
            <div className="flex">
                {images.map((image, index) => (
                    <div
                        key={`${image}-${index}`}
                        onClick={() => setCurrent(index)}
                        tabIndex={0}
                        aria-selected={current === index}
                        className={cn(
                            'border mr-2 cursor-pointer rounded',
                            current === index ? 'border-orange-500' : 'hover:border-orange-600'
                        )}
                    >
                        <Image
                            src={image}
                            alt={`thumbnail ${index + 1}`}
                            width={100}
                            height={100}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductImages;
