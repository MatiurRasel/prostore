'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
    return (
        <Card className="h-full overflow-hidden border border-border/50 shadow-sm">
            <div className="aspect-square relative overflow-hidden bg-muted">
                <Skeleton className="h-full w-full" />
            </div>
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/3" /> {/* Brand/Category */}
                <Skeleton className="h-6 w-3/4" /> {/* Name */}
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-6 w-20" /> {/* Price */}
                    <Skeleton className="h-5 w-12" /> {/* Rating */}
                </div>
                <div className="pt-4">
                    <Skeleton className="h-10 w-full rounded-xl" /> {/* Button */}
                </div>
            </CardContent>
        </Card>
    );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
