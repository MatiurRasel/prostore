'use client';

import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { addItemsToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { ArrowRight,Loader, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Cart } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {Table, TableBody, TableHeader, TableHead, TableRow, TableCell} from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const CartTable = ({cart}: {cart?: Cart}) => {

    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const isEmpty = !cart || cart.items.length === 0;

    return ( 
    <>
       {!isEmpty && (
            <h1 className="py-4 h2-bold text-center md:text-left">Shopping Cart</h1>
       )}
       {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)] md:min-h-[calc(100vh-300px)]">
            <ShoppingCart size={96} className="text-gray-300 mb-6" strokeWidth={1} />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty!</h2>
            <p className="text-gray-500 mb-6">
                Looks like you haven&apos;t added anything to your cart yet. <br />
                Start browsing to find something amazing!
            </p>
            <Link href='/' passHref>
                <Button size="lg">
                    <ArrowRight className="mr-2 h-5 w-5" /> Go Shopping
                </Button>
            </Link>
        </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-5 gap-4">
            <div className="md:col-span-3">
                <div className="block md:hidden space-y-4">
                    {cart.items.map((item) => (
                        <Card key={item.slug} className="flex flex-col p-4 gap-3 shadow-md">
                            <div className="flex items-center gap-3">
                                <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md border object-cover w-16 h-16" />
                                <div className="flex-1">
                                    <Link href={`/product/${item.slug}`} className="font-medium text-base hover:underline">{item.name}</Link>
                                    <div className="text-sm text-muted-foreground mt-1">{formatCurrency(Number(item.price))} × {item.qty}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    <Button size="icon" className="rounded-full" disabled={isPending} variant='outline' type="button"
                                        onClick={() => startTransition(async () => {
                                            const res = await removeItemFromCart(item.productId);
                                            if(!res.success) {
                                                toast({ variant: 'destructive', description: res.message })
                                            }
                                        })}>
                                        {isPending ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Minus className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <span className="font-semibold w-6 text-center">{item.qty}</span>
                                    <Button size="icon" className="rounded-full" disabled={isPending} variant='outline' type="button"
                                        onClick={() => startTransition(async () => {
                                            const res = await addItemsToCart(item);
                                            if(!res.success) {
                                                toast({ variant: 'destructive', description: res.message })
                                            }
                                        })}>
                                        {isPending ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="text-right font-semibold text-lg">{formatCurrency(Number(item.price) * item.qty)}</div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.items.map((item) => (
                                <TableRow key={item.slug}>
                                    <TableCell>
                                        <Link href={`/product/${item.slug}`} className="flex items-center gap-2">
                                            <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md border object-cover w-12 h-12" />
                                            <span className="px-2">{item.name}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button size="icon" className="rounded-full" disabled={isPending} variant='outline' type="button"
                                                onClick={() => startTransition(async () => {
                                                    const res = await removeItemFromCart(item.productId);
                                                    if(!res.success) {
                                                        toast({ variant: 'destructive', description: res.message })
                                                    }
                                                })}>
                                                {isPending ? (
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Minus className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <span className="font-semibold w-6 text-center">{item.qty}</span>
                                            <Button size="icon" className="rounded-full" disabled={isPending} variant='outline' type="button"
                                                onClick={() => startTransition(async () => {
                                                    const res = await addItemsToCart(item);
                                                    if(!res.success) {
                                                        toast({ variant: 'destructive', description: res.message })
                                                    }
                                                })}>
                                                {isPending ? (
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(item.price))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(item.price) * item.qty)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Card className="sticky bottom-0 md:static shadow-lg border-muted-foreground/20 bg-surface">
  <CardContent className="p-4 gap-4">
    <div className="space-y-4 text-primary-content">
      <div className="flex justify-between items-center">
        <span className="text-secondary-content">
          Subtotal ({cart.items.reduce((a, c) => a + c.qty, 0)} items)
        </span>
        <span className="font-medium">{formatCurrency(cart.itemsPrice)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-secondary-content">Shipping</span>
        <span className="font-medium">{formatCurrency(cart.shippingPrice)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-secondary-content">Tax</span>
        <span className="font-medium">{formatCurrency(cart.taxPrice)}</span>
      </div>
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Total</span>
        <span>{formatCurrency(cart.totalPrice)}</span>
      </div>
    </div>

    <Button
      className="w-full mt-4 py-3 text-base rounded-full font-semibold bg-gradient-to-r from-primary to-primary/80 
      hover:from-primary/90 hover:to-primary/70 shadow-md"
      disabled={isPending || cart.items.length === 0}
      onClick={() =>
        startTransition(() => {
          router.push("/shipping-address");
        })
      }
    >
      {isPending ? (
        <Loader className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <ArrowRight className="w-5 h-5 mr-2" />
      )}
      Proceed to Checkout
    </Button>
  </CardContent>
</Card>

        </div>
       )}
    </>
    );
}
 
export default CartTable;