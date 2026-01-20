import { google } from '@ai-sdk/google';
import { embed } from 'ai';

// Use a lightweight model for descriptions and chat
export const aiModel = google('gemini-1.5-flash');

// Use text-embedding-004 for vectors (768 dimensions)
export const embeddingModel = google.textEmbeddingModel('text-embedding-004');

export async function generateEmbedding(text: string) {
    try {
        const { embedding } = await embed({
            model: embeddingModel,
            value: text,
        });
        return embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
}
