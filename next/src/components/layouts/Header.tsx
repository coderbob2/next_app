import React from 'react';
import { useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk';
import { LogOut, User, Search, Settings, HelpCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface HeaderProps {
    toggleSideNav: () => void;
    title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSideNav, title }) => {
    const { logout, currentUser } = useFrappeAuth();
    const { data: userDetails } = useFrappeGetDoc('User', currentUser!, {
        enabled: !!currentUser,
    });

    return (
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
            {/* Left side: Menu + Title */}
            <div className="flex items-center">
                <button
                    onClick={toggleSideNav}
                    className="text-gray-500 focus:outline-none md:hidden"
                >
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
                <h1 className="text-lg font-semibold ml-4">{title}</h1>
            </div>

            {/* Right side: Search + Account */}
            <div className="flex items-center space-x-6">
                {/* Search */}
                <div className="relative hidden md:block w-68">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <Input
                        className="pl-9 pr-3 py-1 h-8 rounded-full border border-gray-200 focus:border-gray-400 text-sm"
                        placeholder="Search..."
                    />
                </div>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                        <span className="text-gray-800 font-medium hidden md:block">{userDetails?.first_name}</span>
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                            <User size={20} className="text-gray-600" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Help</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-red-500">Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
