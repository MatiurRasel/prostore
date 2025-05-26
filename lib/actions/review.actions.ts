'use server';

//create & update review

import { z } from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>) {
   
    try {
        const session = await auth();
        if(!session) throw new Error('User is not authenticated');

        //validate and store review
        const review = insertReviewSchema.parse({
            ...data,
            userId: session?.user?.id,
        });

        //Get Product that is being reviewed
        const product = await prisma.product.findFirst({
            where: {
                id: review.productId,
            }
        })

        if(!product) throw new Error('Product not found');
        
        //Check if user has already reviewed this product
        const reviewExists = await prisma.review.findFirst({
            where: {
                userId: review.userId,
                productId: review.productId,
            }
        });

        await prisma.$transaction(async (tx) => {
            if(reviewExists) {
                //Update existing review
                await tx.review.update({
                    where: {
                        id: reviewExists.id,
                    },
                    data: {
                        title: review.title,
                        description: review.description,
                        rating: review.rating,
                    }
                });
            } else {
                //Create new review
                await tx.review.create({
                    data: review,
                });
            }

            //Update product average rating
            const avgRating = await tx.review.aggregate({
                _avg: {
                    rating: true,
                },
                where: {
                    productId: review.productId,
                },
            });

            //Get number of reviews
            const noReviews = await tx.review.count({
                where: {
                    productId: review.productId,
                },
            });

            //Update the rating and noReviews on the product
            await tx.product.update({
                where: {
                    id: review.productId,
                },
                data: {
                    rating: avgRating._avg.rating || 0,
                    numReviews: noReviews,
                },
            });

            
        })

        
        revalidatePath(`/product/${product.slug}`);

        return {
            success: true,
            message: 'Review updated successfully',
        }
            
    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}

//Get All Reviews for a Product
export async function getReviews({productId}: {productId: string}) {
   
        const data = await prisma.review.findMany({
            where: {
                productId: productId,
            },
            include: {
                user: {
                    select: {
                        name: true
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        }
    );

    return {
        data
    };
    
}

//Get a review written by the current user
export async function getReviewByProductId({productId}: {productId: string}) {
    const session = await auth();
    if(!session) throw new Error('User is not authenticated');

   return await prisma.review.findFirst({
        where: {
            userId: session?.user?.id,
            productId: productId,
        },
    });
}
