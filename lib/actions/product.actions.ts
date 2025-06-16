'use server';
import {prisma} from '@/db/prisma';
import { convertToPlainObject, formatError } from "../utils";
import {LATEST_PRODUCTS_LIMIT, PAGE_SIZE} from "../constants";
import { revalidatePath } from 'next/cache';
import {  insertProductSchema, updateProductSchema } from '../validators';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { utapi } from '../uploadthing-server';

//GET latest products
export async function getLatestProducts() {

    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: {createdAt:'desc'}
    });

    return convertToPlainObject(data);
    
}

//Get single product by it's slug.
export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
        where: {slug: slug},
    });
}

//Get single product by it's id.
export async function getProductById(productId: string) {
    const data = await prisma.product.findFirst({
        where: {id: productId},
    });

    return convertToPlainObject(data);
}

//Get all products
export async function getAllProducts({
    query, 
    limit = PAGE_SIZE,
    page,
    category,
    price,
    rating,
    sort,
}: {
    query: string;
    limit?: number;
    page: number;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
}) {

    //query filter
    const queryFilter: Prisma.ProductWhereInput = query && query !== 'all' ? {
        name: {
            contains: query,
            mode: 'insensitive'
        } as Prisma.StringFilter
    } : {};

    //category filter
    const categoryFilter = category && category !== 'all' ? {category} : {};

    //price filter
    const priceFilter: Prisma.ProductWhereInput = price && price !== 'all' ? {
        price: {
            gte: Number(price.split('-')[0]),
            lte: Number(price.split('-')[1])
        }
    }:{};

    //rating filter
    const ratingFilter = rating && rating !== 'all' ? {
        rating: {
            gte: Number(rating)
        }
    }:{};
    

    const data = await prisma.product.findMany({
        where: {
            ...queryFilter,
            ...categoryFilter,
            ...priceFilter,
            ...ratingFilter
        },
        orderBy: 
            sort === 'lowest' 
            ? {price: 'asc'} 
            : sort === 'highest' 
            ? {price: 'desc'} 
            : sort === 'rating' 
            ? {rating: 'desc'} 
            : {createdAt: 'desc'},
        skip: (page - 1) * limit,
        take: limit,
    });

    //const dataCount = await prisma.product.count();

    const dataCount = await prisma.product.count();
    
    return {
        data,
        totalPages: Math.ceil(dataCount/ limit),
    }
}

//DELETE a Product
export async function deleteProduct(id: string) {
    try {
        const productExists = await prisma.product.findFirst({
            where: {id}
        });

        if(!productExists) throw new Error('Product not found');

        await prisma.product.delete({
            where: {id}
        });

        revalidatePath('/admin/products');

        return {
            success: true, 
            message: 'Product delete successfully',
        }

    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
    
}

function extractFileKey(url: string): string | null {
  // For Uploadthing, the file key is after /f/
  const match = url.match(/\/f\/([^/?#]+)/);
  return match ? match[1] : null;
}

//Create a Product
export async function createProduct(data: z.infer<typeof insertProductSchema> & { removedImages?: string[], removedBanner?: string }) {
    try {
        // Delete removed images from Uploadthing
        if (data.removedImages && data.removedImages.length > 0) {
            const keys = data.removedImages.map(extractFileKey).filter(Boolean) as string[];
            if (keys.length > 0) await utapi.deleteFiles(keys);
        }
        if (data.removedBanner) {
            const key = extractFileKey(data.removedBanner);
            if (key) await utapi.deleteFiles(key);
        }
        const product = insertProductSchema.parse(data);
        await prisma.product.create({data: product});
        revalidatePath('/admin/products');
         return {
            success: true, 
            message: 'Product created successfully',
        }
    } catch (error) {
        return {
            success: false, 
            message: formatError(error),
        }
    }
}

//Update a Product
export async function updateProduct(data: z.infer<typeof updateProductSchema> & { removedImages?: string[], removedBanner?: string }) {
    try {
        // Delete removed images from Uploadthing
        if (data.removedImages && data.removedImages.length > 0) {
            const keys = data.removedImages.map(extractFileKey).filter(Boolean) as string[];
            if (keys.length > 0) await utapi.deleteFiles(keys);
        }
        if (data.removedBanner) {
            const key = extractFileKey(data.removedBanner);
            if (key) await utapi.deleteFiles(key);
        }
        const product = updateProductSchema.parse(data);
        const productExists = await prisma.product.findFirst({
            where: {
                id: product.id
            }
        });
        if(!productExists) throw new Error('Product not found.');
        await prisma.product.update({
            where: {id: product.id},
            data: product
        });
        revalidatePath('/admin/products');
         return {
            success: true, 
            message: 'Product updated successfully',
        }
    } catch (error) {
        return {
            success: false, 
            message: formatError(error),
        }
    }
}

//Get all categories
export async function getAllCategories() {
   
    const data = await prisma.product.groupBy({
        by: ['category'],
        _count: true,
    });
    return data;
   
}

//Get featured products
export async function getFeaturedProducts() {
    const data = await prisma.product.findMany({
        where: {
            isFeatured: true,
            banner: {
                not: null,
                notIn: [''], // ignore empty string too
              },
        
        },
        orderBy: {createdAt: 'desc'},
        take: 4,
    });
    return convertToPlainObject(data);
}


