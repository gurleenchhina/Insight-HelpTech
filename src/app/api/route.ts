
import { NextResponse } from 'next/server'
import { storage } from "@/lib/storage"

export async function GET(request: Request) {
  const { pathname } = new URL(request.url)
  
  if (pathname.includes('recent-searches')) {
    const searches = await storage.getRecentSearches(5)
    return NextResponse.json(searches)
  }

  return NextResponse.json({ message: "HelpTech API" })
}

export async function POST(request: Request) {
  const { pathname } = new URL(request.url)
  const data = await request.json()

  if (pathname.includes('recommendations')) {
    const { pestCategory, location } = data
    const recommendations = await storage.getRecommendationsByPestAndLocation(pestCategory, location)
    return NextResponse.json(recommendations)
  }

  if (pathname.includes('search')) {
    const { query } = data
    await storage.addSearchQuery(query)
    const result = await processAISearch(JSON.stringify({
      userQuery: query,
      pestCategories: await storage.getAllPestCategories(),
      products: await storage.getAllProducts()
    }))
    return NextResponse.json(result)
  }

  return NextResponse.json({ message: "Endpoint not found" }, { status: 404 })
}
