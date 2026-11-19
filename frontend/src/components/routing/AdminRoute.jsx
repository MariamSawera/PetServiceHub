import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/Auth/context/useAuth';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading admin account...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  return user.tenantRole === 'tenant_admin' || user.role === 'tenant_admin'
    ? <Outlet />
    : <Navigate to="/" replace />;
}
