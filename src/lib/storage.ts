
export const storage = {
  async getAllPestCategories() {
    const response = await fetch('/api/pest-categories')
    return response.json()
  },
  
  async getRecommendationsByPestAndLocation(pestCategory: string, location: string) {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pestCategory, location }),
    })
    return response.json()
  },
  
  async addSearchQuery(query: string) {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
    return response.json()
  },
  
  async getRecentSearches(limit: number = 5) {
    const response = await fetch(`/api/recent-searches?limit=${limit}`)
    return response.json()
  }
}
