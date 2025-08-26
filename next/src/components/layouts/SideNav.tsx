import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuItems } from './menuItems';
import { useFrappeGetCall } from 'frappe-react-sdk';

interface SideNavProps {
  isOpen: boolean;
  toggleSideNav: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen, toggleSideNav }) => {
  const [companyName, setCompanyName] = useState<string>('');
  const { data: companyData, error } = useFrappeGetCall('next_app.next_app.utils.get_company_name', {}, 'get_company_name');

  useEffect(() => {
    if (companyData) {
      setCompanyName(companyData.message);
    }
  }, [companyData]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black opacity-40 z-30 md:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSideNav}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white p-4 z-40 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 min-w-64`}
      >
        <div className="flex flex-col items-center mb-8 pt-4">
          <img src="/src/assets/next_logo.png" alt="Logo" className="h-16 w-16 mb-4" />
          <div className="text-xl font-bold">{companyName || 'MyApp'}</div>
        </div>
        <div className="flex justify-between items-center mb-8">
          <button onClick={toggleSideNav} className="text-white md:hidden">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <nav>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="mb-4">
                <Link
                  to={item.to}
                  className="flex items-center hover:text-gray-300"
                  onClick={toggleSideNav}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SideNav;
