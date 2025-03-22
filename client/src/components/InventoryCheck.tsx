import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Product, User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import TechnicianMap from './TechnicianMap';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InventoryCheckProps {
  userId: number;
  inventory: Record<string, number>;
  products: Product[];
  onInventoryUpdate: (productId: number, quantity: number) => void;
}

const InventoryCheck: React.FC<InventoryCheckProps> = ({ 
  userId,
  inventory = {},
  products = [],
  onInventoryUpdate 
}) => {
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [nearbyTechs, setNearbyTechs] = useState<Partial<User>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);
  
  // Use location tracking hook
  const { technicians, sendLocation, isConnected } = useLocationTracking({
    userId,
    enabled: locationTrackingEnabled
  });
  
  // Get user's current location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // Update user's location in the backend
          updateUserLocation(latitude, longitude);
        },
        (error) => {
          toast({
            title: "Location Error",
            description: `Could not get your location: ${error.message}. Some features may be limited.`,
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your device does not support geolocation. Some features may be limited.",
        variant: "destructive"
      });
    }
  }, []);
  
  const updateUserLocation = async (latitude: number, longitude: number) => {
    try {
      const response = await apiRequest({
        url: `/api/user/${userId}/location`,
        method: 'POST',
        body: JSON.stringify({ latitude, longitude }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to update user location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };
  
  const handleQuantityChange = async (productId: number, quantity: number) => {
    try {
      onInventoryUpdate(productId, quantity);
      
      const response = await apiRequest({
        url: `/api/user/${userId}/inventory`,
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to update inventory",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not update inventory due to network issue",
        variant: "destructive"
      });
    }
  };
  
  const findNearbyTechs = async (productId: number) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Your location is needed to find nearby technicians",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setSelectedProductId(productId);
    
    try {
      const response = await apiRequest({
        url: '/api/nearby-technicians',
        method: 'POST',
        body: JSON.stringify({
          productId,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusKm: searchRadius
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNearbyTechs(data);
        
        if (data.length === 0) {
          toast({
            title: "No Results",
            description: `No technicians with ${products.find(p => p.id === productId)?.name} found within ${searchRadius}km`,
          });
        }
      } else {
        toast({
          title: "Search Failed",
          description: "Could not find nearby technicians",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not search for nearby technicians",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openMapsApp = (latitude: number, longitude: number) => {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    let mapsUrl;
    if (isIOS) {
      // Apple Maps
      mapsUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
    } else {
      // Google Maps
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    }
    
    window.open(mapsUrl, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Inventory</CardTitle>
          <CardDescription>
            Manage your product inventory and find nearby technicians
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="font-medium">{product.name}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={inventory[product.id.toString()] || 0}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                      min="0"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => findNearbyTechs(product.id)}
                      disabled={isLoading}
                    >
                      Find Nearby
                    </Button>
                  </div>
                </div>
                {inventory[product.id.toString()] === 0 && (
                  <p className="text-xs text-amber-500 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> 
                    Out of stock
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {selectedProductId && userLocation && (
        <Card>
          <CardHeader>
            <CardTitle>
              Nearby Technicians with {products.find(p => p.id === selectedProductId)?.name}
            </CardTitle>
            <CardDescription>
              Technicians within {searchRadius}km who have this product in inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <Label>Search Radius: {searchRadius}km</Label>
              <Slider
                value={[searchRadius]}
                min={1}
                max={50}
                step={1}
                onValueChange={(values) => setSearchRadius(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>
            
            <Button 
              className="w-full mb-4" 
              onClick={() => findNearbyTechs(selectedProductId)}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Refresh Search"}
            </Button>
            
            {nearbyTechs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No technicians found with this product in the selected radius
              </p>
            ) : (
              <Tabs defaultValue="map" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="map">Map View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="map" className="mt-0">
                  <TechnicianMap 
                    technicians={nearbyTechs as User[]}
                    productId={selectedProductId}
                    userLocation={userLocation}
                  />
                </TabsContent>
                
                <TabsContent value="list" className="mt-0">
                  <div className="space-y-3">
                    {nearbyTechs.map((tech) => (
                      <div key={tech.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{tech.firstName} {tech.lastName}</p>
                            <p className="text-sm text-muted-foreground">ID: {tech.techId}</p>
                          </div>
                          <Badge variant="outline">
                            {(tech.inventory as Record<string, number>)[selectedProductId.toString()]} units
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          {tech.location && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openMapsApp(
                                (tech.location as any).latitude, 
                                (tech.location as any).longitude
                              )}
                              className="flex items-center"
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              Directions
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryCheck;