import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.getAllPestCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch pest categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pest categories' }, 
      { status: 500 }
    );
  }
}