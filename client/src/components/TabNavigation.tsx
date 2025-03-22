import { Button } from "@/components/ui/button";
import { Search, Bug, Settings } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="bg-white dark:bg-zinc-950 border-t border-muted sticky bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around items-center w-full h-16">
        <Button
          variant="ghost"
          size="lg"
          className={`flex flex-col items-center justify-center h-16 w-full rounded-none ${
            activeTab === 'search' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => onTabChange('search')}
        >
          <Search className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Search</span>
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          className={`flex flex-col items-center justify-center h-16 w-full rounded-none ${
            activeTab === 'pests' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => onTabChange('pests')}
        >
          <Bug className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Pests</span>
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          className={`flex flex-col items-center justify-center h-16 w-full rounded-none ${
            activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => onTabChange('settings')}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Settings</span>
        </Button>
      </div>
    </nav>
  );
};

export default TabNavigation;
