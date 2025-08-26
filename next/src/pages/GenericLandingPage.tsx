import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { menuItems } from '@/components/layouts/menuItems';

const GenericLandingPage: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItem = menuItems.find(item => item.to === currentPath);

  if (!menuItem || !menuItem.subMenus) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{menuItem ? menuItem.text : 'Page Not Found'}</h1>
        <p>This page is under construction.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{menuItem.text}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItem.subMenus.map((menu, index) => (
          <Link to={menu.to} key={index}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{menu.text}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GenericLandingPage;
