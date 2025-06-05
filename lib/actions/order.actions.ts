'use server';

import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { prisma } from "@/db/prisma";
import { PaymentResult, ShippingAddress } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { sendPurchaseReceipt } from "@/email";
import { z } from "zod";
import { placeOrderSchema } from "@/lib/validators";

//Create order and create the order items
export const createOrder = async (values: z.infer<typeof placeOrderSchema>) => {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: 'User not found' };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const cart = await getMyCart();
        if (!cart || cart.items.length === 0) {
            return { success: false, message: 'Cart is empty' };
        }

        const order = await prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    user: {
                        connect: { id: session.user.id }
                    },
                    itemsPrice: values.itemsPrice,
                    shippingPrice: values.shippingPrice,
                    taxPrice: values.taxPrice,
                    totalPrice: values.totalPrice,
                    paymentMethod: user.paymentMethod || 'PayPal',
                    shippingAddress: user.address as ShippingAddress,
                }
            });

            // Create order items
            for (const item of cart.items) {
                await tx.orderItem.create({
                    data: {
                        order: {
                            connect: { id: newOrder.id }
                        },
                        product: {
                            connect: { id: item.productId }
                        },
                        name: item.name,
                        slug: item.slug,
                        image: item.image,
                        price: item.price,
                        qty: item.qty,
                    }
                });
            }

            // Clear cart
            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    items: [],
                    itemsPrice: 0,
                    shippingPrice: 0,
                    taxPrice: 0,
                    totalPrice: 0,
                }
            });

            return newOrder;
        });

        return { success: true, orderId: order.id };
    } catch (error) {
        return { success: false, message: formatError(error) };
    }
};

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
            sendPurchaseReceipt({order: {
                ...updatedOrder,
                shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
                paymentResult: updatedOrder.paymentResult as PaymentResult,
                   
            }});

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

type SalesDataType = {
    month: string;
    totalSales: number;
}[];

//Get Sales data and order summary
export async function getOrderSummary() {
    // Get counts for each resource
    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();

    //Calculate the total sales
    const totalSales = await prisma.order.aggregate({
        _sum: {totalPrice: true}
    });

    //Get Monthly Sales
    const salesDataRaw = await prisma.$queryRaw<Array<{
        month: string; totalSales: Prisma.Decimal
    }>>`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order"
    GROUP BY to_char("createdAt", 'MM/YY')`;

    const salesData: SalesDataType = salesDataRaw.map((entry) => ({
        month: entry.month,
        totalSales: Number(entry.totalSales),
    }));

    //Get Latest sales
    const latestSales= await prisma.order.findMany({
        orderBy: {createdAt: 'desc'},
        include: {
            user: {select: {
                name: true
            }}
        },
        take: 60,
    });

    return {
        ordersCount,
        productsCount,
        usersCount,
        totalSales,
        latestSales,
        salesData
    };
}

//Get all orders
export async function getAllOrders({
    limit = PAGE_SIZE,
    page,
    query
}: {
    limit?:number;
    page: number;
    query: string;
}) {

    const queryFilter: Prisma.OrderWhereInput = query && query !== 'all' ? {
        user: {
            name: {
                contains: query,
                mode: 'insensitive'
            } as Prisma.StringFilter
        }
    } : {};

    const data = await prisma.order.findMany({
        where: queryFilter,
        orderBy: {
            createdAt:'desc'
        },
        take: limit,
        skip: (page - 1) * limit,
        include: {
            user: {
                select: {
                    name: true
                }
            }
        }
    });

    const dataCount = await prisma.order.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit),
    };
}

//Delete an order
export async function deleteOrder(id: string) {
    try {
        await prisma.order.delete({
            where: {
                id
            }
        });

        revalidatePath('/admin/orders');

        return {
            success: true,
            message: 'Order deleted successfully'
            
        }

    } catch(error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}


//Update COD order to paid
export async function updateOrderToPaidCOD(orderId: string) {
    try {
        await updateOrderToPaid({orderId});

        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message: 'Order marked as paid'
        }

    }  catch(error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}

//UPDATE COD Order to delivered
export async function deliverOrder(orderId: string) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            }
        });

        if(!order) throw new Error('Order not found');
        if(!order.isPaid) throw new Error('Order is not paid');

        await prisma.order.update({
            where:{
                id: orderId
            },
            data: {
                isDelivered: true,
                deliveredAt: new Date(),
            }
        });

        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message: 'Order has been marked delivered'
        }

    }  catch(error) {
        return {
            success: false,
            message: formatError(error)     
        }
    }
}
