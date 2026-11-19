import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/Auth/context/useAuth';

export default function UserRoute() {
  const { user } = useAuth();

  if (user?.tenantRole === 'provider' || user?.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
  if (user?.tenantRole === 'tenant_admin' || user?.role === 'admin' || user?.role === 'tenant_admin') return <Navigate to="/admin" replace />;
  if (user?.isPlatformAdmin || user?.role === 'platform_admin') return <Navigate to="/platform-admin" replace />;
  return <Outlet />;
}