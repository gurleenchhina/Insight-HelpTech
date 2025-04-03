
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function AdminDashboard() {
  const [photo, setPhoto] = useState('')
  
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Controls</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Profile Management</h2>
            <Input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Handle photo upload
                }
              }}
            />
          </div>

          <div>
            <h2 className="font-semibold mb-2">Password Change</h2>
            <Input 
              type="password" 
              placeholder="New Password"
              className="mb-2"
            />
            <Button>Update Password</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
