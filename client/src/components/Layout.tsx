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
    <div className="flex flex-col h-screen bg-neutral-lightest">
      <Header />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default Layout;
