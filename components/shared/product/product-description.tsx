import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
    description: string;
    className?: string;
}

const ProductDescription = ({ description, className }: ProductDescriptionProps) => {
    return (
        <div className={cn("mt-10 space-y-4", className)}>
            <h2 className="text-2xl font-semibold tracking-tight">Product Description</h2>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDescription; 