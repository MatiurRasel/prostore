import { NextResponse } from 'next/server';
import { ensureSessionCartId } from '@/lib/cart-session';

export async function GET() {
  try {
    const sessionCartId = await ensureSessionCartId();
    
    return NextResponse.json({ 
      success: true, 
      sessionCartId 
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create session cart' },
      { status: 500 }
    );
  }
} 