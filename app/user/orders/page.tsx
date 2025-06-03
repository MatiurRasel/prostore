import { getMyOrders } from "@/lib/actions/order.actions";
import { Metadata } from "next";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MotionDiv } from "@/components/ui/motion";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: 'My Orders',
}

const OrdersPage = async (props: {
    searchParams: Promise<{page: string}>
}) => {
    const {page} = await props.searchParams;
    const orders = await getMyOrders({
        page: Number(page) || 1,
    });
    return (
        <div className="space-y-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <h2 className="h2-bold text-center py-2 sticky top-0 z-10 bg-background/80 backdrop-blur-md">Orders</h2>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[100px]">ID</TableHead>
                                <TableHead className="min-w-[180px]">DATE</TableHead>
                                <TableHead className="min-w-[120px]">TOTAL</TableHead>
                                <TableHead className="min-w-[180px]">PAID</TableHead>
                                <TableHead className="min-w-[180px]">DELIVERED</TableHead>
                                <TableHead className="min-w-[100px] text-right">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data?.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{formatId(order.id)}</TableCell>
                                    <TableCell className="whitespace-nowrap">{formatDateTime(order.createdAt).dateTime}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(order.totalPrice)}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {order.isPaid && order.paidAt ? 
                                            formatDateTime(order.paidAt).dateTime : 
                                            <span className="text-destructive">Not Paid</span>
                                        }
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {order.isDelivered && order.deliveredAt ? 
                                            formatDateTime(order.deliveredAt).dateTime : 
                                            <span className="text-destructive">Not Delivered</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            asChild 
                                            variant='secondary' 
                                            size='sm' 
                                            className="gap-1 hover:bg-secondary/80 transition-colors"
                                        >
                                            <Link href={`/order/${order.id}`}>
                                                Details <ArrowRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* Mobile Cards */}
            <div className="flex flex-col gap-4 md:hidden">
                {orders.data?.map((order, i) => (
                    <MotionDiv
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                        <Card className="shadow-md border border-muted bg-background/90">
                            <CardContent className="py-4 px-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="font-semibold">Order ID</span>
                                    <span>{formatId(order.id)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Date</span>
                                    <span>{formatDateTime(order.createdAt).dateTime}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Total</span>
                                    <span>{formatCurrency(order.totalPrice)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Paid</span>
                                    <span>{order.isPaid && order.paidAt ? formatDateTime(order.paidAt).dateTime : <span className="text-destructive">Not Paid</span>}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Delivered</span>
                                    <span>{order.isDelivered && order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : <span className="text-destructive">Not Delivered</span>}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end px-4 pb-4 pt-0">
                                <Button asChild size="sm" className="rounded-full px-4 gap-1 shadow hover:scale-105 transition-transform">
                                    <Link href={`/order/${order.id}`}>
                                        Details <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </MotionDiv>
                ))}
            </div>
            {/* Pagination */}
            {typeof orders?.totalPages === 'number' && orders.totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Pagination
                        page={Number(page) || 1}
                        totalPages={orders.totalPages}
                    />
                </div>
            )}
        </div>
    );
}

export default OrdersPage;