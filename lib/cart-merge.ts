// lib/cart-merge.ts
import { cookies } from 'next/headers';
import { prisma } from '@/db/prisma';
import { CartItem } from '@/types';
import { calcPrice } from '@/lib/utils';

export async function mergeGuestCartWithUserCart(userId: string) {
  const cookieStore = await cookies();
  const sessionCartIdFromCookie = cookieStore.get('sessionCartId')?.value;

  if (!sessionCartIdFromCookie) {
    return;
  }

  const guestCart = await prisma.cart.findFirst({
    where: {
      sessionCartId: sessionCartIdFromCookie,
      userId: null // Explicitly look for a guest cart
    }
  });

  const userCart = await prisma.cart.findFirst({
    where: { userId: userId }
  });

  if (guestCart) {
    if (userCart) {
      // Merge guestCart items into userCart items
      const mergedItems = [...userCart.items as CartItem[]];
      (guestCart.items as CartItem[]).forEach(guestItem => {
        const existingItem = mergedItems.find(item => item.productId === guestItem.productId);
        if (existingItem) {
          existingItem.qty += guestItem.qty;
          // Ensure qty does not exceed stock if you have stock checking here
        } else {
          mergedItems.push(guestItem);
        }
      });

      const newPrices = calcPrice(mergedItems);
      
      await prisma.cart.update({
        where: { id: userCart.id },
        data: {
          items: mergedItems as unknown as object, 
          ...newPrices // Spread the new prices here
        }
      });
      await prisma.cart.delete({ where: { id: guestCart.id }});
      cookieStore.delete('sessionCartId');

    } else {
      // No existing user cart, assign guest cart to user
      const newPrices = calcPrice(guestCart.items as CartItem[]);
      await prisma.cart.update({
        where: { id: guestCart.id },
        data: {
          userId: userId,
          sessionCartId: undefined, // Keeping undefined as per previous linter fix
          items: guestCart.items as unknown as object, // Ensure items are also persisted
          ...newPrices // Spread the new prices here
        }
      });
    }
  }
  // If guestCart does not exist, nothing to merge, user continues with their userCart or no cart.
} 