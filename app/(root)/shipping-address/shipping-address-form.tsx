'use client';

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { ShippingAddress } from "@/types";
import { shippingAddressSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRight, MapPin, User, Building2 } from "lucide-react";
import { updateUserAddress } from "@/lib/actions/user.actions";
import { useLoading } from '@/lib/context/loading-context';
import LoadingButton from '@/components/ui/loading-button';
import { Card } from "@/components/ui/card";

const ShippingAddressForm = ({address}: {address: ShippingAddress}) => {
    const router = useRouter();
    const { toast } = useToast();
    const { showLoader, hideLoader } = useLoading();

    const form = useForm<z.infer<typeof shippingAddressSchema>>({
        resolver: zodResolver(shippingAddressSchema),
        defaultValues: address || shippingAddressDefaultValues,
    });

    const [isPending, startTransition] = useTransition();

    const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (values) => {
        startTransition(async () => {
            try {
                showLoader();
                const res = await updateUserAddress(values);
                if (!res.success) {
                    toast({
                        title: 'Error',
                        description: res.message,
                        variant: 'destructive',
                    });
                    return;
                }
                router.push('/payment-method');
            } finally {
                hideLoader();
            }
        });
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Shipping Address</h1>
                    <p className="text-muted-foreground">
                        Please provide your shipping address for order delivery.
                    </p>
                </div>

                <Card className="p-6 shadow-lg border-muted-foreground/20">
                    <FormProvider {...form}>
                        <form method="post" className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name='fullName'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Full Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder='Enter your full name' 
                                                    {...field} 
                                                    className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='streetAddress'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Street Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder='Enter your street address' 
                                                    {...field} 
                                                    className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='city'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                City
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder='Enter your city' 
                                                    {...field} 
                                                    className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='postalCode'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Postal Code
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder='Enter your postal code' 
                                                    {...field} 
                                                    className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='country'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Country
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder='Enter your country' 
                                                    {...field} 
                                                    className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <LoadingButton 
                                    type="submit" 
                                    isLoading={isPending}
                                    loadingText="Updating Address..."
                                    className="flex items-center gap-2 px-8 rounded-full transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                >
                                    <ArrowRight className="w-4 h-4" /> Continue to Payment
                                </LoadingButton>
                            </div>
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </div>
    );
};

export default ShippingAddressForm;