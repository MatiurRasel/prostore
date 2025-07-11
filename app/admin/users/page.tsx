import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers, deleteUser } from "@/lib/actions/user.actions";
import { capitalize, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MotionDiv } from "@/components/ui/motion";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { UserActionsBar } from '@/components/admin/UserActionsBar';
import { UserTableActions } from '@/components/admin/UserTableActions';
import { BulkUserUploadModalClient } from '@/components/admin/BulkUserUploadModalClient';
import { User } from "@prisma/client";

export const metadata: Metadata = {
    title: 'Admin Users',
}

const AdminUserPage = async(props: {
    searchParams: Promise<{
        page: string;
        query: string;
        sort?: string;
        order?: string;
    }>
}) => {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const searchText = searchParams.query || '';
    const sort = searchParams.sort || 'createdAt';
    const order = (searchParams.order === 'asc' || searchParams.order === 'desc') ? searchParams.order : 'desc';

    const users = await getAllUsers({
        page,
        query: searchText,
        sort,
        order,
    });

    function SortArrow({active, direction}: {active: boolean, direction: 'asc' | 'desc'}) {
        if (!active) return <span className="inline-block w-4" />;
        return direction === 'asc' ? <ArrowUp className="inline-block w-4 h-4 ml-1" /> : <ArrowDown className="inline-block w-4 h-4 ml-1" />;
    }

    function buildSortLink(col: string) {
        let nextOrder: 'asc' | 'desc' = 'asc';
        if (sort === col && order === 'asc') nextOrder = 'desc';
        return `/admin/users?page=${page}&query=${encodeURIComponent(searchText)}&sort=${col}&order=${nextOrder}`;
    }

    return ( 
        <div className="space-y-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3 flex-wrap">
                <h1 className="h2-bold">Users</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex justify-end gap-2">
                    <UserActionsBar />
                    <BulkUserUploadModalClient />
                </div>
                
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                {searchText && (
                    <div className="flex items-center gap-2 flex-wrap bg-muted/60 rounded px-3 py-1 border border-muted-foreground/10">
                        <span className="text-sm text-muted-foreground">
                            Filtered by: <span className="font-semibold text-primary">&quot;{searchText}&quot;</span>
                        </span>
                        <Link href="/admin/users">
                            <Button variant='ghost' size='sm' className="ml-1 px-2 py-1 h-auto text-xs">Remove Filter</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
                <div className="rounded-lg border shadow-sm">
                    <div className="overflow-y-auto">
                        <Table className="table-fixed w-full">
                            <TableHeader className="sticky top-0 bg-card z-10">
                                <TableRow>
                                    <TableHead className="min-w-[100px] cursor-pointer">
                                        <Link href={buildSortLink('id')}>
                                            ID <SortArrow active={sort==='id'} direction={order} />
                                        </Link>
                                    </TableHead>
                                    <TableHead className="min-w-[200px] cursor-pointer">
                                        <Link href={buildSortLink('name')}>
                                            NAME <SortArrow active={sort==='name'} direction={order} />
                                        </Link>
                                    </TableHead>
                                    <TableHead className="min-w-[250px] cursor-pointer">
                                        <Link href={buildSortLink('email')}>
                                            EMAIL <SortArrow active={sort==='email'} direction={order} />
                                        </Link>
                                    </TableHead>
                                    <TableHead className="min-w-[120px] cursor-pointer">
                                        <Link href={buildSortLink('role')}>
                                            ROLE <SortArrow active={sort==='role'} direction={order} />
                                        </Link>
                                    </TableHead>
                                    <TableHead className="min-w-[150px] text-right">ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data?.map((user: User) => (
                                    <TableRow key={user.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{formatId(user.id)}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            {user.role === 'admin' ? (
                                                <Badge variant='default'>
                                                    {capitalize(user.role)}
                                                </Badge>
                                            ) : (
                                                <Badge variant='secondary'>
                                                    {capitalize(user.role)}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <UserTableActions user={user} />
                                                <DeleteDialog id={user.id} action={deleteUser}>
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
                {users.data?.map((user: User, i: number) => (
                    <MotionDiv
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                        <Card className="shadow-md border border-muted bg-background/90">
                            <CardContent className="py-4 px-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="font-semibold">User ID</span>
                                    <span>{formatId(user.id)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Name</span>
                                    <span className="font-medium">{user.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Email</span>
                                    <span className="font-medium">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Role</span>
                                    <span>
                                        {user.role === 'admin' ? (
                                            <Badge variant='default'>
                                                {capitalize(user.role)}
                                            </Badge>
                                        ) : (
                                            <Badge variant='secondary'>
                                                {capitalize(user.role)}
                                            </Badge>
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 px-4 pb-4 pt-0">
                                <UserTableActions user={user} />
                                <DeleteDialog id={user.id} action={deleteUser}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                </DeleteDialog>
                            </CardFooter>
                        </Card>
                    </MotionDiv>
                ))}
            </div>

            {/* Pagination */}
            {typeof users?.totalPages === 'number' && users.totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Pagination
                        page={Number(page) || 1}
                        totalPages={users.totalPages}
                    />
                </div>
            )}
        </div>
    );
}
 
export default AdminUserPage;