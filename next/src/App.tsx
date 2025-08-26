import { useFrappeAuth } from 'frappe-react-sdk';
import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '@/components/ui/spinner';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Toaster } from '@/components/ui/sonner';
function App() {
  const { currentUser, isLoading } = useFrappeAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
      <Toaster />
    </DashboardLayout>
  );
}

export default App;
