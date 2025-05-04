'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";

//Create order and create the order items
export async function createOrder() {
    try{

        //Get session and user ID
        const session = await auth();
        if(!session) throw new Error('User is not authenticated');

        const cart = await getMyCart();

        const userId = session?.user?.id;

        if(!userId) throw new Error('User not found');


        const user = await getUserById(userId);

        if(!cart || cart.items.length === 0) {
            return {
                success: false,
                message: 'Your Cart is empty',
                redirectTo: '/cart'
            };
        }

        if(!user.address) {
            return {
                success: false,
                message: 'No Shipping Address found',
                redirectTo: '/shipping-address'
            };
        }

        if(!user.paymentMethod) {
            return {
                success: false,
                message: 'No Payment Method found',
                redirectTo: '/payment-method'
            };
        }

        //Create order object
        const order = insertOrderSchema.parse({
            userId: userId,
            shippingAddress: user.address,
            paymentMethod: user.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
        });

        //create a transaction to create the order and the order items in the database
        const insertedOrderId = await prisma.$transaction(async (tx) => {
            //Create order
            const insertedOrder = await tx.order.create({ data: order });
            //Create order items from the cart items
            for (const item of cart.items as CartItem[]) {
                await tx.orderItem.create({
                    data: {
                        ...item,
                        orderId: insertedOrder.id,
                        price: item.price,
                    },
                });
            }

            //clear the cart
            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    items: [],
                    itemsPrice: 0,
                    shippingPrice: 0,
                    taxPrice: 0,
                    totalPrice: 0,
                },
            });

            return insertedOrder.id;
        });
        if(!insertedOrderId) throw new Error('Order not created');

        return {
            success: true,
            message: 'Order created successfully',
            redirectTo: `/order/${insertedOrderId}`,
        };

    } catch (error) {
        if(isRedirectError(error)) {
            return error;
        }
        return {
            success: false,
            message: formatError(error)
        }
    }
}

//Get order by ID
export async function getOrderById(orderId: string) {
    
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
            include: {
                orderitems: true,
                user: {
                    select:{
                        name: true,
                        email: true,
                    }
                }
            },
        });

        return convertToPlainObject(order);
   
}

//create new paypal order
export async function createPaypalOrder(orderId: string) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
        });

        if(order) {
            //Create order in paypal
            const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

            //Update the order with the paypal order ID
            await prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    paymentResult: {
                        status: '',
                        id: paypalOrder.id,
                        email_address:'',
                        pricePaid: 0
                    },
                },
            });

            return {
                success: true,
                message: 'Item order created successfully',
                data: paypalOrder.id
            };
        }
        else {
            throw new Error('Order not found');
        }
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        };
    }
}