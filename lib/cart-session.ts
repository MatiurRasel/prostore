// lib/cart-session.ts
import { cookies } from 'next/headers';

export async function getSessionCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('sessionCartId')?.value || null;
}

export async function setSessionCartId(sessionCartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('sessionCartId', sessionCartId);
}

export function generateSessionCartId(): string {
  return crypto.randomUUID();
}

export async function ensureSessionCartId(): Promise<string> {
  const existingId = await getSessionCartId();
  if (existingId) {
    return existingId;
  }
  
  const newId = generateSessionCartId();
  await setSessionCartId(newId);
  return newId;
} 