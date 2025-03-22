import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="bg-white border-t border-neutral-light">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 rounded-none ${
            activeTab === 'search' ? 'text-primary font-medium' : 'text-neutral-medium'
          }`}
          onClick={() => onTabChange('search')}
        >
          <span className="material-icons">search</span>
          <span className="text-xs mt-1">Search</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 rounded-none ${
            activeTab === 'pests' ? 'text-primary' : 'text-neutral-medium'
          }`}
          onClick={() => onTabChange('pests')}
        >
          <span className="material-icons">pest_control</span>
          <span className="text-xs mt-1">Pests</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 rounded-none ${
            activeTab === 'chatbot' ? 'text-primary' : 'text-neutral-medium'
          }`}
          onClick={() => onTabChange('chatbot')}
        >
          <span className="material-icons">chat</span>
          <span className="text-xs mt-1">Chat</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 rounded-none ${
            activeTab === 'settings' ? 'text-primary' : 'text-neutral-medium'
          }`}
          onClick={() => onTabChange('settings')}
        >
          <span className="material-icons">settings</span>
          <span className="text-xs mt-1">Settings</span>
        </Button>
      </div>
    </nav>
  );
};

export default TabNavigation;
