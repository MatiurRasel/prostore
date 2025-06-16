import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteProduct, getAllProducts } from "@/lib/actions/product.actions";
import { formatCurrency, formatId } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MotionDiv } from "@/components/ui/motion";
import { Edit, Plus, Trash2 } from "lucide-react";

const AdminProductPage = async(props: {
    searchParams: Promise<{
        page: string;
        query: string;
        category: string;
    }>
}) => {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const searchText = searchParams.query || '';

    const products = await getAllProducts({
        query: searchText,
        page,
    });

    return ( 
        <div className="space-y-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex-between flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="h2-bold">Products</h1>
                    {searchText && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                                Filtered by: <i>&quot;{searchText}&quot;</i>
                            </span>
                            <Link href="/admin/products">
                                <Button variant='outline' size='sm'>
                                    Remove Filter
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
                
                <Button asChild variant='default' className="gap-1">
                    <Link href='/admin/products/create'>
                        <Plus className="w-4 h-4" /> Create Product
                    </Link>
                </Button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
                <div className="rounded-lg border shadow-sm">
                    <div className="max-h-[384px] min-h-[192px] overflow-y-auto">
                        <Table className="table-fixed w-full">
                            <TableHeader className="sticky top-0 bg-card z-10">
                                <TableRow>
                                    <TableHead className="min-w-[100px]">ID</TableHead>
                                    <TableHead className="min-w-[200px]">NAME</TableHead>
                                    <TableHead className="min-w-[120px] text-right">PRICE</TableHead>
                                    <TableHead className="min-w-[120px]">CATEGORY</TableHead>
                                    <TableHead className="min-w-[100px]">STOCK</TableHead>
                                    <TableHead className="min-w-[100px]">RATING</TableHead>
                                    <TableHead className="min-w-[150px] text-right">ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{formatId(product.id)}</TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(product.price)}</TableCell>
                                        <TableCell className="capitalize">{product.category}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>{product.rating}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant='secondary' size='sm' className="gap-1">
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Edit className="w-4 h-4" /> Edit
                                                    </Link>
                                                </Button>
                                                <DeleteDialog id={product.id} action={deleteProduct}>
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
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-4 md:hidden">
                {products.data.map((product, i) => (
                    <MotionDiv
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                        <Card className="shadow-md border border-muted bg-background/90">
                            <CardContent className="py-4 px-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="font-semibold">Product ID</span>
                                    <span>{formatId(product.id)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Name</span>
                                    <span className="font-medium">{product.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Price</span>
                                    <span className="font-medium">{formatCurrency(product.price)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Category</span>
                                    <span className="capitalize">{product.category}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Stock</span>
                                    <span>{product.stock}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Rating</span>
                                    <span>{product.rating}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 px-4 pb-4 pt-0">
                                <Button asChild size="sm" className="gap-1">
                                    <Link href={`/admin/products/${product.id}`}>
                                        <Edit className="w-4 h-4" /> Edit
                                    </Link>
                                </Button>
                                <DeleteDialog id={product.id} action={deleteProduct}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                </DeleteDialog>
                            </CardFooter>
                        </Card>
                    </MotionDiv>
                ))}
            </div>

            {/* Pagination */}
            {typeof products?.totalPages === 'number' && products.totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Pagination
                        page={Number(page) || 1}
                        totalPages={products.totalPages}
                    />
                </div>
            )}
        </div>
    );
}
 
export default AdminProductPage;