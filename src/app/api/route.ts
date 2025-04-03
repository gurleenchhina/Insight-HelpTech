
import { NextResponse } from 'next/server'
import { storage } from "@/lib/storage"

export async function GET() {
  return NextResponse.json({ message: "HelpTech API" })
}

export async function POST(request: Request) {
  const data = await request.json()
  // Handle POST requests
  return NextResponse.json({ message: "Success" })
}
