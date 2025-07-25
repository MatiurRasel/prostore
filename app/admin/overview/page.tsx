import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrderSummary } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { BadgeDollarSign, Barcode, CreditCardIcon, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Charts from "./charts";

export const metadata: Metadata = {
    title:'Admin Dashboard',
}



const AdminOverviewPage = async () => {
    const session = await auth();

    if(session?.user?.role !=='admin') {
        throw new Error('User is not authorized')
    }

    const summary = await getOrderSummary();
    //console.log(summary);

    return ( 
        <div className='space-y-2'>
              <h1 className='h2-bold'>Dashboard</h1>
             <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                      <BadgeDollarSign />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(
                                summary.totalSales._sum.totalPrice?.toString() || 0
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                      <CreditCardIcon />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                formatNumber(summary.ordersCount)
                            }
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>Customers</CardTitle>
                      <Users />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                formatNumber(summary.usersCount)
                            }
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>Products</CardTitle>
                      <Barcode />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                formatNumber(summary.productsCount)
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                   <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Charts
                                data={{
                                    salesData: summary.salesData,
                                }}
                            />
                        </CardContent>
                    </Card>  
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-[384px] min-h-[192px] overflow-y-auto">
                            <Table className="table-fixed w-full">
                              <TableHeader className="sticky top-0 bg-card z-10">
                                <TableRow>
                                  <TableHead className="w-1/4">BUYER</TableHead>
                                  <TableHead className="w-1/4">DATE</TableHead>
                                  <TableHead className="w-1/4">TOTAL</TableHead>
                                  <TableHead className="w-1/4">ACTIONS</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {summary.latestSales.map((order) => (
                                  <TableRow key={order.id}>
                                    <TableCell>{order?.user?.name || 'Deleted User'}</TableCell>
                                    <TableCell>{formatDateTime(order.createdAt).dateOnly}</TableCell>
                                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                                    <TableCell>
                                      <Link href={`/order/${order.id}`}>
                                        <span className="px-2">Details</span>
                                      </Link>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                    </Card>         
            </div>
        </div>
     );
}
 
export default AdminOverviewPage;