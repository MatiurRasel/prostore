'use client';

import { cn } from "@/lib/utils";

interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
};

export function Loader({ className, size = 'md' }: LoaderProps) {
    return (
        <div className={cn("relative", sizeClasses[size], className)}>
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader size="lg" className="text-primary" />
                <div className="text-sm text-muted-foreground animate-pulse">
                    Loading...
                </div>
            </div>
        </div>
    );
} 