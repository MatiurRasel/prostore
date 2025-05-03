import {z} from 'zod';
import { 
    insertProductsSchema, 
    insertCartSchema,
    cartItemsSchema, 
    shippingAddressSchema,
    insertOrderSchema,
    insertOrderItemSchema,
} from '@/lib/validators';

export type Product = z.infer<typeof insertProductsSchema> & {
    id: string;
    rating: string;
    createdAt: Date;
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
};



