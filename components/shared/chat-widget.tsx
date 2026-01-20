/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useChat } from '@ai-sdk/react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatChoice } from '../chat/ChatChoice';
import { ChatProductCard } from '../chat/ChatProductCard';
import { ChatTypingIndicator } from '../chat/ChatTypingIndicator';

export default function ChatWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [input, setInput] = useState('');
    const { messages, status, sendMessage } = useChat() as any;

    const isLoading = status === 'submitted' || status === 'streaming';
    const scrollRef = useRef<HTMLDivElement>(null);

    // Show tooltip after 5 seconds if not open
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) setShowTooltip(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleQuickAction = (label: string) => {
        sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: label }]
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: input }]
        });
        setInput('');
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, status]);

    const renderMessageContent = (text: string) => {
        // Parse Choices: [Choice: Label]
        const choiceRegex = /\[Choice:\s*([^\]]+)\]/g;
        const choices: string[] = [];
        let cleanText = text.replace(choiceRegex, (_, label) => {
            choices.push(label.trim());
            return "";
        });

        // Parse Products: [Product: Name | Price | Slug | ImageURL]
        const productRegex = /\[Product:\s*([^|\]]+)\|\s*([^|\]]+)\|\s*([^|\]]+)\|\s*([^|\]]*)\]/g;
        const products: { name: string; price: string; slug: string; image: string }[] = [];
        cleanText = cleanText.replace(productRegex, (_, name, price, slug, image) => {
            products.push({ name: name.trim(), price: price.trim(), slug: slug.trim(), image: image.trim() });
            return "";
        });

        return (
            <div className="space-y-3">
                {cleanText.trim() && <p className="leading-relaxed">{cleanText.trim()}</p>}

                {products.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                        {products.map((p, i) => (
                            <ChatProductCard key={i} {...p} />
                        ))}
                    </div>
                )}

                {choices.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {choices.map((label, i) => (
                            <ChatChoice key={i} label={label} onClick={handleQuickAction} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const getQuickStarts = () => {
        if (session?.user?.role === 'admin') {
            return ["Today's snapshot", "Show low stock", "Top 5 products"];
        }
        if (session?.user) {
            return ["Track Order", "Recommended for me", "My Last Order"];
        }
        return ["Browse Products", "Newest Arrivals", "Featured Deals"];
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {showTooltip && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-none shadow-xl text-xs font-bold flex items-center gap-2 border border-primary-foreground/20"
                        >
                            <Sparkles size={12} className="text-yellow-300 animate-pulse" />
                            How can I help you today?
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 hover:bg-transparent"
                                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                            >
                                <X size={10} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={false}
                    animate={{ scale: isOpen ? 0.9 : 1 }}
                >
                    <Button
                        onClick={() => {
                            setIsOpen(!isOpen);
                            if (!isOpen) setShowTooltip(false);
                        }}
                        className="h-14 w-14 rounded-full shadow-2xl p-0 bg-gradient-to-br from-primary to-primary/80 hover:scale-110 transition-transform duration-300"
                        size="icon"
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                    <X size={24} />
                                </motion.div>
                            ) : (
                                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                    <MessageCircle size={24} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
                        className="fixed bottom-0 right-0 sm:bottom-20 sm:right-4 w-full sm:w-[400px] h-full sm:h-[600px] sm:max-h-[80vh] z-50 overflow-hidden"
                    >
                        <Card className="h-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-primary/10 flex flex-col bg-background/95 backdrop-blur-xl dark:bg-zinc-950/95 rounded-none sm:rounded-3xl overflow-hidden">
                            <CardHeader className="p-4 border-b bg-gradient-to-r from-primary/10 via-transparent to-transparent">
                                <CardTitle className="text-base flex items-center justify-between font-bold tracking-tight">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        ProStore AI Assistant
                                        <Sparkles size={14} className="text-primary animate-pulse" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                                        <X size={16} />
                                    </Button>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin overflow-x-hidden" ref={scrollRef}>
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Sparkles className="text-primary" size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-xl">
                                                    {session?.user ? `Welcome back, ${session.user.name?.split(' ')[0]} 👋` : "👋 Looking for something?"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    I&apos;m here to help you find the best deals or assist with your orders.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {getQuickStarts().map((label) => (
                                                    <ChatChoice key={label} label={label} onClick={handleQuickAction} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((m: any) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            key={m.id}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${m.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-secondary/50 backdrop-blur-sm border border-border/50 text-secondary-foreground rounded-tl-none'
                                                }`}>
                                                {m.parts ? (
                                                    (m.parts as any[]).map((part: any, i: number) => (
                                                        part.type === 'text' ? (
                                                            <div key={i}>{renderMessageContent(part.text)}</div>
                                                        ) : null
                                                    ))
                                                ) : (
                                                    <div>{renderMessageContent((m as { content?: string }).content || "")}</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isLoading && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                            <ChatTypingIndicator />
                                        </motion.div>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 pt-1 bg-background/50 backdrop-blur-sm pb-safe-bottom">
                                <form onSubmit={handleSubmit} className="relative flex w-full items-center gap-2 group">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="pr-12 py-6 rounded-2xl bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all shadow-inner"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !input.trim()}
                                        className="absolute right-1.5 h-10 w-10 rounded-xl bg-primary shadow-lg hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
