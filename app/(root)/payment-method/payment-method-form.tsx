'use client';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { paymentMethodSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/ui/form";
import { ArrowRight, CreditCard, Wallet, Banknote } from "lucide-react";
import { updateUserPaymentMethod } from "@/lib/actions/user.actions";
import { useLoading } from '@/lib/context/loading-context';
import LoadingButton from '@/components/ui/loading-button';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PaymentMethod = {
    type: 'PayPal' | 'Stripe' | 'CashOnDelivery';
};

const defaultPaymentMethod: PaymentMethod = {
    type: 'PayPal'
};

const PaymentMethodForm = ({paymentMethod}: {paymentMethod: PaymentMethod}) => {
    const router = useRouter();
    const { toast } = useToast();
    const { showLoader, hideLoader } = useLoading();

    const form = useForm<z.infer<typeof paymentMethodSchema>>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: paymentMethod || defaultPaymentMethod,
    });

    const [isPending, startTransition] = useTransition();

    const onSubmit: SubmitHandler<z.infer<typeof paymentMethodSchema>> = async (values) => {
        startTransition(async () => {
            try {
                showLoader();
                const res = await updateUserPaymentMethod(values);
                if (!res.success) {
                    toast({
                        title: 'Error',
                        description: res.message,
                        variant: 'destructive',
                    });
                    return;
                }
                router.push('/place-order');
            } finally {
                hideLoader();
            }
        });
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Payment Method</h1>
                    <p className="text-muted-foreground">
                        Choose your preferred payment method for your order.
                    </p>
                </div>

                <Card className="p-6 shadow-lg border-muted-foreground/20">
                    <FormProvider {...form}>
                        <form method="post" className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div
                                            onClick={() => field.onChange("PayPal")}
                                            className={cn(
                                                "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                                                field.value === "PayPal"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted-foreground/20 hover:border-primary/50"
                                            )}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={field.value === "PayPal"}
                                        >
                                            <Wallet className="w-8 h-8 mb-2 text-primary" />
                                            <span className="font-medium">PayPal</span>
                                            <p className="text-sm text-muted-foreground text-center mt-1">
                                                Pay securely with PayPal
                                            </p>
                                        </div>
                                        <div
                                            onClick={() => field.onChange("Stripe")}
                                            className={cn(
                                                "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                                                field.value === "Stripe"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted-foreground/20 hover:border-primary/50"
                                            )}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={field.value === "Stripe"}
                                        >
                                            <CreditCard className="w-8 h-8 mb-2 text-primary" />
                                            <span className="font-medium">Credit Card</span>
                                            <p className="text-sm text-muted-foreground text-center mt-1">
                                                Pay with your credit card
                                            </p>
                                        </div>
                                        <div
                                            onClick={() => field.onChange("CashOnDelivery")}
                                            className={cn(
                                                "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                                                field.value === "CashOnDelivery"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted-foreground/20 hover:border-primary/50"
                                            )}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={field.value === "CashOnDelivery"}
                                        >
                                            <Banknote className="w-8 h-8 mb-2 text-primary" />
                                            <span className="font-medium">Cash on Delivery</span>
                                            <p className="text-sm text-muted-foreground text-center mt-1">
                                                Pay when you receive
                                            </p>
                                        </div>
                                    </div>
                                )}
                            />

                            <div className="flex justify-end pt-4">
                                <LoadingButton 
                                    type="submit" 
                                    isLoading={isPending}
                                    loadingText="Updating Payment Method..."
                                    className="flex items-center gap-2 px-8 rounded-full transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                >
                                    <ArrowRight className="w-4 h-4" /> Continue to Order
                                </LoadingButton>
                            </div>
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </div>
    );
};

export default PaymentMethodForm;