import React, { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, UserRound, PackageCheck, CircleUser } from 'lucide-react';

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
      const distA = a.distance || Infinity;
      const distB = b.distance || Infinity;
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Nearby Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simple visual representation of technicians */}
          <div className="relative h-[200px] bg-muted rounded-lg overflow-hidden mb-4 p-4 border border-border">
            {/* Current user */}
            <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-1">
                <UserRound size={20} />
              </div>
              <span className="text-xs font-medium">You</span>
            </div>

            {/* Technicians relative positioning */}
            {techsWithDistance.map((tech, index) => {
              if (!tech.distance) return null;
              
              // Calculate position based on simple layout
              // First technician is always to the right, subsequent ones are arranged in a semicircle
              const angle = (index * 45) - 45; // Spread from -45 to 135 degrees
              const normalizedDistance = Math.min(tech.distance, 5) / 5; // Max display distance is 5km
              const radius = 80 * normalizedDistance; // Max radius of 80px
              
              // Calculate x,y coords
              const x = radius * Math.cos(angle * Math.PI / 180);
              const y = -radius * Math.sin(angle * Math.PI / 180); // Negative since y increases downward in CSS
              
              const isSelected = selectedTechnician?.id === tech.id;
              
              return (
                <div 
                  key={tech.id}
                  className={`absolute left-1/2 top-1/2 flex flex-col items-center cursor-pointer transition-all ${isSelected ? 'scale-110' : ''}`}
                  style={{ 
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    zIndex: isSelected ? 10 : 1
                  }}
                  onClick={() => setSelectedTechnician(tech)}
                >
                  <div className={`w-10 h-10 rounded-full ${isSelected ? 'bg-destructive' : 'bg-secondary'} flex items-center justify-center text-primary-foreground mb-1 border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}>
                    <CircleUser size={20} />
                  </div>
                  <span className="text-xs font-medium bg-background/80 px-1 rounded">{tech.distance.toFixed(1)}km</span>
                </div>
              );
            })}

            {/* Distance indicators */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80px] h-[80px] rounded-full border border-dashed border-border/50 opacity-30"></div>
              <div className="w-[160px] h-[160px] rounded-full border border-dashed border-border/50 opacity-30"></div>
            </div>
          </div>

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
                  <div>
                    <div className="flex flex-col items-center">
                      <PackageCheck size={24} className="text-primary mb-1" />
                      <Badge variant="outline" className="mt-1">
                        Quantity: {(selectedTechnician.inventory as any)[productId.toString()] || 0}
                      </Badge>
                    </div>
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