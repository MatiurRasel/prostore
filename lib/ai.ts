import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';

// OpenRouter Configuration (Handles DeepSeek, Claude, GPT, OpenAI, etc.)
export const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Primary Chat/Intent Model: Gemini 2.0 Flash via OpenRouter
// Note: We use Gemini via OpenRouter because it correctly respects maxTokens limits 
// in this environment, whereas DeepSeek was defaulting to 65k tokens and causing credit errors.
export const aiModel = openrouter('google/gemini-2.0-flash-001');

// Embedding Model via OpenRouter (OpenAI-compatible)
// text-embedding-3-small is efficient and cheap.
export const embeddingModel = openrouter.embedding('openai/text-embedding-3-small');

export async function generateEmbedding(text: string) {
    if (!process.env.OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY is missing");
        return null;
    }

    try {
        const { embedding } = await embed({
            model: embeddingModel,
            value: text,
        });
        return embedding;
    } catch (error) {
        console.error("Error generating embedding via OpenRouter:", error);
        return null;
    }
}
