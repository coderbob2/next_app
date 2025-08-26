import React from 'react';

interface HeaderProps {
  toggleSideNav: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSideNav }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center">
      <button onClick={toggleSideNav} className="text-gray-500 focus:outline-none md:hidden">
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
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>
      <h1 className="text-xl font-semibold ml-4">Dashboard</h1>
    </header>
  );
};

export default Header;
