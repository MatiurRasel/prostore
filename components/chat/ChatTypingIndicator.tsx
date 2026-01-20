'use client';

import { motion } from 'framer-motion';

export function ChatTypingIndicator() {
    return (
        <div className="flex gap-1 p-2 px-3 bg-secondary/50 rounded-2xl rounded-tl-none w-fit">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                    className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"
                />
            ))}
        </div>
    );
}
