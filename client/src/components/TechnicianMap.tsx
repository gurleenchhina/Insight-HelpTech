import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px'
};

interface TechnicianMapProps {
  technicians: User[];
  productId: number;
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

interface TechnicianWithDistance extends User {
  distance?: number;
  travelTime?: string;
}

const TechnicianMap: React.FC<TechnicianMapProps> = ({ technicians, productId, userLocation }) => {
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianWithDistance | null>(null);
  const [techsWithDistance, setTechsWithDistance] = useState<TechnicianWithDistance[]>([]);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    calculateDistances();
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const calculateDistances = async () => {
    if (!window.google || !window.google.maps || technicians.length === 0) return;

    const service = new google.maps.DistanceMatrixService();
    const origin = new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
    
    const destinations = technicians.map(tech => {
      const location = tech.location as { latitude: number, longitude: number };
      return new google.maps.LatLng(location.latitude, location.longitude);
    });

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const techsWithDistanceInfo = technicians.map((tech, index) => {
            const result = response.rows[0].elements[index];
            return {
              ...tech,
              distance: result.distance ? result.distance.value / 1000 : undefined, // km
              travelTime: result.duration ? result.duration.text : undefined
            };
          });
          setTechsWithDistance(techsWithDistanceInfo);
        }
      }
    );
  };

  const center = {
    lat: userLocation.latitude,
    lng: userLocation.longitude
  };

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Nearby Technicians with Required Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onMapLoad}
            onUnmount={onUnmount}
          >
            {/* User location marker */}
            <Marker
              position={center}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              }}
            />
            
            {/* Technician markers */}
            {technicians.map((tech) => {
              const location = tech.location as { latitude: number, longitude: number };
              return (
                <Marker
                  key={tech.id}
                  position={{
                    lat: location.latitude,
                    lng: location.longitude
                  }}
                  onClick={() => {
                    const techWithDistance = techsWithDistance.find(t => t.id === tech.id) || tech;
                    setSelectedTechnician(techWithDistance);
                  }}
                />
              );
            })}
            
            {/* Info window for selected technician */}
            {selectedTechnician && (
              <InfoWindow
                position={{
                  lat: (selectedTechnician.location as any).latitude,
                  lng: (selectedTechnician.location as any).longitude
                }}
                onCloseClick={() => setSelectedTechnician(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-bold">{selectedTechnician.firstName} {selectedTechnician.lastName}</h3>
                  <div className="text-sm mt-1">
                    <div className="flex items-center gap-1">
                      <Phone size={14} /> ID: {selectedTechnician.techId}
                    </div>
                    {selectedTechnician.distance && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {selectedTechnician.distance.toFixed(1)} km away
                      </div>
                    )}
                    {selectedTechnician.travelTime && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={14} /> {selectedTechnician.travelTime} drive
                      </div>
                    )}
                    <div className="mt-2">
                      <Badge variant="outline">
                        Quantity: {(selectedTechnician.inventory as any)[productId.toString()]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {techsWithDistance.map((tech) => (
          <Card key={tech.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setSelectedTechnician(tech)}>
            <CardContent className="p-4">
              <h3 className="font-bold">{tech.firstName} {tech.lastName}</h3>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Phone size={14} /> ID: {tech.techId}
                </div>
                {tech.distance && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> {tech.distance.toFixed(1)} km away
                  </div>
                )}
                {tech.travelTime && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} /> {tech.travelTime} drive
                  </div>
                )}
                <div className="mt-2">
                  <Badge variant="outline">
                    Quantity: {(tech.inventory as any)[productId.toString()]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TechnicianMap;