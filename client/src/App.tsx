import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import Layout from "@/components/Layout";
import LoadingScreen from '@/components/LoadingScreen';
import { SettingsState } from '@/lib/types';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pests');
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: false,
    textSize: 3,
    brightness: 3,
    safetyAlerts: true,
    ppeReminders: true
  });

  // Update a single setting
  const updateSetting = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
            />
          )}
        </Layout>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
