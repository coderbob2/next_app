import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <SideNav />
      <main className="flex-1 p-6 overflow-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
