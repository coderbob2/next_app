import { createRoot } from 'react-dom/client'
import './index.css'
import { FrappeProvider } from 'frappe-react-sdk';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { Toaster } from 'sonner'
import App from './App.tsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import GenericLandingPage from './pages/GenericLandingPage.tsx';
import { menuItems } from './components/layouts/menuItems.tsx';
import CustomersPage from './pages/CustomersPage.tsx';
import SuppliersPage from './pages/SuppliersPage.tsx';
import BuyingPage from './pages/BuyingPage.tsx';
import SellingPage from './pages/SellingPage.tsx';
import ItemsPage from './pages/ItemsPage.tsx';
import StockBalancePage from './pages/StockBalancePage.tsx';
import PurchasesPage from './pages/PurchasesPage.tsx';
import PurchaseInvoiceDetailsPage from './pages/PurchaseInvoiceDetailsPage.tsx';
import PurchaseInvoiceAddPage from './pages/PurchaseInvoiceAddPage.tsx';
import SalesInvoicesPage from './pages/SalesInvoicesPage.tsx';
import SalesInvoiceDetailsPage from './pages/SalesInvoiceDetailsPage.tsx';
import SalesInvoiceAddPage from './pages/SalesInvoiceAddPage.tsx';
import CustomerReceiptsPage from "./pages/CustomerReceiptsPage.tsx";
import SupplierPaymentsPage from "./pages/SupplierPaymentsPage.tsx";
import PaymentEntryDetailsPage from './pages/PaymentEntryDetailsPage.tsx';
import PointOfSalePage from './pages/PointOfSalePage.tsx';
import VendorBalancePage from './pages/VendorBalancePage.tsx';
import CustomerBalancePage from './pages/CustomerBalancePage.tsx';
import StockLedgerPage from './pages/StockLedgerPage.tsx';
import CustomerLedgerPage from './pages/CustomerLedgerPage.tsx';
import StockTransferPage from "./pages/StockTransferPage";
import StockAdjustmentPage from "./pages/StockAdjustmentPage";
import Dashboard from './pages/Dashboard';
import CustomExchangeRatePage from './pages/CustomExchangeRatePage';
import WarehousesPage from './pages/WarehousesPage';
import type { JSX } from 'react';

const queryClient = new QueryClient();


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
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/customers",
        element: <CustomersPage />,
      },
      {
        path: "/suppliers",
        element: <SuppliersPage />,
      },
      {
        path: "/buying",
        element: <BuyingPage />,
      },
      {
        path: "/selling",
        element: <SellingPage />,
      },
      {
        path: "/stock",
        element: <GenericLandingPage />,
      },
      {
        path: "/items",
        element: <ItemsPage />,
      },
      {
        path: "/stock-balance",
        element: <StockBalancePage />,
      },
      {
        path: "/stock-ledger",
        element: <StockLedgerPage />,
      },
      {
        path: "/stock-transfer",
        element: <StockTransferPage />,
      },
      {
        path: "/stock-adjustment",
        element: <StockAdjustmentPage />,
      },
      {
        path: "/customer-ledger",
        element: <CustomerLedgerPage />,
      },
      {
        path: "/purchases",
        element: <PurchasesPage />,
      },
      {
        path: "/purchases/new",
        element: <PurchaseInvoiceAddPage />,
      },
      {
        path: "/purchases/:name",
        element: <PurchaseInvoiceDetailsPage />,
      },
      {
        path: "/sales",
        element: <SalesInvoicesPage />,
      },
      {
        path: "/sales/new",
        element: <SalesInvoiceAddPage />,
      },
      {
        path: "/sales/:name",
        element: <SalesInvoiceDetailsPage />,
      },
      {
        path: "/customer-receipts",
        element: <CustomerReceiptsPage />,
      },
      {
        path: "/supplier-payments",
        element: <SupplierPaymentsPage />,
      },
      {
        path: "/payment-entry/:name",
        element: <PaymentEntryDetailsPage />,
      },
      {
        path: "/pos",
        element: <PointOfSalePage />,
      },
      {
        path: "/payments",
        element: <GenericLandingPage />,
      },
      ...menuItems.reduce((acc, item) => {
        if (item.subMenus) {
          acc.push(...item.subMenus.map(subItem => {
            if (subItem.to === '/vendor-balance') {
              return {
                path: subItem.to,
                element: <VendorBalancePage />,
              }
            } else if (subItem.to === '/customer-balances') {
              return {
                path: subItem.to,
                element: <CustomerBalancePage />,
              }
            }
            if (subItem.to === '/exchange-rate') {
              return {
                path: subItem.to,
                element: <CustomExchangeRatePage />,
              }
            }
            if (subItem.to === '/warehouses') {
              return {
                path: subItem.to,
                element: <WarehousesPage />,
              }
            }
            return {
              path: subItem.to,
              element: <GenericLandingPage />,
            }
          }));
        } else if (item.to !== '/buying' && item.to !== '/selling' && item.to !== '/customers' && item.to !== '/payments' && item.to !== '/settings') {
          acc.push({
            path: item.to,
            element: <GenericLandingPage />,
          });
        }
        return acc;
      }, [] as { path: string; element: JSX.Element; }[]),
      {
        path: "/settings",
        element: <GenericLandingPage />,
      },
    ],
    errorElement: <div>Something went wrong is here</div>,
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
