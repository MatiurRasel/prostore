'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

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
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0"
        >
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 w-[180px] bg-background/60 backdrop-blur-md group">
                <Link href={`/product/${slug}`}>
                    <div className="relative aspect-[4/5] w-full bg-muted/20 overflow-hidden">
                        <Image
                            src={displayImage!}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 backdrop-blur-xl shadow-sm translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <ExternalLink size={12} className="text-primary" />
                        </div>
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                        <div className="space-y-0.5">
                            <h4 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider line-clamp-1">ProStore Selection</h4>
                            <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
                        </div>
                        <div className="flex items-center justify-between items-baseline pt-1">
                            <p className="text-primary font-black text-base tracking-tight">${price}</p>
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">In Stock</span>
                        </div>
                        <div className="w-full mt-2 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-extrabold text-primary text-center group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                            View Deal
                        </div>
                    </CardContent>
                </Link>
            </Card>
        </motion.div>
    );
}
