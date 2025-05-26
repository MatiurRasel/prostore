import { cn } from "@/lib/utils";
import ReviewList from "@/app/(root)/product/[slug]/review-list";

interface ProductReviewsProps {
    userId: string;
    productId: string;
    productSlug: string;
    className?: string;
}

const ProductReviews = ({ userId, productId, productSlug, className }: ProductReviewsProps) => {
    return (
        <section className={cn("mt-16", className)}>
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">Customer Reviews</h2>
                <p className="text-muted-foreground">What our customers are saying about this product</p>
            </div>
            <div className="mt-6 bg-card shadow-sm">
                <ReviewList 
                    userId={userId}
                    productId={productId}
                    productSlug={productSlug}
                />
            </div>
        </section>
    );
};

export default ProductReviews; 