'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface ChatProductCardProps {
    name: string;
    price: string;
    slug: string;
    image?: string;
}

const isValidUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
};

export function ChatProductCard({ name, price, slug, image }: ChatProductCardProps) {
    const displayImage = isValidUrl(image) ? image : '/images/placeholder.jpg';

    return (
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-[200px] shrink-0 bg-background/80">
            <Link href={`/product/${slug}`}>
                <div className="relative aspect-square w-full bg-muted">
                    <Image
                        src={displayImage!}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                </div>
                <CardContent className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-1">{name}</h4>
                    <p className="text-primary font-bold text-xs">${price}</p>
                </CardContent>
            </Link>
        </Card>
    );
}
