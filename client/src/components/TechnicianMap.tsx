import React, { useEffect, useState, useCallback } from 'react';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, UserRound, PackageCheck, CircleUser, Navigation } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

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

const containerStyle = {
  width: '100%',
  height: '400px'
};

const TechnicianMap: React.FC<TechnicianMapProps> = ({ technicians, productId, userLocation }) => {
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianWithDistance | null>(null);
  const [techsWithDistance, setTechsWithDistance] = useState<TechnicianWithDistance[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [openInfoWindowId, setOpenInfoWindowId] = useState<number | null>(null);

  // Load Google Maps API with API key from endpoint
  const [apiKey, setApiKey] = useState<string>('');
  
  useEffect(() => {
    // Fetch the API key from the server
    fetch('/api/maps-api-key')
      .then(response => response.json())
      .then(data => {
        setApiKey(data.apiKey);
      })
      .catch(error => {
        console.error('Error fetching Google Maps API key:', error);
      });
  }, []);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  useEffect(() => {
    // Calculate distances between user and technicians
    const techsWithDistanceCalc = technicians.map(tech => {
      const techLocation = tech.location as { latitude: number, longitude: number };
      if (!techLocation || !techLocation.latitude || !techLocation.longitude) {
        return { ...tech };
      }

      // Simple distance calculation (as the crow flies)
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        techLocation.latitude,
        techLocation.longitude
      );

      // Estimate travel time (very rough estimate: 50 km/h average speed)
      const estimatedMinutes = Math.round(distance * 60 / 50);
      let travelTime;
      
      if (estimatedMinutes < 60) {
        travelTime = `${estimatedMinutes} min`;
      } else {
        const hours = Math.floor(estimatedMinutes / 60);
        const minutes = estimatedMinutes % 60;
        travelTime = `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
      }

      return {
        ...tech,
        distance,
        travelTime
      };
    });

    // Sort by distance
    techsWithDistanceCalc.sort((a, b) => {
      // Type-safe comparison with explicit type casting
      const distA = (a as TechnicianWithDistance).distance ?? Infinity;
      const distB = (b as TechnicianWithDistance).distance ?? Infinity;
      return distA - distB;
    });

    setTechsWithDistance(techsWithDistanceCalc);
  }, [technicians, userLocation]);

  // Haversine formula for calculating distance between two points on Earth
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const handleMarkerClick = (tech: TechnicianWithDistance) => {
    setSelectedTechnician(tech);
    setOpenInfoWindowId(tech.id);
    
    if (mapRef && tech.location) {
      const techLocation = tech.location as { latitude: number, longitude: number };
      mapRef.panTo({ lat: techLocation.latitude, lng: techLocation.longitude });
    }
  };
  
  const getDirections = () => {
    if (!selectedTechnician || !selectedTechnician.location) return;
    
    const directionsService = new google.maps.DirectionsService();
    const techLocation = selectedTechnician.location as { latitude: number, longitude: number };
    
    directionsService.route(
      {
        origin: { lat: userLocation.latitude, lng: userLocation.longitude },
        destination: { lat: techLocation.latitude, lng: techLocation.longitude },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Nearby Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Google Maps Display */}
          {isLoaded ? (
            <div className="mb-4">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                zoom={10}
                onLoad={onMapLoad}
                options={{
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                }}
              >
                {/* User location marker */}
                <Marker
                  position={{ 
                    lat: userLocation.latitude, 
                    lng: userLocation.longitude 
                  }}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new google.maps.Size(40, 40)
                  }}
                  zIndex={1000}
                />
                
                {/* Technician markers */}
                {techsWithDistance.map((tech) => {
                  const techLocation = tech.location as { latitude: number, longitude: number };
                  if (!techLocation || !techLocation.latitude || !techLocation.longitude) return null;
                  
                  const isSelected = selectedTechnician?.id === tech.id;
                  
                  return (
                    <Marker
                      key={tech.id}
                      position={{ 
                        lat: techLocation.latitude, 
                        lng: techLocation.longitude 
                      }}
                      onClick={() => handleMarkerClick(tech)}
                      icon={{
                        url: isSelected 
                          ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png" 
                          : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        scaledSize: new google.maps.Size(isSelected ? 40 : 30, isSelected ? 40 : 30)
                      }}
                      animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
                    >
                      {openInfoWindowId === tech.id && (
                        <InfoWindow
                          position={{
                            lat: techLocation.latitude,
                            lng: techLocation.longitude
                          }}
                          onCloseClick={() => setOpenInfoWindowId(null)}
                        >
                          <div className="p-2 max-w-[200px]">
                            <h3 className="font-bold text-sm">{tech.firstName} {tech.lastName}</h3>
                            <p className="text-xs">@{tech.username}</p>
                            {tech.distance && (
                              <p className="text-xs mt-1">{tech.distance.toFixed(1)} km away</p>
                            )}
                            {tech.travelTime && (
                              <p className="text-xs">{tech.travelTime} drive</p>
                            )}
                            <p className="text-xs mt-1">
                              Qty: {(tech.inventory as any)[productId.toString()] || 0}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  );
                })}
                
                {/* Display directions if available */}
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </div>
          ) : (
            <div className="bg-gray-100 h-[400px] flex items-center justify-center rounded-lg mb-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
                <p>Loading Google Maps...</p>
              </div>
            </div>
          )}

          {/* Selected technician details */}
          {selectedTechnician && (
            <Card className="mb-4 bg-accent">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{selectedTechnician.firstName} {selectedTechnician.lastName}</h3>
                    <div className="text-sm mt-2 space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone size={14} /> Tech ID: {selectedTechnician.techId}
                      </div>
                      <div className="flex items-center gap-1">
                        <CircleUser size={14} /> Username: {selectedTechnician.username}
                      </div>
                      {selectedTechnician.distance && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} /> {selectedTechnician.distance.toFixed(1)} km away
                        </div>
                      )}
                      {selectedTechnician.travelTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} /> {selectedTechnician.travelTime} drive
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col items-center">
                      <PackageCheck size={24} className="text-primary mb-1" />
                      <Badge variant="outline" className="mt-1">
                        Quantity: {(selectedTechnician.inventory as any)[productId.toString()] || 0}
                      </Badge>
                    </div>
                    <button 
                      className="flex items-center gap-1 text-xs bg-primary text-white px-2 py-1 rounded-md mt-2"
                      onClick={getDirections}
                    >
                      <Navigation size={12} /> Get Directions
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      
      {/* List of technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {techsWithDistance.map((tech) => (
          <Card 
            key={tech.id} 
            className={`cursor-pointer hover:bg-accent/50 transition-colors ${selectedTechnician?.id === tech.id ? 'border-primary border-2' : ''}`}
            onClick={() => setSelectedTechnician(tech)}
          >
            <CardContent className="p-4">
              <h3 className="font-bold">{tech.firstName} {tech.lastName}</h3>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Phone size={14} /> Tech ID: {tech.techId}
                </div>
                <div className="flex items-center gap-1">
                  <CircleUser size={14} /> Username: {tech.username}
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
                    Quantity: {(tech.inventory as any)[productId.toString()] || 0}
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