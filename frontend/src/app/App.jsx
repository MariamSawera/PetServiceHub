
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AppRoutes from './routes';

export default function App() {
  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-[1400px]">
        <AppRoutes />
      </div>

      <Footer />
    </>
  );
}