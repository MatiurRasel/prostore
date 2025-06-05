'use client';

import { Elements, useStripe, useElements, PaymentElement, LinkAuthenticationElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from 'next-themes';
import { FormEvent, useState } from 'react';
import LoadingButton from '@/components/ui/loading-button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const StripePayment = ({priceInCents, orderId, clientSecret}: {
    priceInCents: number;
    orderId: string;
    clientSecret: string;
}) => {
    const { theme } = useTheme();

    const StripeForm = () => {
        const stripe = useStripe();
        const elements = useElements();
        const [errorMessage, setErrorMessage] = useState('');
        const [email, setEmail] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const handleSubmit = async (e: FormEvent) => {
            e.preventDefault();
            if(stripe == null || elements == null || email == null) return;
            
            try {
                setIsLoading(true);
                await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order/${orderId}/stripe-payment-success`,
                    },
                });
            } catch (error: unknown) {
                if(error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('An unexpected error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <PaymentElement />
                <LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} />
                <LoadingButton 
                    type="submit" 
                    className="w-full"
                    disabled={!stripe || !elements || !email}
                    isLoading={isLoading}
                    loadingText="Processing Payment..."
                >
                    Pay ${(priceInCents / 100).toFixed(2)}
                </LoadingButton>
                {errorMessage && (
                    <div className="text-destructive text-sm">{errorMessage}</div>
                )}
            </form>
        );
    };

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: theme === 'dark' ? 'night' : 'stripe',
                },
            }}
        >
            <StripeForm />
        </Elements>
    );
};

export default StripePayment;