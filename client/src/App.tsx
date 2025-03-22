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
import UserAuth from '@/components/UserAuth';
import LocationTracker from '@/components/LocationTracker';
import { SettingsState, User } from '@/lib/types';

function App() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: false,
    textSize: 3,
    brightness: 5, // Brightness setting (not currently used)
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

  // Handle successful login
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Set user settings from their profile
    if (loggedInUser.settings) {
      setSettings(loggedInUser.settings);
    }

    toast({
      title: "Login Successful",
      description: `Welcome back, ${loggedInUser.firstName}!`,
    });
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    
    // Reset to default settings
    setSettings({
      darkMode: false,
      textSize: 3,
      brightness: 5, // Brightness setting (not currently used)
      safetyAlerts: true,
      ppeReminders: true
    });

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

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
      
      {/* Login Screen or Main App */}
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        {!user ? (
          <div className="flex min-h-screen items-center justify-center p-4">
            <UserAuth onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'pests' && <HomePage />}
            {activeTab === 'search' && <SearchPage />}
            {activeTab === 'settings' && (
              <SettingsPage 
                settings={settings} 
                updateSetting={updateSetting}
                user={user}
                onLogout={handleLogout}
                onInventoryUpdate={updateInventory}
              />
            )}
            {/* Add LocationTracker component that will work in background */}
            {user && <LocationTracker user={user} />}
          </Layout>
        )}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
