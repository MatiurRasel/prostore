'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { MotionButton, MotionDiv } from '@/components/ui/motion';

interface Category {
    category: string;
}

interface Price {
    name: string;
    value: string;
}

interface FilterSheetProps {
    categories: Category[];
    prices: Price[];
    ratings: number[];
    category: string;
    price: string;
    rating: string;
}

export function FilterSheet({
    categories,
    prices,
    ratings,
    category,
    price,
    rating
}: FilterSheetProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getFilterUrl = (params: { c?: string; p?: string; r?: string }) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        
        if (params.c) current.set('category', params.c);
        if (params.p) current.set('price', params.p);
        if (params.r) current.set('rating', params.r);
        
        return `/search?${current.toString()}`;
    };

    const handleFilterClick = (url: string) => {
        router.push(url);
    };

    const FilterButton = ({ 
        isActive, 
        onClick, 
        children 
    }: { 
        isActive: boolean; 
        onClick: () => void; 
        children: React.ReactNode;
    }) => (
        <MotionButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-muted/50'
            }`}
        >
            {children}
        </MotionButton>
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <MotionButton
                    className="w-full flex items-center border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                </MotionButton>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg">
                <MotionDiv
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col"
                >
                    <div className="flex-1 py-6">
                        <h2 className="text-lg font-semibold mb-4">Filters</h2>
                        <div className="space-y-4">
                            {/* Category Filters */}
                            <MotionDiv
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-sm font-medium mb-4 text-foreground/80">Department</h3>
                                <div className="space-y-2">
                                    <FilterButton 
                                        isActive={category === 'all'}
                                        onClick={() => handleFilterClick(getFilterUrl({c:'all'}))}
                                    >
                                        Any
                                    </FilterButton>
                                    {categories.map((x) => (
                                        <FilterButton 
                                            key={x.category}
                                            isActive={category === x.category}
                                            onClick={() => handleFilterClick(getFilterUrl({c:x.category}))}
                                        >
                                            {x.category}
                                        </FilterButton>
                                    ))}
                                </div>
                            </MotionDiv>

                            {/* Price Filters */}
                            <MotionDiv
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <h3 className="text-sm font-medium mb-4 text-foreground/80">Price</h3>
                                <div className="space-y-2">
                                    <FilterButton 
                                        isActive={price === 'all'}
                                        onClick={() => handleFilterClick(getFilterUrl({p:'all'}))}
                                    >
                                        Any
                                    </FilterButton>
                                    {prices.map((p) => (
                                        <FilterButton 
                                            key={p.value}
                                            isActive={price === p.value}
                                            onClick={() => handleFilterClick(getFilterUrl({p:p.value}))}
                                        >
                                            {p.name}
                                        </FilterButton>
                                    ))}
                                </div>
                            </MotionDiv>

                            {/* Rating Filters */}
                            <MotionDiv
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <h3 className="text-sm font-medium mb-4 text-foreground/80">Customer Ratings</h3>
                                <div className="space-y-2">
                                    <FilterButton 
                                        isActive={rating === 'all'}
                                        onClick={() => handleFilterClick(getFilterUrl({r:'all'}))}
                                    >
                                        Any
                                    </FilterButton>
                                    {ratings.map((r) => (
                                        <FilterButton 
                                            key={r}
                                            isActive={rating === r.toString()}
                                            onClick={() => handleFilterClick(getFilterUrl({r:`${r}`}))}
                                        >
                                            {`${r} stars & up`}
                                        </FilterButton>
                                    ))}
                                </div>
                            </MotionDiv>
                        </div>
                    </div>
                    <div className="border-t p-4">
                        <Button className="w-full">Apply Filters</Button>
                    </div>
                </MotionDiv>
            </SheetContent>
        </Sheet>
    );
} 