import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/Auth/context/useAuth';

export default function PlatformAdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading platform account...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  return user.isPlatformAdmin || user.role === 'platform_admin'
    ? <Outlet />
    : <Navigate to="/admin" replace />;
}
