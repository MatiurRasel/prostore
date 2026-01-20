/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { prisma } from '@/db/prisma';
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from 'next/cache';
import { logUserIntent } from '../logger';
import { insertProductSchema, updateProductSchema } from '../validators';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { utapi } from '../uploadthing-server';
import { generateEmbedding, aiModel } from '@/lib/ai';
import { generateText } from 'ai';


//GET latest products which is stocked
export async function getLatestProducts() {
    const data = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: { createdAt: 'desc' }
    });
    return convertToPlainObject(data);
}
//export async function getLatestProducts() {
//
//    const data = await prisma.product.findMany({
//        take: LATEST_PRODUCTS_LIMIT,
//        orderBy: {createdAt:'desc'}
//    });
//
//    return convertToPlainObject(data);
//    
//}

//Get single product by it's slug.
export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
        where: { slug: slug },
    });
}

//Get single product by it's id.
export async function getProductById(productId: string) {
    const data = await prisma.product.findFirst({
        where: { id: productId },
    });

    return convertToPlainObject(data);
}

// Helper to parse search query intent using AI
async function parseSearchQueryIntent(query: string) {
    if (!query || query === 'all' || query.split(' ').length < 2) {
        return { subject: query, category: null, minRating: null, sort: null, isFeatured: null };
    }

    try {
        const { text } = await generateText({
            model: aiModel,
            maxTokens: 1024,
            prompt: `
              Analyze this e-commerce search query: "${query}"
              Extract core subject (in English), category, and min rating.
              
              GUIDELINES:
              - Translate Bangla items to English subjects (e.g., "শার্ট" -> "shirt", "জুতা" -> "shoes", "পোশাক" -> "clothing").
              - Identify sorting intent: "মূল্য" -> price, "নতুন" -> newest.
              - Identify intent even in Benglish (e.g., "bhalo shirt" -> subject: "shirt", minRating: 4).
              
              Return ONLY a JSON object:
              {
                "subject": "core product keywords in English",
                "category": "category name or null",
                "minRating": number or null,
                "sort": "lowest" | "highest" | "newest" | "relevance" | null,
                "isFeatured": boolean | null
              }
              
              NOTE: 
              - "Newest Arrivals" -> sort: "newest", subject: "all"
              - "Featured Deals" -> isFeatured: true, sort: "lowest", subject: "all"
              - If the query is purely a sort/filter or category browse request without specific keywords, set "subject" to "all".
            `,
        } as any);

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const result = JSON.parse(jsonMatch[0].trim());
        return {
            subject: result.subject || query,
            category: result.category,
            minRating: result.minRating,
            sort: result.sort,
            isFeatured: result.isFeatured
        };
    } catch (error) {
        console.error("AI Query Parsing error:", error);
        return { subject: query, category: null, minRating: null, sort: null, isFeatured: null };
    }
}

