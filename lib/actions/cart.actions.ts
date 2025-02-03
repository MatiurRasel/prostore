'use server';
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { formatError } from "../utils";

export async function addItemsToCart(data:CartItem) {
    try {
        //Check for cart cookie.
        
        return {
            success: true,
            message: 'Item added to cart',
        };

    } catch(error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
    
}