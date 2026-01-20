'use server';

import { generateText } from 'ai';
import { aiModel } from '@/lib/ai';

export async function generateProductDescription(prompt: string) {
    try {
        const { text } = await generateText({
            model: aiModel,
            system: `You are an expert e-commerce copywriter. Write a compelling, SEO-friendly product description based on the user's prompt. 
      Keep it concise (2-3 paragraphs max) and highlight key features. 
      Format with Markdown if helpful (e.g. bolding key terms).`,
            prompt: prompt,
        });
        return { success: true, text };
    } catch {
        return { success: false, error: 'Failed to generate description' };
    }
}
