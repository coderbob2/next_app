import { Link, useLocation } from "react-router-dom";
import { useFrappeGetCall } from "frappe-react-sdk";

interface Page {
  name: string;
  title: string;
  parent_page: string;
  public: number;
  module: string;
  icon: string;
  label: string;
}

interface SidebarResponse {
    message: {
        pages: Page[];
    }
}

export default function SideNav() {
  const location = useLocation();
  const { data } = useFrappeGetCall<SidebarResponse>("frappe.desk.desktop.get_workspace_sidebar_items", {});

  const topLevelPages = data?.message.pages.filter(page => !page.parent_page) ?? [];

  return (
    <aside className="w-64 bg-gray-50 p-4 border-r">
      <nav className="space-y-2">
        {topLevelPages.map(page => (
          <Link
            key={page.name}
            to={`/${page.name.toLowerCase()}`}
            className={`block px-3 py-2 rounded ${location.pathname.startsWith(`/${page.name.toLowerCase()}`) ? "bg-gray-200" : ""}`}
          >
            {page.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
