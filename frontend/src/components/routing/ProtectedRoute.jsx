import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/Auth/context/useAuth';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading your account...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
