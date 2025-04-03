
'use client'

import { useState, useEffect } from 'react'
import Map from './Map'
import { VehicleData } from '@/lib/types'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TechnicianTrainingProps {
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

export default function TechnicianTraining({ onLocationUpdate }: TechnicianTrainingProps) {
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    if (isTracking) {
      // Connect to WebSocket for real-time updates
      const ws = new WebSocket(`wss://${window.location.hostname}/ws`)
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'vehicle_update') {
          setVehicles(data.vehicles)
        }
      }

      return () => ws.close()
    }
  }, [isTracking])

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Technician Training Dashboard</h2>
        <Button 
          onClick={() => setIsTracking(!isTracking)}
          variant={isTracking ? "destructive" : "default"}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Button>
        
        <div className="h-[500px] w-full">
          <Map vehicles={vehicles} type="technician" />
        </div>
      </div>
    </Card>
  )
}
