import { auth } from "@/auth";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MotionDiv } from "@/components/ui/motion";
import { ArrowRight, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const metadata: Metadata = {
    title: 'Admin Orders'
}

const AdminOrderPage = async (props: {
    searchParams: Promise<{page: string; query: string; sort?: string; order?: string;}>
}) => {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const searchText = searchParams.query || '';
    const sort = searchParams.sort || 'createdAt';
    const order = (searchParams.order === 'asc' || searchParams.order === 'desc') ? searchParams.order : 'desc';
    const session = await auth();

    if(session?.user?.role !=='admin') {
        throw new Error('User is not authorized')
    }

    const orders = await getAllOrders({
        page,
        query: searchText,
        sort,
        order,
    });

    // Helper for sort arrows
    function SortArrow({active, direction}: {active: boolean, direction: 'asc' | 'desc'}) {
        if (!active) return <span className="inline-block w-4" />;
        return direction === 'asc' ? <ArrowUp className="inline-block w-4 h-4 ml-1" /> : <ArrowDown className="inline-block w-4 h-4 ml-1" />;
    }

    // Helper for building sort links
    function buildSortLink(col: string) {
        let nextOrder: 'asc' | 'desc' = 'asc';
        if (sort === col && order === 'asc') nextOrder = 'desc';
        return `/admin/orders?page=${page}&query=${encodeURIComponent(searchText)}&sort=${col}&order=${nextOrder}`;
    }

    return ( 
        <div className="space-y-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3 flex-wrap">
                <h1 className="h2-bold">Orders</h1>
                {searchText && (
                    <div className="flex items-center gap-2 flex-wrap bg-muted/60 rounded px-3 py-1 border border-muted-foreground/10">
                        <span className="text-sm text-muted-foreground">
                            Filtered by: <span className="font-semibold text-primary">&quot;{searchText}&quot;</span>
                        </span>
                        <Link href="/admin/orders">
                            <Button variant='ghost' size='sm' className="ml-1 px-2 py-1 h-auto text-xs">Remove Filter</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
                <div className="rounded-lg border shadow-sm">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer">
                                    <Link href={buildSortLink('id')}>
                                        ID <SortArrow active={sort==='id'} direction={order} />
                                    </Link>
                                </TableHead>
                                <TableHead className="cursor-pointer">
                                    <Link href={buildSortLink('createdAt')}>
                                        DATE <SortArrow active={sort==='createdAt'} direction={order} />
                                    </Link>
                                </TableHead>
                                <TableHead className="cursor-pointer">
                                    <Link href={buildSortLink('user.name')}>
                                        BUYER <SortArrow active={sort==='user.name'} direction={order} />
                                    </Link>
                                </TableHead>
                                <TableHead className="cursor-pointer">
                                    <Link href={buildSortLink('totalPrice')}>
                                        TOTAL <SortArrow active={sort==='totalPrice'} direction={order} />
                                    </Link>
                                </TableHead>
                                <TableHead className="cursor-pointer">
                                    <Link href={buildSortLink('paidAt')}>
                                        PAID <SortArrow active={sort==='paidAt'} direction={order} />
                                    </Link>
                                </TableHead>
                                <TableHead className="cursor-pointer">
                                    <Link href={buildSortLink('deliveredAt')}>
                                        DELIVERED <SortArrow active={sort==='deliveredAt'} direction={order} />
                                    </Link>
                                </TableHead>
                                <TableHead className="text-center">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data?.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium whitespace-nowrap">{formatId(order.id)}</TableCell>
                                    <TableCell className="whitespace-nowrap">{formatDateTime(order.createdAt).dateTime}</TableCell>
                                    <TableCell className="font-medium whitespace-nowrap text-ellipsis overflow-hidden max-w-[120px]">{order.user.name}</TableCell>
                                    <TableCell className="font-medium whitespace-nowrap">{formatCurrency(order.totalPrice)}</TableCell>
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
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Button asChild variant='secondary' size='sm' className="gap-1">
                                                <Link href={`/order/${order.id}`}>
                                                    <ArrowRight className="w-4 h-4" /> Details
                                                </Link>
                                            </Button>
                                            <DeleteDialog id={order.id} action={deleteOrder}>
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </DeleteDialog>
                                        </div>
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
                                    <span className="font-semibold">Buyer</span>
                                    <span className="font-medium">{order.user.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-medium">{formatCurrency(order.totalPrice)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Paid</span>
                                    <span>
                                        {order.isPaid && order.paidAt ? 
                                            formatDateTime(order.paidAt).dateTime : 
                                            <span className="text-destructive">Not Paid</span>
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Delivered</span>
                                    <span>
                                        {order.isDelivered && order.deliveredAt ? 
                                            formatDateTime(order.deliveredAt).dateTime : 
                                            <span className="text-destructive">Not Delivered</span>
                                        }
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 px-4 pb-4 pt-0">
                                <Button asChild size="sm" className="gap-1">
                                    <Link href={`/order/${order.id}`}>
                                        <ArrowRight className="w-4 h-4" /> Details
                                    </Link>
                                </Button>
                                <DeleteDialog id={order.id} action={deleteOrder}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                </DeleteDialog>
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
 
export default AdminOrderPage;