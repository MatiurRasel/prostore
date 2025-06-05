'use client';

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { placeOrderSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Package, Truck, CreditCard, Wallet, Banknote } from "lucide-react";
import { createOrder } from "@/lib/actions/order.actions";
import { useLoading } from '@/lib/context/loading-context';
import LoadingButton from '@/components/ui/loading-button';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { Pencil } from 'lucide-react';

interface PlaceOrderFormProps {
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    shippingAddress: {
        fullName: string;
        streetAddress: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string;
}

const PlaceOrderForm = ({ 
    itemsPrice, 
    shippingPrice, 
    taxPrice, 
    totalPrice,
    shippingAddress,
    paymentMethod
}: PlaceOrderFormProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const { showLoader, hideLoader } = useLoading();

    const form = useForm<z.infer<typeof placeOrderSchema>>({
        resolver: zodResolver(placeOrderSchema),
        defaultValues: {
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        },
    });

    const [isPending, startTransition] = useTransition();

    const onSubmit: SubmitHandler<z.infer<typeof placeOrderSchema>> = async (values) => {
        startTransition(async () => {
            try {
                showLoader();
                const res = await createOrder(values);
                if (!res.success) {
                    toast({
                        title: 'Error',
                        description: res.message,
                        variant: 'destructive',
                    });
                    return;
                }
                router.push(`/order/${res.orderId}`);
            } finally {
                hideLoader();
            }
        });
    };

    const getPaymentIcon = () => {
        switch (paymentMethod) {
            case 'PayPal':
                return <Wallet className="w-5 h-5" />;
            case 'Stripe':
                return <CreditCard className="w-5 h-5" />;
            case 'CashOnDelivery':
                return <Banknote className="w-5 h-5" />;
            default:
                return <Wallet className="w-5 h-5" />;
        }
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Place Order</h1>
                    <p className="text-muted-foreground">
                        Review your order details and confirm your purchase.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Summary */}
                    <Card className="p-6 shadow-lg border-muted-foreground/20">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Items Price</span>
                                <span className="font-medium">${itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium">${shippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium">${taxPrice.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-semibold">
                                <span>Total</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Shipping & Payment Info */}
                    <Card className="p-6 shadow-lg border-muted-foreground/20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Shipping & Payment</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 justify-between">
                                <div className="flex gap-3">
                                    <Truck className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-medium flex items-center gap-2">Shipping Address
                                            <Link href="/shipping-address" className="ml-2 text-xs text-primary hover:underline flex items-center gap-1">
                                                <Pencil className="w-3 h-3" /> Edit
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {shippingAddress.fullName}<br />
                                            {shippingAddress.streetAddress}<br />
                                            {shippingAddress.city}, {shippingAddress.postalCode}<br />
                                            {shippingAddress.country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-start gap-3 justify-between">
                                <div className="flex gap-3">
                                    {getPaymentIcon()}
                                    <div>
                                        <h3 className="font-medium flex items-center gap-2">Payment Method
                                            <Link href="/payment-method" className="ml-2 text-xs text-primary hover:underline flex items-center gap-1">
                                                <Pencil className="w-3 h-3" /> Edit
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {paymentMethod}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <FormProvider {...form}>
                    <form method="post" className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex justify-end">
                            <LoadingButton 
                                type="submit" 
                                isLoading={isPending}
                                loadingText="Processing Order..."
                                className="flex items-center gap-2 px-8 rounded-full transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            >
                                <Package className="w-4 h-4" /> Place Order
                            </LoadingButton>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};

export default PlaceOrderForm;