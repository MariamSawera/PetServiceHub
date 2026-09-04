import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/Auth/context/useAuth';

export default function UserRoute() {
  const { user } = useAuth();

  return user?.role === 'provider' ? <Navigate to="/provider/dashboard" replace /> : <Outlet />;
}