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
import { PAGE_SIZE } from "../constants";

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

//Approve the paypal order and update the order with the payment result
export async function approvePaypalOrder(orderId: string, 
    data: {
        orderID: string
    }
) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
        });

        if(order) {
            const captureData = await paypal.capturePayment(data.orderID);
            
            if(!captureData || captureData.id !== (order.paymentResult as PaymentResult)?.id || captureData.status !== 'COMPLETED') {
                throw new Error('Error in PayPal payment');
            }
            
            //update order to paid

            await updateOrderToPaid({
                orderId: orderId,
                paymentResult: {
                    status: captureData.status,
                    id: captureData.id,
                    email_address: captureData.payer.email_address,
                    pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
                },
            })


            revalidatePath(`/order/${orderId}`);

            return {
                success: true,
                message: 'Your order has been paid successfully',
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

//Update order to paid
export async function updateOrderToPaid({
    orderId,
    paymentResult,
}: {
    orderId: string;
    paymentResult?: PaymentResult;
}) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
            include: {
                orderitems: true
            }
        });

        if(order) {
            if(order.isPaid) {
                throw new Error('Order is already paid');
            }

            //Transaction to update the order and account for product stock
            await prisma.$transaction(async (tx) => {
                //Iterate over products and update the stock
                for (const item of order.orderitems) {
                    await tx.product.update({
                        where: {
                            id: item.productId,
                        },
                        data: {
                            stock: {
                                // decrement: item.qty,
                                increment: -item.qty,
                            },
                        },
                    });
                }

                //update order to paid
                await tx.order.update({
                    where: {
                        id: orderId,
                    },
                    data: {
                        isPaid: true,
                        paidAt: new Date(),
                        paymentResult
                    },
                });

            });

            //Get the updated order after the transaction
            const updatedOrder = await prisma.order.findFirst({
                where: {
                    id: orderId,
                },
                include: {
                    orderitems: true,
                    user:{
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                },
            });

            if(!updatedOrder) throw new Error('Order not found');
            //Send email to user with the order details

            return {
                success: true,
                message: 'Your order has been paid successfully',
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


//Get user's orders
export async function getMyOrders({
    limit = PAGE_SIZE,
    page
} : {
    limit?: number;
    page: number;
}) {
    try {
        const session = await auth();
        if(!session) throw new Error('User is not authenticated');

        const data = await prisma.order.findMany({
            where: {
                userId: session?.user?.id
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: (page - 1) * limit,
        });

        const dataCount = await prisma.order.count({
            where: {
                userId: session?.user?.id
            },
        });

        const totalPages = Math.ceil(dataCount / limit);

        return {
            data,
            totalPages
        };

    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        };
    }
}