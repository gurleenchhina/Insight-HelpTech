import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

interface SettingsPanelProps {
  userId: number;
  settings: {
    darkMode: boolean;
    brightness: number;
    safetyAlerts: boolean;
    ppeReminders: boolean;
    textSize: number;
  };
  onSettingsUpdate: (newSettings: any) => void;
  onLogout: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  userId,
  settings, 
  onSettingsUpdate,
  onLogout
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSettingChange = async (key: string, value: any) => {
    // Update UI immediately for responsiveness
    const newSettings = { ...settings, [key]: value };
    onSettingsUpdate(newSettings);
    
    // Update server
    try {
      setIsSaving(true);
      const response = await apiRequest({
        url: `/api/user/${userId}/settings`,
        method: 'POST',
        body: JSON.stringify({ [key]: value }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // If server update fails, revert the UI change
        onSettingsUpdate(settings);
        toast({
          title: "Error",
          description: "Failed to update settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      // If there's a network error, revert the UI change
      onSettingsUpdate(settings);
      toast({
        title: "Connection Error",
        description: "Could not update settings due to network issue",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // We're no longer applying brightness via filter to avoid visibility issues
  React.useEffect(() => {
    // No brightness changes, using static 100% brightness for visibility
    document.documentElement.style.setProperty('--app-brightness', '100%');
    
    // Clean up
    return () => {
      document.documentElement.style.setProperty('--app-brightness', '100%');
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the app looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
              <span>Dark Mode</span>
              <span className="font-normal text-xs text-muted-foreground">
                Switch to a darker theme
              </span>
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brightness" className="flex flex-col space-y-1">
              <span>Brightness</span>
              <span className="font-normal text-xs text-muted-foreground">
                Adjust screen brightness
              </span>
            </Label>
            <Slider
              id="brightness"
              min={50}
              max={150}
              step={1}
              value={[settings.brightness]}
              onValueChange={(value) => handleSettingChange('brightness', value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dim</span>
              <span>Bright</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text-size" className="flex flex-col space-y-1">
              <span>Text Size</span>
              <span className="font-normal text-xs text-muted-foreground">
                Adjust text size for better readability
              </span>
            </Label>
            <Slider
              id="text-size"
              min={12}
              max={24}
              step={1}
              value={[settings.textSize]}
              onValueChange={(value) => handleSettingChange('textSize', value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Safety Settings</CardTitle>
          <CardDescription>
            Configure safety notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="safety-alerts" className="flex flex-col space-y-1">
              <span>Safety Alerts</span>
              <span className="font-normal text-xs text-muted-foreground">
                Get alerts about product safety concerns
              </span>
            </Label>
            <Switch
              id="safety-alerts"
              checked={settings.safetyAlerts}
              onCheckedChange={(checked) => handleSettingChange('safetyAlerts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="ppe-reminders" className="flex flex-col space-y-1">
              <span>PPE Reminders</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive reminders about required personal protective equipment
              </span>
            </Label>
            <Switch
              id="ppe-reminders"
              checked={settings.ppeReminders}
              onCheckedChange={(checked) => handleSettingChange('ppeReminders', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={onLogout}
      >
        Sign Out
      </Button>
    </div>
  );
};

export default SettingsPanel;