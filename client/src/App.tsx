import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import Layout from "@/components/Layout";
import { SettingsState } from '@/lib/types';

function App() {
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
      {/* Use Layout for all routes to maintain consistent tab navigation */}
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
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
