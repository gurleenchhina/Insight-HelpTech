import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const recentSearches = await db.getRecentSearches(5);
    return NextResponse.json(recentSearches);
  } catch (error) {
    console.error('Failed to fetch recent searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' }, 
      { status: 500 }
    );
  }
}