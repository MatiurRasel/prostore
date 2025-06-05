import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const steps = [
    {
        name: 'User Login',
        icon: '👤'
    },
    {
        name: 'Shipping Address',
        icon: '📍'
    },
    {
        name: 'Payment Method',
        icon: '💳'
    },
    {
        name: 'Place Order',
        icon: '🛍️'
    }
];

const CheckoutSteps = ({ current = 0 }) => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted-foreground/20 -translate-y-1/2" />
                
                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < current;
                        const isCurrent = index === current;
                        
                        return (
                            <div key={step.name} className="flex flex-col items-center">
                                {/* Step Circle */}
                                <div className={cn(
                                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                                    isCompleted ? "bg-primary border-primary" : 
                                    isCurrent ? "border-primary bg-background" : 
                                    "border-muted-foreground/20 bg-background"
                                )}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                                    ) : (
                                        <span className="text-sm">{step.icon}</span>
                                    )}
                                </div>
                                
                                {/* Step Name */}
                                <div className={cn(
                                    "mt-2 text-sm font-medium transition-colors duration-300",
                                    isCompleted ? "text-primary" :
                                    isCurrent ? "text-foreground" :
                                    "text-muted-foreground"
                                )}>
                                    {step.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CheckoutSteps;