import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import Layout from "@/components/Layout";
import LoadingScreen from '@/components/LoadingScreen';
import { SettingsState, User } from '@/lib/types';

function App() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');
  
  // Create a default user instead of requiring login
  const [user, setUser] = useState<User>({
    id: 1,
    techId: "default",
    username: "user",
    firstName: "Default",
    lastName: "User",
    location: { latitude: 0, longitude: 0 },
    inventory: {},
    settings: {
      darkMode: false,
      textSize: 3,
      brightness: 5,
      safetyAlerts: true,
      ppeReminders: true
    },
    lastActive: null
  });
  
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: false,
    textSize: 3,
    brightness: 5,
    safetyAlerts: true,
    ppeReminders: true
  });

  // Update a single setting
  const updateSetting = async (key: keyof SettingsState, value: any) => {
    if (!user) return;
    
    // Update local state
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Update server if user is logged in
    try {
      await apiRequest({
        url: `/api/user/${user.id}/settings`,
        method: 'POST',
        body: JSON.stringify({ [key]: value }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      toast({
        title: "Settings Update Failed",
        description: "Could not save your settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update inventory
  const updateInventory = async (productId: number, quantity: number) => {
    if (!user) return;

    try {
      const response = await apiRequest({
        url: `/api/user/${user.id}/inventory`,
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local user object with updated inventory
        const updatedUser = await response.json();
        setUser(updatedUser);
      }
    } catch (error) {
      toast({
        title: "Inventory Update Failed",
        description: "Could not update your inventory. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize settings from user profile
  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
    }
  }, []);

  // Apply dark mode when settings change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply text size
    const textSizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
    document.documentElement.classList.remove(...textSizeClasses);
    document.documentElement.classList.add(textSizeClasses[settings.textSize - 1] || 'text-base');
    
    // Apply brightness using a CSS variable (ensuring full visibility by default)
    document.documentElement.style.setProperty('--app-brightness', '100%');
  }, [settings]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Loading Screen */}
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      
      {/* Main App */}
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'pests' && <HomePage />}
          {activeTab === 'search' && <SearchPage />}
          {activeTab === 'settings' && (
            <SettingsPage 
              settings={settings} 
              updateSetting={updateSetting}
              user={user}
              onLogout={() => {
                // Just reset settings without actual logout
                setSettings({
                  darkMode: false,
                  textSize: 3,
                  brightness: 5,
                  safetyAlerts: true,
                  ppeReminders: true
                });
                toast({
                  title: "Settings Reset",
                  description: "Settings have been reset to default."
                });
              }}
              onInventoryUpdate={updateInventory}
            />
          )}
        </Layout>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
