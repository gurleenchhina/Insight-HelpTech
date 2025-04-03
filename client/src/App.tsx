import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import Layout from "@/components/Layout";
import LoadingScreen from '@/components/LoadingScreen';
import { User } from '@/lib/types';

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
  
  // Create a default settings object
  const [settings, setSettings] = useState({
    darkMode: false,
    textSize: 3,
    brightness: 5,
    safetyAlerts: true,
    ppeReminders: true
  });

  // Basic settings update function (simplified)
  const updateSetting = async (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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
        <Layout activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          // Reset the view to the main category page when switching tabs
          window.history.pushState(null, '', '/');
        }}>
          <Switch>
            <Route path="/">
              {activeTab === 'pests' && <HomePage />}
              {activeTab === 'search' && <SearchPage />}
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </Layout>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
