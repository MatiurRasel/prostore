import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.method === 'POST') {
    return request.text().then(body => {
      try {
        const parsed = JSON.parse(body);
        if (!parsed || typeof parsed !== 'object') {
          console.warn('[Uploadthing] Null or invalid payload received:', body);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[Uploadthing] Non-JSON payload received: ${errorMessage}`, body);
      }
      return NextResponse.next();
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/uploadthing'],
};
