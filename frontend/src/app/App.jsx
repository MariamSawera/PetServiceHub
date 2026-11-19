
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AppRoutes from './routes';
import { useLocation } from 'react-router-dom';

export default function App() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname === '/admin'
    || pathname.startsWith('/admin/')
    || pathname === '/platform-admin';

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <div className={isAdminRoute ? '' : 'mx-auto max-w-[1400px]'}>
        <AppRoutes />
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
}