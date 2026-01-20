'use client';

import { Button } from "@/components/ui/button";

interface ChatChoiceProps {
    label: string;
    onClick: (label: string) => void;
}

export function ChatChoice({ label, onClick }: ChatChoiceProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => onClick(label)}
            className="rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20 text-primary transition-all duration-300 transform hover:scale-105"
        >
            {label}
        </Button>
    );
}
