'use client';

import { Cart, CartItem } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemsToCart, removeItemFromCart } from "@/lib/actions/cart.actions"; 
import { useTransition } from "react";

const AddToCart = ({cart, item}: {cart?: Cart, item:CartItem}) => {
    const router = useRouter();
    const { toast } = useToast();

    const[isPending, startTransition] = useTransition();

    const handleAddToCart = async () => {
        startTransition( async () => {
            const res = await addItemsToCart(item);

            if(!res.success) {
                toast({
                    variant: 'destructive',
                    description: res.message,
                });
                return;
            }
    
            //Handle success add to cart
            toast({
                description: 'Added to cart successfully',
                action: (
                    <ToastAction 
                        className="bg-primary text-white hover:bg-gray-800"
                        altText="Go To Cart"
                        onClick={() => router.push('/cart')}
                    >
                        Go To Cart
                    </ToastAction>
                )
            });
        })
        
    }
    //Handle Remove from Cart
    const handleRemoveFromCart = async () => {
        startTransition( async () => {
            const res = await removeItemFromCart(item.productId);

            toast({
                variant: res.success ? 'default' : 'destructive',
                description: res.message
            });
    
            return;
        });
        
    };
    //Check if item is in cart
    const existItem = cart && cart.items.find((x) => x.productId === item.productId)
    return existItem ? (
        <div>
            <Button type="button" variant='outline' onClick={handleRemoveFromCart}>
                { isPending ? (
                    <Loader className="w-4 h-4 animate-spin"></Loader>
                ) : (
                    <Minus className="h-4 w-4"></Minus>
                ) }
                
            </Button>
            <span className="px-2">{existItem.qty}</span>
            <Button type="button" variant='outline' onClick={handleAddToCart}>
            { isPending ? (
                    <Loader className="w-4 h-4 animate-spin"></Loader>
                ) : (
                    <Plus className="h-4 w-4"></Plus>
                ) }
                
              
            </Button>
        </div>
    ) : (
        <Button className="w-full" type="button" onClick={handleAddToCart}>
            { isPending ? (
                    <Loader className="w-4 h-4 animate-spin"></Loader>
                ) : (
                    <Plus className="h-4 w-4"></Plus>
                ) }    Add To Cart
        </Button>
    );
}
 
export default AddToCart;