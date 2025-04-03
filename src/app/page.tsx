
'use client'

import { useState } from 'react'
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import Layout from "@/components/Layout"
import HomePage from "@/pages/HomePage"
import SearchPage from "@/pages/SearchPage"

export default function Home() {
  const [activeTab, setActiveTab] = useState('search')
  
  return (
    <QueryClientProvider client={queryClient}>
      <Layout 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)}
      >
        {activeTab === 'pests' && <HomePage />}
        {activeTab === 'search' && <SearchPage />}
      </Layout>
    </QueryClientProvider>
  )
}
