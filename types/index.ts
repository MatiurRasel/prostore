import {z} from 'zod';
import { 
    insertProductSchema, 
    insertCartSchema,
    cartItemsSchema, 
    shippingAddressSchema,
    insertOrderSchema,
    insertOrderItemSchema,
    paymentResultSchema,
    insertReviewSchema,
} from '@/lib/validators';

export type Product = z.infer<typeof insertProductSchema> & {
    id: string;
    rating: string;
    createdAt: Date;
    numReviews: number;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemsSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
    id:string;
    createdAt: Date;
    isPaid: boolean;
    paidAt: Date | null;
    isDelivered: boolean;
    deliveredAt: Date | null;
    orderitems: OrderItem[];
    user: {
        name: string;
        email: string;
    };
    paymentResult: PaymentResult;
};
export type PaymentResult = z.infer<typeof paymentResultSchema>;

export type Review = z.infer<typeof insertReviewSchema> & {
    id: string;
    createdAt: Date;
    user?: {
        name: string;
    };
};

