import { createRoot } from 'react-dom/client'
import './index.css'
import { FrappeProvider } from 'frappe-react-sdk';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import { Toaster } from 'sonner'
import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import GenericPage from "./pages/GenericPage.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import WorkspacePage from './pages/WorkspacePage.tsx';
import { useParams } from 'react-router-dom';

const queryClient = new QueryClient();

const GenericPageWrapper = () => {
  const { doctype_name } = useParams();
  return <GenericPage doctype={doctype_name!} />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/doctype/:doctype_name",
        element: <GenericPageWrapper />,
      },
      {
        path: "/:page_name",
        element: <WorkspacePage />
      }
    ],
    errorElement: <div>Something went wrong</div>,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
], {basename: import.meta.env.VITE_BASE_PATH});

const getSiteName = () => {
  // @ts-ignore
  if (window.frappe?.boot?.versions?.frappe && (window.frappe.boot.versions.frappe.startsWith('15') || window.frappe.boot.versions.frappe.startsWith('16'))) {
    // @ts-ignore
    return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
  }
  return import.meta.env.VITE_SITE_NAME
}

createRoot(document.getElementById('root')!).render(
  <FrappeProvider
    socketPort={import.meta.env.VITE_SOCKET_PORT}
    siteName={getSiteName()}
  >
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </FrappeProvider>
);
