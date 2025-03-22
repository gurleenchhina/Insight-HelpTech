import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import SearchScreen from './screens/SearchScreen';
import InventoryScreen from './screens/InventoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ChatbotScreen from './screens/ChatbotScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main App component
export default function App() {
  const [locationPermission, setLocationPermission] = useState(null);
  
  useEffect(() => {
    // Request location permissions on app load
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: '#38a169',
            tabBarInactiveTintColor: '#718096',
            tabBarStyle: {
              paddingVertical: Platform.OS === 'ios' ? 10 : 0,
            },
          }}
        >
          <Tab.Screen 
            name="Search" 
            component={SearchScreen} 
            options={{
              title: 'Search',
              headerStyle: { backgroundColor: '#38a169' },
              headerTintColor: '#fff',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Inventory" 
            component={InventoryScreen} 
            options={{
              title: 'Inventory',
              headerStyle: { backgroundColor: '#38a169' },
              headerTintColor: '#fff',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cube" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Chatbot" 
            component={ChatbotScreen}
            options={{
              title: 'Chat Assistant',
              headerStyle: { backgroundColor: '#38a169' },
              headerTintColor: '#fff',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubble-ellipses" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: 'Settings',
              headerStyle: { backgroundColor: '#38a169' },
              headerTintColor: '#fff',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      {!locationPermission && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Location permission is required for technician tracking features.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38a169',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
  permissionBanner: {
    backgroundColor: '#fc8181',
    padding: 10,
    alignItems: 'center',
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
  },
});