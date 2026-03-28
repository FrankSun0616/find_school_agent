import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    provider: process.env.DEFAULT_AI_PROVIDER || 'anthropic',
    hasKey: !!process.env.DEFAULT_AI_API_KEY,
  });
}
