import { ReactNode } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen max-h-screen overflow-hidden bg-background">
      <Header />
      <main className="flex-1 overflow-auto pb-16">
        {children}
      </main>
      <div className="fixed bottom-0 left-0 right-0">
        <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
};

export default Layout;
