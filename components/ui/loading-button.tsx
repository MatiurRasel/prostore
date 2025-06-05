'use client';

import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { ButtonProps } from "@/components/ui/button";

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean;
    loadingText?: string;
}

const LoadingButton = ({
    children,
    isLoading,
    loadingText,
    disabled,
    className,
    ...props
}: LoadingButtonProps) => {
    return (
        <Button
            disabled={disabled || isLoading}
            className={className}
            {...props}
        >
            {isLoading && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading ? loadingText : children}
        </Button>
    );
};

export default LoadingButton; 