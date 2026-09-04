import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/Auth/context/useAuth';

export default function ProviderRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading your account...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'provider' ? <Outlet /> : <Navigate to="/" replace />;
}