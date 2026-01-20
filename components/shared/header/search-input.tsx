"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function SearchInput({ topSearches }: { topSearches: string[] }) {
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (s: string) => {
        setQuery(s);
        router.push(`/search?q=${encodeURIComponent(s)}`);
        setShowSuggestions(false);
    };

    return (
        <div className="relative flex-1" ref={containerRef}>
            <form onSubmit={handleSearch} className="relative group">
                <Input
                    name="q"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    type="text"
                    placeholder="Search products..."
                    className="h-9 w-full pl-3 pr-20 bg-background/50 focus:bg-background transition-colors rounded-lg border-muted-foreground/20 focus:border-primary shadow-sm"
                    autoComplete="off"
                />
                <div className="absolute right-0 top-0 h-9 flex items-center pr-1 gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="p-1 hover:bg-muted rounded text-muted-foreground"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-sm hover:bg-primary hover:text-white transition-all shadow-none"
                    >
                        <SearchIcon className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </form>

            <AnimatePresence>
                {showSuggestions && topSearches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover rounded-xl border border-border/50 shadow-2xl overflow-hidden backdrop-blur-xl bg-opacity-95"
                    >
                        <div className="p-2">
                            <h4 className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <TrendingUp className="h-3 w-3" />
                                Trending Now
                            </h4>
                            <div className="space-y-0.5">
                                {topSearches.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSuggestionClick(s)}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted font-medium transition-colors flex items-center justify-between group"
                                    >
                                        <span>{s}</span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-primary font-bold">
                                            Search ↵
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
