'use client';
import { Review } from "@/types";
import Link from "next/link";
import {  useState } from "react";
import ReviewForm from "./review-form";
import { getReviews } from "@/lib/actions/review.actions";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";


const ReviewList = ({
    userId,
    productId,
    productSlug
}: {
    userId: string;
    productId: string;
    productSlug: string;
}) => {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const loadReviews = async () => {
            const res = await getReviews({productId});
            setReviews(res.data);
        }
        loadReviews();
    }, [productId]);

    //Reload reviews after either creating or updating a review
    const reload = async () => {
        const res = await getReviews({productId});
        setReviews(res.data);
    }   

    return ( 
        <div className="space-y-4">
         {reviews.length === 0 && 
         <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No reviews yet</p>
         </div>
         }
         {
            userId ? (
                <ReviewForm 
                userId={userId}
                productId={productId}
                onReviewSubmitted={reload}
                />
            ) : (
                <div>
                    Please <Link className="text-blue-700 px-2 py-1 rounded-md" 
                    href={`/sign-in?callbackUrl=/product/${productSlug}`}>Sign in</Link> to write a review
                </div>
            )
         }
         <div className="flex flex-col gap-3">
            {reviews.map((review) => (
                
                <Card key={review.id}>
                    <CardHeader>
                        <div className="flex-between">
                            <CardTitle>{review.title}</CardTitle>
                        </div>
                        <CardDescription>{review.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                            {/* Rating */}
                            <Rating value={review.rating} />
                            <div className="flex items-center">
                               <User className="mr-1 h-3 w-3" />
                               {review.user?review.user.name:'User'}
                            </div>
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {formatDateTime(review.createdAt).dateTime}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
         </div>
        </div>
     );
}
 
export default ReviewList;