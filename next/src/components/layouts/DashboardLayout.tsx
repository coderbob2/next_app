import React, { useState, useEffect } from 'react';
import SideNav from './SideNav';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(window.innerWidth > 768);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSideNavOpen(true);
      } else {
        setIsSideNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // Set initial state
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav isOpen={isSideNavOpen} toggleSideNav={toggleSideNav} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSideNav={toggleSideNav} />
        <main className="p-4 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
