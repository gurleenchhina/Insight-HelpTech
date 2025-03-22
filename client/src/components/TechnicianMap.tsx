import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

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
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  
  // Fetch Google Maps API key from backend
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/maps-api-key');
        if (response.ok) {
          const data = await response.json();
          if (data.apiKey) {
            setGoogleMapsApiKey(data.apiKey);
            console.log("Successfully loaded Google Maps API key");
          } else {
            console.error('Google Maps API key is empty or undefined');
          }
        } else {
          console.error('Failed to fetch Google Maps API key');
        }
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
      }
    };
    
    fetchApiKey();
  }, []);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Define the calculateDistances function first
  const calculateDistances = async () => {
    if (!window.google || !window.google.maps || technicians.length === 0) {
      console.log("Unable to calculate distances: Google Maps not loaded or no technicians available");
      // Still set the technicians to display them without distance info
      setTechsWithDistance(technicians);
      return;
    }

    try {
      const service = new google.maps.DistanceMatrixService();
      const origin = new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
      
      const destinations = technicians.map(tech => {
        const location = tech.location as { latitude: number, longitude: number };
        if (!location.latitude || !location.longitude) {
          console.warn(`Invalid location for technician ${tech.id}`);
          return new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
        }
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
            console.log("Distance matrix response:", response);
            const techsWithDistanceInfo = technicians.map((tech, index) => {
              if (!response.rows[0] || !response.rows[0].elements[index]) {
                console.warn(`No distance data for technician ${tech.id}`);
                return tech;
              }
              
              const result = response.rows[0].elements[index];
              
              if (result.status !== 'OK') {
                console.warn(`Distance calculation failed for technician ${tech.id}: ${result.status}`);
                return tech;
              }
              
              return {
                ...tech,
                distance: result.distance ? result.distance.value / 1000 : undefined, // km
                travelTime: result.duration ? result.duration.text : undefined
              };
            });
            setTechsWithDistance(techsWithDistanceInfo);
          } else {
            console.error(`Distance matrix service failed: ${status}`);
            // Still set technicians to display them without distance info
            setTechsWithDistance(technicians);
          }
        }
      );
    } catch (error) {
      console.error("Error calculating distances:", error);
      // Still set technicians to display them without distance info
      setTechsWithDistance(technicians);
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    calculateDistances();
  }, [technicians, userLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

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
              
              // Skip technicians with invalid location data
              if (!location || !location.latitude || !location.longitude) {
                console.warn(`Skipping marker for technician ${tech.id} due to invalid location data`);
                return null;
              }
              
              return (
                <Marker
                  key={tech.id}
                  position={{
                    lat: location.latitude,
                    lng: location.longitude
                  }}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  }}
                  onClick={() => {
                    const techWithDistance = techsWithDistance.find(t => t.id === tech.id) || tech;
                    setSelectedTechnician(techWithDistance);
                  }}
                />
              );
            })}
            
            {/* Info window for selected technician */}
            {selectedTechnician && 
             selectedTechnician.location && 
             (selectedTechnician.location as any).latitude && 
             (selectedTechnician.location as any).longitude && (
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
                      <Phone size={14} /> Tech ID: {selectedTechnician.techId}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Phone size={14} /> Username: {selectedTechnician.username}
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
                  <Phone size={14} /> Tech ID: {tech.techId}
                </div>
                <div className="flex items-center gap-1">
                  <Phone size={14} /> Username: {tech.username}
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