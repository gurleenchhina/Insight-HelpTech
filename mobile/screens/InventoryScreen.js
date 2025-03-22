import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Switch,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Seclira WSG', quantity: 5 },
    { id: 2, name: 'Temprid SC', quantity: 3 },
    { id: 3, name: 'Suspend Polyzone', quantity: 2 },
    { id: 4, name: 'Greenway Ant Gel', quantity: 8 },
    { id: 5, name: 'Contrac Blox', quantity: 10 },
  ]);
  
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyTechnicians, setNearbyTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);
  
  useEffect(() => {
    let locationSubscription;
    
    const startTracking = async () => {
      if (trackingEnabled) {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10, // minimum change (in meters) to receive updates
            timeInterval: 5000 // minimum time between updates in ms
          },
          (newLocation) => {
            setLocation(newLocation);
            // In a real app, we would send this location to our server
            console.log("Location updated:", newLocation);
          }
        );
      }
    };
    
    startTracking();
    
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [trackingEnabled]);
  
  const toggleTracking = () => {
    setTrackingEnabled(previous => !previous);
  };
  
  const handleUpdateQuantity = (id, change) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + change) } 
          : item
      )
    );
  };
  
  const findNearbyTechnicians = (productId) => {
    setIsLoading(true);
    setSelectedProduct(productId);
    
    // Simulate API call
    setTimeout(() => {
      setNearbyTechnicians([
        {
          id: 2,
          name: "Jane Doe",
          distance: 3.2, // kilometers
          latitude: location?.coords.latitude + 0.01,
          longitude: location?.coords.longitude - 0.01,
          travelTime: "12 min"
        },
        {
          id: 3,
          name: "Bob Smith",
          distance: 5.1,
          latitude: location?.coords.latitude - 0.02,
          longitude: location?.coords.longitude + 0.015,
          travelTime: "18 min"
        }
      ]);
      setIsLoading(false);
    }, 1500);
  };
  
  const renderInventoryItem = ({ item }) => (
    <View style={styles.inventoryItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, -1)}
          disabled={item.quantity <= 0}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.findButton,
            (item.quantity <= 0 || !location) && styles.disabledButton
          ]}
          onPress={() => findNearbyTechnicians(item.id)}
          disabled={item.quantity <= 0 || !location}
        >
          <Text style={styles.findButtonText}>Find Nearby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.trackingContainer}>
        <View style={styles.trackingInfo}>
          <Text style={styles.trackingTitle}>Location Sharing</Text>
          <Text style={styles.trackingDescription}>
            {trackingEnabled 
              ? "Your location is being shared with nearby technicians" 
              : "Enable to share your location with nearby technicians"}
          </Text>
        </View>
        <Switch
          trackColor={{ false: "#cbd5e0", true: "#9ae6b4" }}
          thumbColor={trackingEnabled ? "#38a169" : "#a0aec0"}
          ios_backgroundColor="#cbd5e0"
          onValueChange={toggleTracking}
          value={trackingEnabled}
        />
      </View>
      
      <Text style={styles.sectionTitle}>My Inventory</Text>
      
      <FlatList
        data={inventory}
        renderItem={renderInventoryItem}
        keyExtractor={item => item.id.toString()}
        style={styles.inventoryList}
        contentContainerStyle={styles.inventoryListContent}
      />
      
      {selectedProduct && (
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Nearby Technicians</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#38a169" />
              <Text style={styles.loadingText}>Finding nearby technicians...</Text>
            </View>
          ) : location ? (
            <>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {/* Current user marker */}
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  pinColor="#38a169"
                >
                  <Callout>
                    <Text>Your Location</Text>
                  </Callout>
                </Marker>
                
                {/* Nearby technicians markers */}
                {nearbyTechnicians.map(tech => (
                  <Marker
                    key={tech.id}
                    coordinate={{
                      latitude: tech.latitude,
                      longitude: tech.longitude,
                    }}
                    pinColor="#3182ce"
                  >
                    <Callout>
                      <Text style={styles.calloutTitle}>{tech.name}</Text>
                      <Text>{tech.distance.toFixed(1)} km away</Text>
                      <Text>Travel time: {tech.travelTime}</Text>
                    </Callout>
                  </Marker>
                ))}
              </MapView>
              
              <FlatList
                data={nearbyTechnicians}
                keyExtractor={item => item.id.toString()}
                style={styles.technicianList}
                renderItem={({ item }) => (
                  <View style={styles.technicianItem}>
                    <View>
                      <Text style={styles.technicianName}>{item.name}</Text>
                      <Text style={styles.technicianDistance}>
                        {item.distance.toFixed(1)} km • {item.travelTime} drive
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.contactButton}>
                      <Text style={styles.contactButtonText}>Contact</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          ) : (
            <Text style={styles.errorText}>
              {errorMsg || "Unable to access location. Please check your device settings."}
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setSelectedProduct(null);
              setNearbyTechnicians([]);
            }}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
    padding: 16,
  },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  trackingInfo: {
    flex: 1,
    marginRight: 16,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  trackingDescription: {
    fontSize: 14,
    color: '#718096',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  inventoryList: {
    flex: 1,
  },
  inventoryListContent: {
    paddingBottom: 20,
  },
  inventoryItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#4a5568',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  findButton: {
    backgroundColor: '#38a169',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  findButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 16,
    zIndex: 100,
  },
  mapTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  map: {
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4a5568',
  },
  technicianList: {
    flex: 1,
    marginBottom: 16,
  },
  technicianItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  technicianName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  technicianDistance: {
    fontSize: 14,
    color: '#718096',
  },
  contactButton: {
    backgroundColor: '#3182ce',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#718096',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default InventoryScreen;