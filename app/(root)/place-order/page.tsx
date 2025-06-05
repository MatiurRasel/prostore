import React from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/user.actions';
import PlaceOrderForm from './page-order-form';
import CheckoutSteps from "@/components/shared/checkout-steps";
import { calculateOrderPrices } from '@/lib/utils';
import { getMyCart } from '@/lib/actions/cart.actions';

export const metadata: Metadata = {
    title: 'Place Order',
}

const PlaceOrderPage = async () => {
    const cart = await getMyCart();
    if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

    const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateOrderPrices(cart);

    // Optionally get user for address/payment fallback
    const session = await auth();
    const userId = session?.user?.id;
    let user;
    if (userId) {
        user = await getUserById(userId);
    }

    return (
        <>
            <CheckoutSteps current={3}/>
            <PlaceOrderForm 
                itemsPrice={itemsPrice}
                shippingPrice={shippingPrice}
                taxPrice={taxPrice}
                totalPrice={totalPrice} 
                shippingAddress={user?.address as { fullName: string; streetAddress: string; city: string; postalCode: string; country: string; } || { fullName: '', streetAddress: '', city: '', postalCode: '', country: '' }}
                paymentMethod={user?.paymentMethod || 'PayPal'}
            />
        </>
    )
}

export default PlaceOrderPage;