import fs from 'fs';
import path from 'path';

/**
 * Logs user intent (search or chat) to a file for analyst/admin review.
 * Saves to 'analyst_intents.log' in the project root.
 */
export async function logUserIntent(source: 'search' | 'chat', input: string, metadata?: Record<string, unknown>) {
    try {
        const logDir = process.cwd();
        const logPath = path.join(logDir, 'analyst_intents.log');

        const timestamp = new Date().toISOString();
        const cleanInput = input.replace(/\n/g, ' ').trim();
        const metaStr = metadata ? ` | Meta: ${JSON.stringify(metadata)}` : '';

        const logEntry = `[${timestamp}] [${source.toUpperCase()}] ${cleanInput}${metaStr}\n`;

        await fs.promises.appendFile(logPath, logEntry, 'utf8');
    } catch (error) {
        console.error('Logging Error:', error);
    }
}
