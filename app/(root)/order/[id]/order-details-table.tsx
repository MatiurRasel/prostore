'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import {
    usePayPalScriptReducer,
    PayPalButtons,
    PayPalScriptProvider,
} from '@paypal/react-paypal-js';
import { 
    createPaypalOrder,
    approvePaypalOrder,
    updateOrderToPaidCOD,
    deliverOrder
 } from "@/lib/actions/order.actions";
import StripePayment from "./stripe-payment";
import { Loader } from "@/components/ui/loader";
import { useState } from "react";

const OrderDetailsTable = ({order, paypalClientId, isAdmin, stripeClientSecret}: {
    order: Omit<Order, 'paymentResult'>;
    paypalClientId: string;
    isAdmin: boolean;
    stripeClientSecret: string | null;
}) => {
    const { 
        id,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        isDelivered,
        shippingAddress,
        paymentMethod,
        orderitems,
        paidAt,
        deliveredAt,
    } = order;

    const { toast } = useToast();
    const [paypalLoading, setPaypalLoading] = useState(false);

    const PrintLoadingState = () => {
        const [{ isPending, isRejected }] = usePayPalScriptReducer();
        let status = '';
        if(isPending) {
            status = 'Loading PayPal...';
        }
        else if(isRejected) {
            status = 'Error loading PayPal';
        }
        return status;
    }
    const handleCreatePayPalOrder = async () => {
        setPaypalLoading(true);
        const res = await createPaypalOrder(order.id);
        setPaypalLoading(false);
        if(!res.success) {
            toast({
                title: 'Error',
                description: res.message,
                variant: 'destructive',
            });
            return res;
        }
        return res.data;
    }

    const handleApprovePayPalOrder = async (data: {orderID: string }) => {
        setPaypalLoading(true);
        const res = await approvePaypalOrder(order.id, data);
        setPaypalLoading(false);
        toast({
            title: res.success ? 'Success' : 'Error',
            description: res.success ? 'Payment successful' : res.message,  
            variant: res.success ? 'default' : 'destructive',
        });
    }

    //Button to mark order as paid
    const MarkAsPaidButton = ()=> {
        const [isPending, startTransition] = useTransition();
        const { toast } = useToast();

        return (
            <Button type="button" disabled={isPending} onClick={() => startTransition(async()=> {
                const res = await updateOrderToPaidCOD(order.id);

                toast({
                    variant: res.success ? 'default' : 'destructive',
                    description: res.message
                })
            })}>
                {isPending && <Loader className="w-4 h-4 animate-spin mr-2" />}
                {isPending ? 'Processing...' : 'Mark As Paid'}
            </Button>
        )
    };

    //Button to mark order as delivered
    const MarkAsDeliveredButton = ()=> {
        const [isPending, startTransition] = useTransition();
        const { toast } = useToast();

        return (
            <Button type="button" disabled={isPending} onClick={() => startTransition(async()=> {
                const res = await deliverOrder(order.id);

                toast({
                    variant: res.success ? 'default' : 'destructive',
                    description: res.message
                })
            })}>
                {isPending && <Loader className="w-4 h-4 animate-spin mr-2" />}
                {isPending ? 'Processing...' : 'Mark As Delivered'}
            </Button>
        )
    };

    return ( 

        <>
        <h1 className="py-4 text-2xl text-center md:text-left">Order {formatId(id)}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-5 gap-4">
            <div className="col-span-2 space-y-4 overflow-x-auto">
                <Card>
                    <CardContent className="p-4 gap-4">
                        <h2 className="text-xl pb-4">Payment Method</h2>
                        <p className="mb-2">{paymentMethod}</p> 
                        {isPaid ? (
                            <Badge variant='secondary'>
                                Paid at {formatDateTime(paidAt!).dateTime}
                            </Badge>
                        ) : (
                            <Badge variant='destructive'>
                                Not Paid
                            </Badge>
                        )}

                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 gap-4">
                        <h2 className="text-xl pb-4">Shipping Address</h2>
                        <p>{shippingAddress.fullName}</p> 
                        <p className="mb-2">
                            {shippingAddress.streetAddress}, {shippingAddress.city}
                            {shippingAddress.postalCode}, {shippingAddress.country}

                        </p>
                        {isDelivered ? (
                            <Badge variant='secondary'>
                                Delivered at {formatDateTime(deliveredAt!).dateTime}
                            </Badge>
                        ) : (
                            <Badge variant='destructive'>
                                Not Delivered
                            </Badge>
                        )}

                    </CardContent>
                </Card>
                {/* Responsive Order Items */}
                <div className="block md:hidden space-y-4">
                    {orderitems.map((item) => (
                        <Card key={item.slug} className="flex flex-col p-4 gap-3 shadow-md">
                            <div className="flex items-center gap-3">
                                <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md border object-cover w-16 h-16" />
                                <div className="flex-1">
                                    <Link href={`/product/${item.slug}`} className="font-medium text-base hover:underline">{item.name}</Link>
                                    <div className="text-sm text-muted-foreground mt-1">{formatCurrency(Number(item.price))} × {item.qty}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="text-muted-foreground text-sm">Total</div>
                                <div className="text-right font-semibold text-lg">{formatCurrency(Number(item.price) * item.qty)}</div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="hidden md:block">
                    <Card>
                        <CardContent className="p-4 gap-4">
                            <h2 className="text-xl pb-4">Order Items</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderitems.map((item) => (
                                        <TableRow key={item.slug}>
                                            <TableCell>
                                                <Link href={`/product/${item.slug}`} className="flex items-center">
                                                    <Image 
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={50}
                                                        height={50}
                                                        className="rounded-md border object-cover w-12 h-12"
                                                    />
                                                    <span className="px-2">{item.name}</span>
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2">{item.qty}</span>
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(Number(item.price))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(Number(item.price) * item.qty)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div>
                <Card className="sticky bottom-0 md:static shadow-lg border-muted-foreground/20 bg-white/90 md:bg-white">
                    <CardContent className="p-4 gap-4 space-y-4">
                        <div className="flex justify-between">
                                <div>Items</div>
                                <div>{formatCurrency(itemsPrice)}</div>
                        </div>
                        <div className="flex justify-between">
                                <div>Tax</div>
                                <div>{formatCurrency(taxPrice)}</div>
                        </div>
                        <div className="flex justify-between">
                                <div>Shipping</div>
                                <div>{formatCurrency(shippingPrice)}</div>
                        </div>
                        <div className="flex justify-between">
                                <div>Total</div>
                                <div>{formatCurrency(totalPrice)}</div>
                        </div>
                        {/* Paypal Payment */}
                        {!isPaid && paymentMethod === 'PayPal' && (
                            <div>
                                {paypalLoading && <Loader className="w-4 h-4 animate-spin mb-2" />}
                                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                                    <PrintLoadingState />
                                    <PayPalButtons 
                                        createOrder={handleCreatePayPalOrder}
                                        onApprove={handleApprovePayPalOrder}
                                    />
                                </PayPalScriptProvider>
                            </div>
                        )}
                        {/* stripe payment */}
                        {!isPaid && paymentMethod === 'Stripe' && stripeClientSecret &&(
                            <StripePayment 
                            priceInCents={Number(totalPrice) * 100} 
                            orderId={id} 
                            clientSecret={stripeClientSecret}/>
                        )}
                        {/* Cash On Delivery */}
                        {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                            <MarkAsPaidButton/>
                        )}
                        {isAdmin && isPaid && !isDelivered && (
                            <MarkAsDeliveredButton/>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
        </>
     );
}
 
export default OrderDetailsTable;