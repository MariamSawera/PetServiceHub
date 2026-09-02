
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AppRoutes from './routes';

export default function App() {
  return (
    <>
      <Navbar />

      <AppRoutes />

      <Footer />
    </>
  );
}