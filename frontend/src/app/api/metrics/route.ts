// src/app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}
