import { Container } from "@/components/ui/container";
import SettingsSection from "@/components/SettingsSection";
import SettingsPanel from "@/components/SettingsPanel";
import InventoryCheck from "@/components/InventoryCheck";
import PermissionsManager from "@/components/PermissionsManager";
import { SettingsState, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SettingsPageProps {
  settings: SettingsState;
  updateSetting: (key: keyof SettingsState, value: any) => void;
  user: User;
  onLogout: () => void;
  onInventoryUpdate: (productId: number, quantity: number) => Promise<void>;
}

const SettingsPage = ({ settings, updateSetting, user, onLogout, onInventoryUpdate }: SettingsPageProps) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("appearance");
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  
  // Fetch products on load
  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await apiRequest({
          url: '/api/products',
          method: 'GET'
        });
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    
    getProducts();
  }, []);

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Hello, {user.firstName} {user.lastName} (Tech ID: {user.techId})
          </p>
        </div>
        <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="appearance" value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4">
          <SettingsSection settings={settings} updateSetting={updateSetting} />
        </TabsContent>
        
        <TabsContent value="inventory">
          <InventoryCheck 
            userId={user.id} 
            inventory={user.inventory || {}} 
            products={products}
            onInventoryUpdate={onInventoryUpdate}
          />
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
          <PermissionsManager 
            onPermissionChange={(type, status) => {
              // We could save these permissions to the user's settings
              // or just handle them locally
              toast({
                title: `${type.charAt(0).toUpperCase() + type.slice(1)} Permission`,
                description: `Status changed to: ${status}`,
              });
            }}
          />
        </TabsContent>
        
        <TabsContent value="account">
          <SettingsPanel 
            userId={user.id}
            settings={settings}
            onSettingsUpdate={(newSettings) => {
              // Handle the entire settings object being updated at once
              for (const [key, value] of Object.entries(newSettings)) {
                if (key in settings && settings[key as keyof SettingsState] !== value) {
                  updateSetting(key as keyof SettingsState, value);
                }
              }
            }}
            onLogout={onLogout}
          />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="text-center text-xs text-muted-foreground">
        <p>HelpTech Pest Control App v1.0</p>
        <p>© 2025 Insight Pest Solutions</p>
      </div>
    </Container>
  );
};

export default SettingsPage;
