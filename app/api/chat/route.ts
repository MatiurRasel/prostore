/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from 'ai';
import { aiModel } from '@/lib/ai';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';
import { getOrderSummary } from '@/lib/actions/order.actions';
import { getFeaturedProducts, getAllProducts } from '@/lib/actions/product.actions';
import { addItemsToCart } from '@/lib/actions/cart.actions';
import { logUserIntent } from '@/lib/logger';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: Array<{ role: string, content?: string | any[], parts?: any[] }> } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Auth context
    const session = await auth();
    const userRole = session?.user?.role || 'anonymous';
    const userName = session?.user?.name || 'there';

    // Logging for Analyst Insights
    const lastMessageContent = Array.isArray(lastMessage.parts)
        ? (lastMessage.parts as any[]).map((p: any) => p.text).join('')
        : lastMessage.content;

    logUserIntent('chat', lastMessageContent as string, { role: userRole, userName });

    // RAG & Role-based Context
    let context = "";

    if (userRole === 'admin') {
        try {
            const summary = await getOrderSummary();
            context = `[ADMIN SNAPSHOT]
            Total Sales: $${summary.totalSales._sum.totalPrice || 0}
            Total Orders: ${summary.ordersCount}
            Total Users: ${summary.usersCount}
            Total Products: ${summary.productsCount}
            Low Stock Alerts: ${summary.latestSales.filter(s => Number(s.totalPrice) < 100).length} items recently sold.`;
        } catch (e) {
            console.error("Admin Context Error:", e);
        }
    } else if (userRole === 'user') {
        try {
            const lastOrders = await prisma.order.findMany({
                where: { userId: session?.user?.id },
                orderBy: { createdAt: 'desc' },
                take: 3,
                include: { orderitems: true }
            });
            const ordersStr = lastOrders.map(o => `#${o.id.slice(-4)}: ${o.isPaid ? 'Paid' : 'Unpaid'}, ${o.isDelivered ? 'Delivered' : 'Processing'}`).join('\n');
            context = `[CUSTOMER CONTEXT]
            User: ${userName}
            Recent Orders:
            ${ordersStr || 'No recent orders.'}
            Cart: Use retrieved product context for shopping.`;
        } catch (e) {
            console.error("User Context Error:", e);
        }
    }

    // Hybrid Search Context (Intent-Aware)
    try {
        const productData = await getAllProducts({
            query: lastMessageContent as string,
            limit: 3,
            page: 1
        });

        if (productData.data.length > 0) {
            const productContext = productData.data.map(p =>
                `PRODUCT: ${p.name} (ID: ${p.id}) ($${p.price}) [Slug: ${p.slug}] [In stock: ${p.stock}] [Featured: ${p.isFeatured}] [Rating: ${p.rating}] [Image: ${p.images?.[0] || ''}] - ${p.description}`
            ).join('\n\n');
            context += `\n\n[PRODUCT CONTEXT]\n${productContext}`;
        }
    } catch (error) {
        console.error("Search/RAG Error:", error);
    }

    const formattedMessages = messages
        .filter((m: any) =>
            ['user', 'assistant'].includes(m.role) &&
            ((m.content && String(m.content).trim() !== "") || (m.parts && (m.parts as any[]).length > 0))
        )
        .map((m: any) => {
            let content = "";
            if (Array.isArray(m.parts)) {
                content = (m.parts as any[]).map((p: any) => p.text || '').join('').trim();
            } else if (Array.isArray(m.content)) {
                content = (m.content as any[]).map((c: any) => c.text || '').join('').trim();
            } else {
                content = String(m.content || '').trim();
            }
            return {
                role: m.role,
                content: content || "Continue"
            };
        });

    // Gemini/OpenRouter compatibility: 
    // 1. Ensure alternation (User -> Assistant -> User).
    // 2. Must start with 'user'.
    const sanitizedMessages: { role: 'user' | 'assistant', content: { type: 'text', text: string }[] }[] = [];
    for (const msg of formattedMessages) {
        if (sanitizedMessages.length === 0) {
            if (msg.role === 'user') {
                sanitizedMessages.push({
                    role: 'user',
                    content: [{ type: 'text', text: msg.content }]
                });
            }
            continue;
        }

        const lastMsg = sanitizedMessages[sanitizedMessages.length - 1];
        if (lastMsg.role === msg.role) {
            // Merge consecutive messages
            if (Array.isArray(lastMsg.content) && lastMsg.content[0]) {
                lastMsg.content[0].text = `${lastMsg.content[0].text}\n${msg.content}`;
            }
        } else {
            sanitizedMessages.push({
                role: msg.role as 'user' | 'assistant',
                content: [{ type: 'text', text: msg.content }]
            });
        }
    }

    // Featured Products for Fallback
    const featuredProducts = await getFeaturedProducts();
    const featuredContext = featuredProducts.map(p => `- ${p.name} (ID: ${p.id}) ($${p.price}) [Slug: ${p.slug}] [Image: ${p.images?.[0] || ''}]`).join('\n');

    const result = await streamText({
        model: aiModel as any,
        maxTokens: 2048,
        maxSteps: 5,
        system: `You are a premium guided shopping assistant for ProStore.
        Your goal is to reduce typing and increase tapping. 
        
        RULES:
        1. Keep answers very concise (1-2 sentences). Style: Friendly, premium, and efficient.
        2. LANGUAGE: Respond in the language used by the user (Bangla, Benglish, or English).
        3. ACCOUNTABILITY: Always briefly explain *why* you are recommending a specific product (e.g., "This matches your search for deals" or "This is one of our top-rated shirts").
        4. INTENT MAPPING (Bangla):
           - "মূল্য অনুসারে সাজান" -> Focus on price-sensitive deals.
           - "নতুন কালেকশন" -> Highlight 2-3 newest products from context.
           - "পোশাক" / "জামা" -> Recommend products from "Clothing" or fashion categories.
        5. ALWAYS offer 2-4 Quick Reply choices using [Choice: Label].
        6. If you suggest products, use [Product: Name | Price | Slug | Image URL].
        7. ROLE-BASED BEHAVIOR:
           - ANONYMOUS: Focus on exploration. Use "Browse Products", "Newest Arrivals", "Featured Deals".
           - CUSTOMER: Greet by name. Prioritize "Track Order", "Recommended for me", "My Last Order".
           - ADMIN: COMMAND CENTER mode. Show sales, stock, and status.
        8. ACCURACY: Only recommend products present in the [PRODUCT CONTEXT] or [FEATURED CONTEXT]. Provide actual prices and stock status.
        9. MISSING ITEMS/FEATURES: If a user asks for a product or feature (e.g., specific brand, mobile app, crypto payment) NOT present in the context:
           - Acknowledge it politely: "I'm sorry, we don't currently have [item/feature] yet."
           - WORKAROUNDS/ALTERNATIVES: Suggest a way to achieve their goal with *existing* features (e.g., "You can use our secure card checkout" or "Our site is mobile-optimized").
           - SMART PRODUCTS: Suggest 1-2 items from context using [Product: ...] format.
           - LOGGING: Inform them you've shared their interest with the architects. Add a "[Choice: Request Item]" or "[Choice: Suggest Feature]" button.
           - If they click those, ask for details, then confirm: "I've logged this for our analyst team! Is there anything else I can help with?"
        10. ADD TO CART: If a user asks to add a specific item to the cart, use the 'addItemToCart' tool. You MUST have the product details from context.
        
        CURRENT CONTEXT:
        Role: ${userRole}
        User Name: ${userName}
        ${context}
        
        [FEATURED CONTEXT]
        (If no specific products match the user's current request, suggest these)
        ${featuredContext}`,
        messages: sanitizedMessages,
        tools: {
            addItemToCart: {
                description: 'Adds a product to the shopping cart',
                parameters: z.object({
                    productId: z.string().describe('The ID of the product to add'),
                    qty: z.number().optional().default(1).describe('Quantity to add')
                }),
                execute: async ({ productId, qty }: { productId: string, qty: number }) => {
                    const product = await prisma.product.findUnique({ where: { id: productId } });
                    if (!product) return { success: false, message: 'Product not found' };

                    const res = await addItemsToCart({
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price.toString(),
                        qty: qty || 1,
                        image: product.images?.[0] || ''
                    });
                    return res;
                }
            }
        }
    } as any);

    return result.toUIMessageStreamResponse();
}
