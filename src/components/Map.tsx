
'use client'

import { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import type { VehicleData } from '@/lib/types'

interface MapProps {
  vehicles: VehicleData[]
  type: 'technician' | 'sales'
}

export default function Map({ vehicles, type }: MapProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 })

  useEffect(() => {
    // Center map based on vehicles average position
    if (vehicles.length > 0) {
      const avgLat = vehicles.reduce((sum, v) => sum + v.latitude, 0) / vehicles.length
      const avgLng = vehicles.reduce((sum, v) => sum + v.longitude, 0) / vehicles.length
      setMapCenter({ lat: avgLat, lng: avgLng })
    }
  }, [vehicles])

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        center={mapCenter}
        zoom={12}
        mapContainerClassName="w-full h-[600px]"
      >
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.deviceId}
            position={{ lat: vehicle.latitude, lng: vehicle.longitude }}
            title={vehicle.deviceName}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}
