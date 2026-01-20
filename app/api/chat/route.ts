import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { generateEmbedding } from '@/lib/ai';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';
import { getOrderSummary } from '@/lib/actions/order.actions';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Auth context
    const session = await auth();
    const userRole = session?.user?.role || 'anonymous';
    const userName = session?.user?.name || 'there';

    console.log("Chat Session Audit:", {
        hasSession: !!session,
        role: userRole,
        name: userName
    });

    // Extract text from the last message depending on its format (string or parts)
    const lastMessageContent = Array.isArray(lastMessage.parts)
        ? lastMessage.parts.map((p: { text: string }) => p.text).join('')
        : lastMessage.content;

    // RAG & Role-based Context
    let context = "";

    if (userRole === 'admin') {
        // Admin Snapshot
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
        // Logged-in Customer Context
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

    // Semantic Search Context (for everyone)
    try {
        const embedding = await generateEmbedding(lastMessageContent);
        if (embedding) {
            const vectorQuery = `[${embedding.join(',')}]`;
            const products = await prisma.$queryRaw<{ name: string, description: string, price: number, slug: string, stock: number, images: string[] }[]>`
            SELECT name, description, price, slug, stock, images FROM "Product"
            ORDER BY "descriptionEmbedding" <=> ${vectorQuery}::vector
            LIMIT 3
          `;
            const productContext = products.map(p => `PRODUCT: ${p.name} ($${p.price}) [In stock: ${p.stock}] [Image: ${p.images?.[0] || ''}] - ${p.description}`).join('\n\n');
            context += `\n\n[PRODUCT CONTEXT]\n${productContext}`;
        }
    } catch (error) {
        console.error("Embedding/RAG Error:", error);
    }

    const result = await streamText({
        model: google('models/gemini-flash-latest'),
        system: `You are a premium guided shopping assistant for ProStore.
        Your goal is to reduce typing and increase tapping. 
        
        RULES:
        1. Keep answers very concise (1-2 sentences). Style: Friendly, premium, and efficient.
        2. ALWAYS offer 2-4 Quick Reply choices using [Choice: Label].
        3. If you suggest products, use [Product: Name | Price | Slug | Image URL].
        4. ROLE-BASED BEHAVIOR:
           - ANONYMOUS: Focus on exploration. Use "Browse", "Deals", "Gift Ideas". Avoid asking for login unless they want to save items.
           - CUSTOMER: Greet by name. Prioritize "Track Order", "Reorder", "Support".
           - ADMIN: Act as a COMMAND CENTER. Show sales, stock, and status.
        5. NEVER just say "How can I help you?". Be proactive based on context.
        
        CURRENT CONTEXT:
        Role: ${userRole}
        User Name: ${userName}
        ${context}`,
        // Forward messages, ensuring they match CoreMessage structure
        messages: messages.map((m: { role: "user" | "assistant" | "system"; content?: string; parts?: { type: string; text?: string }[] }) => {
            if (m.parts && Array.isArray(m.parts)) {
                return {
                    role: m.role,
                    content: m.parts.map((p) => ({ type: 'text', text: p.text || '' }))
                };
            }
            return {
                role: m.role,
                content: m.content || ''
            };
        }),
    });

    return result.toUIMessageStreamResponse();
}