//Get all products
export async function getAllProducts({
    query,
    limit = PAGE_SIZE,
    page,
    category,
    price,
    rating,
    sort = 'createdAt',
}: {
    query: string;
    limit?: number;
    page: number;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
}) {
    // 0. Logging for Analyst Insights
    if (query && query !== 'all') {
        logUserIntent('search', query, { category, price, rating, sort });
    }

    // 0. AI Intent Extraction
    let aiSearchSubject = query;
    let aiCategory = category;
    let aiRating = rating;
    let aiFeatured: boolean | null = null;

    if (query && query !== 'all' && query.trim() !== '') {
        const intent = await parseSearchQueryIntent(query);
        aiSearchSubject = intent.subject;
        if (!category || category === 'all') aiCategory = intent.category || category;
        if (!rating || rating === 'all') aiRating = intent.minRating ? String(intent.minRating) : rating;
        aiFeatured = intent.isFeatured;

        // AI-Driven Sorting
        if (intent.sort && (sort === 'createdAt' || !sort || sort === 'relevance')) {
            sort = intent.sort;
        }
    }

    // Track search query
    if (query && query !== 'all' && query.trim() !== '' && page === 1) {
        try {
            await (prisma as any).searchQuery.upsert({
                where: { query: query.trim().toLowerCase() },
                update: {
                    count: { increment: 1 },
                    updatedAt: new Date()
                },
                create: { query: query.trim().toLowerCase() }
            });
        } catch (error) {
            console.error("Search tracking error:", error);
        }
    }

    // Hybrid Search logic (Semantic + Enhanced Keyword)
    let vectorResults: { id: string, score: number }[] = [];
    if (query && query !== 'all') {
        try {
            const embedding = await generateEmbedding(query);
            if (embedding) {
                const vectorString = `[${embedding.join(',')}]`;
                const products = await prisma.$queryRaw<{ id: string, distance: number }[]>`
                    SELECT id, ("descriptionEmbedding" <=> ${vectorString}::vector) as distance 
                    FROM "Product" 
                    WHERE "descriptionEmbedding" IS NOT NULL
        AND("descriptionEmbedding" <=> ${vectorString}:: vector) < 0.7
                    ORDER BY distance ASC 
                    LIMIT 100
                `;
                vectorResults = products.map(p => ({ id: p.id, score: 1 - (p.distance || 1) }));
            }
        } catch (error) {
            console.error("Vector search error:", error);
        }
    }

    // query filter (Keyword Match on multiple fields)
    const normalizedQuery = aiSearchSubject.toLowerCase().trim();
    const keywordFilter: Prisma.ProductWhereInput = aiSearchSubject && aiSearchSubject !== 'all' ? {
        OR: [
            { name: { contains: aiSearchSubject, mode: 'insensitive' } },
            { description: { contains: aiSearchSubject, mode: 'insensitive' } },
            { category: { contains: aiSearchSubject, mode: 'insensitive' } },
            { brand: { contains: aiSearchSubject, mode: 'insensitive' } },
            { slug: { contains: aiSearchSubject, mode: 'insensitive' } },
            // Add Word-Level Matching for better robustness
            ...aiSearchSubject.split(' ').filter((w: string) => w.length > 2).map((word: string) => ({
                name: { contains: word, mode: 'insensitive' as const }
            }))
        ]
    } : {};

    // rating filter (handled in main query)

    // We use in-memory pagination after hybrid reranking

    // Base results from Prisma
    const products = await prisma.product.findMany({
        where: {
            AND: [
                {
                    OR: [
                        keywordFilter,
                        ...(vectorResults.length > 0 ? [{ id: { in: vectorResults.map(v => v.id) } }] : [])
                    ]
                },
                (category && category !== 'all') ? { category } : (aiCategory && aiCategory !== 'all' ? { category: aiCategory } : {}),
                price && price !== 'all' ? {
                    price: {
                        gte: Number(price.split('-')[0]),
                        lte: Number(price.split('-')[1])
                    }
                } : {},
                (rating && rating !== 'all') ? {
                    rating: {
                        gte: Number(rating)
                    }
                } : (aiRating && aiRating !== 'all' ? {
                    rating: {
                        gte: Number(aiRating)
                    }
                } : {}),
                aiFeatured !== null ? { isFeatured: aiFeatured } : {}
            ]
        },
        // If sorting by newest/price, use that. Otherwise, we'll sort by relevance in memory.
        orderBy: sort === 'newest' ? { createdAt: 'desc' } :
            sort === 'lowest' ? { price: 'asc' } :
                sort === 'highest' ? { price: 'desc' } :
                    sort === 'rating' ? { rating: 'desc' } : undefined,
    });

    // Semantic scoring map
    const vectorScoreMap = new Map(vectorResults.map(v => [v.id, v.score]));

    // Rerank products based on Universal Hybrid Logic (Relevance)
    const processedProducts = products.map(p => {
        let relevanceScore = 0;
        const nameLower = p.name.toLowerCase();
        const slugLower = p.slug.toLowerCase();
        const brandLower = (p.brand || "").toLowerCase();
        const categoryLower = (p.category || "").toLowerCase();

        // 1. Exact Match Boost (Highest priority)
        if (nameLower === normalizedQuery || slugLower === normalizedQuery) relevanceScore += 100;
        else if (nameLower.startsWith(normalizedQuery)) relevanceScore += 50;

        // 2. Keyword Match Relevance
        if (nameLower.includes(normalizedQuery)) relevanceScore += 20;
        if (brandLower.includes(normalizedQuery)) relevanceScore += 15;
        if (categoryLower.includes(normalizedQuery)) relevanceScore += 10;

        // 3. Semantic (Vector) Score
        const semanticScore = vectorScoreMap.get(p.id) || 0;
        relevanceScore += (semanticScore * 30); // Semantic contributes up to 30 points

        // Determine if it was found via semantic only (AI Suggestion)
        const matchedViaKeyword = nameLower.includes(normalizedQuery) ||
            categoryLower.includes(normalizedQuery) ||
            brandLower.includes(normalizedQuery);

        return {
            ...p,
            isAiSuggested: semanticScore > 0 && !matchedViaKeyword,
            relevanceScore
        };
    });

    // Final sorting: If no specific sort is requested, sort by relevanceScore
    if (sort === 'relevance' || (sort === 'newest' && query !== 'all')) {
        processedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Manual Pagination
    const totalCount = processedProducts.length;
    const paginatedData = processedProducts.slice((page - 1) * limit, page * limit);

    return {
        data: paginatedData,
        totalPages: Math.ceil(totalCount / limit),
    }
}

// Action to get top search suggestions
export async function getTopSearchQueries(limit: number = 5) {
    try {
        const topQueries = await (prisma as any).searchQuery.findMany({
            orderBy: { count: 'desc' },
            take: limit
        });
        return (topQueries as Array<{ query: string }>).map(q => q.query);
    } catch (error) {
        console.error("Fetch top queries error:", error);
        return [];
    }
}

//DELETE a Product
export async function deleteProduct(id: string) {
    try {
        const productExists = await prisma.product.findFirst({
            where: { id }
        });

        if (!productExists) throw new Error('Product not found');

        await prisma.product.delete({
            where: { id }
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
        const newProduct = await prisma.product.create({ data: product });

        // Generate and save embedding
        const embeddingText = `${newProduct.name} ${newProduct.description} ${newProduct.category} ${newProduct.brand} `;
        const embedding = await generateEmbedding(embeddingText);
        if (embedding) {
            await prisma.$executeRaw`UPDATE "Product" SET "descriptionEmbedding" = ${embedding}::vector WHERE id = ${newProduct.id}:: uuid`;
        }

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
        if (!productExists) throw new Error('Product not found.');
        await prisma.product.update({
            where: { id: product.id },
            data: product
        });

        // Update embedding
        const embeddingText = `${product.name} ${product.description} ${product.category} ${product.brand} `;
        const embedding = await generateEmbedding(embeddingText);
        if (embedding) {
            await prisma.$executeRaw`UPDATE "Product" SET "descriptionEmbedding" = ${embedding}::vector WHERE id = ${product.id}:: uuid`;
        }
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
        orderBy: { createdAt: 'desc' },
        take: 4,
    });
    return convertToPlainObject(data);
}

export async function deleteProductImage(imageUrl: string) {
    try {
        const key = extractFileKey(imageUrl);
        if (key) await utapi.deleteFiles(key);
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}


