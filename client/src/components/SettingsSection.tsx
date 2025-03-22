import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsState } from "@/lib/types";

interface SettingsSectionProps {
  settings: SettingsState;
  updateSetting: (key: keyof SettingsState, value: any) => void;
}

const SettingsSection = ({ settings, updateSetting }: SettingsSectionProps) => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="font-condensed font-bold text-xl mb-4">Settings</h2>
      
      {/* App Theme */}
      <Card className="bg-white rounded-lg shadow-md p-4 mb-4">
        <CardHeader className="p-0 pb-3">
          <h3 className="font-condensed font-bold text-lg">Appearance</h3>
        </CardHeader>
        <CardContent className="p-0">
          {/* Theme Toggle */}
          <div className="flex justify-between items-center mb-4">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch 
              id="dark-mode" 
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)} 
            />
          </div>
          
          {/* Text Size */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Text Size</Label>
              <span className="text-sm text-neutral-medium">
                {settings.textSize === 1 ? 'Smallest' : 
                 settings.textSize === 2 ? 'Small' : 
                 settings.textSize === 3 ? 'Medium' : 
                 settings.textSize === 4 ? 'Large' : 'Largest'}
              </span>
            </div>
            <Slider 
              min={1} 
              max={5} 
              step={1}
              value={[settings.textSize]}
              onValueChange={(value) => updateSetting('textSize', value[0])}
              className="w-full"
            />
          </div>
          
          {/* Brightness */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Brightness</Label>
              <span className="material-icons text-neutral-dark">
                {settings.brightness <= 2 ? 'brightness_low' : 
                 settings.brightness === 3 ? 'brightness_medium' : 'brightness_high'}
              </span>
            </div>
            <Slider 
              min={1} 
              max={5} 
              step={1}
              value={[settings.brightness]}
              onValueChange={(value) => updateSetting('brightness', value[0])}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Safety & Notifications */}
      <Card className="bg-white rounded-lg shadow-md p-4 mb-4">
        <CardHeader className="p-0 pb-3">
          <h3 className="font-condensed font-bold text-lg">Safety & Notifications</h3>
        </CardHeader>
        <CardContent className="p-0">
          {/* Safety Notifications */}
          <div className="flex justify-between items-center mb-4">
            <Label htmlFor="safety-alerts">Safety Alerts</Label>
            <Switch 
              id="safety-alerts" 
              checked={settings.safetyAlerts}
              onCheckedChange={(checked) => updateSetting('safetyAlerts', checked)} 
            />
          </div>
          
          {/* PPE Reminders */}
          <div className="flex justify-between items-center">
            <Label htmlFor="ppe-reminders">PPE Reminders</Label>
            <Switch 
              id="ppe-reminders" 
              checked={settings.ppeReminders}
              onCheckedChange={(checked) => updateSetting('ppeReminders', checked)} 
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Support & Feedback */}
      <Card className="bg-white rounded-lg shadow-md p-4 mb-4">
        <CardHeader className="p-0 pb-3">
          <h3 className="font-condensed font-bold text-lg">Support & Feedback</h3>
        </CardHeader>
        <CardContent className="p-0">
          <Button variant="ghost" className="flex items-center text-neutral-dark py-2 w-full justify-start">
            <span className="material-icons mr-3">bug_report</span>
            <span>Report a Bug</span>
          </Button>
          <Button variant="ghost" className="flex items-center text-neutral-dark py-2 w-full justify-start">
            <span className="material-icons mr-3">help_outline</span>
            <span>Help Center</span>
          </Button>
          <Button variant="ghost" className="flex items-center text-neutral-dark py-2 w-full justify-start">
            <span className="material-icons mr-3">info_outline</span>
            <span>About</span>
          </Button>
        </CardContent>
      </Card>
      
      
    </div>
  );
};

export default SettingsSection;
