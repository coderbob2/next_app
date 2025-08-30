import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SideNav from './SideNav';
import Header from './Header';
import { menuItems } from './menuItems';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSideNavOpen, setIsSideNavOpen] = useState(window.innerWidth > 768);
    const [title, setTitle] = useState('Dashboard');
    const location = useLocation();

    useEffect(() => {
        const currentPath = location.pathname;
        let currentTitle = 'Dashboard';

        for (const item of menuItems) {
            if (item.to === currentPath) {
                currentTitle = item.text;
                break;
            }
            if (item.subMenus) {
                for (const subItem of item.subMenus) {
                    if (subItem.to === currentPath) {
                        currentTitle = subItem.text;
                        break;
                    }
                }
            }
        }
        setTitle(currentTitle);
    }, [location.pathname]);

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
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <SideNav isOpen={isSideNavOpen} toggleSideNav={toggleSideNav} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header toggleSideNav={toggleSideNav} title={title} />
                <main className="p-4 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
