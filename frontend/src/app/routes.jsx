import { Route, Routes } from 'react-router-dom';

import AuthPage from '../features/Auth/pages/AuthPage';
import Home from '../features/Home/pages/Home';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import ProfilePage from '../features/Profile/pages/ProfilePage';
import PetDetailsPage from '../features/Pets/pages/PetDetailsPage';
import PetsPage from '../features/Pets/pages/PetsPage';
import FindVetsPage from '../features/Clinics/pages/FindVetsPage';
import ClinicDetailsPage from '../features/Clinics/pages/ClinicDetailsPage';
import ProviderDashboard from '../features/Clinics/pages/ProviderDashboard';
import ProviderRoute from '../components/routing/ProviderRoute';
import UserRoute from '../components/routing/UserRoute';
import BookingPage from '../features/Appointments/pages/BookingPage';
import BookingConfirmationPage from '../features/Appointments/pages/BookingConfirmationPage';
import ProviderAppointmentsPage from '../features/Appointments/pages/ProviderAppointmentsPage';
import AppointmentsPage from '../features/Appointments/pages/AppointmentsPage';

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<AuthPage />} />
			<Route path="/signup" element={<AuthPage />} />
			<Route path="/find-vets" element={<FindVetsPage />} />
			<Route path="/find-vets/:clinicId" element={<ClinicDetailsPage />} />
			<Route element={<ProtectedRoute />}>
				<Route path="/profile" element={<ProfilePage />} />
				<Route element={<ProviderRoute />}>
					<Route path="/provider/dashboard" element={<ProviderDashboard />} />
					<Route path="/provider/appointments" element={<ProviderAppointmentsPage />} />
				</Route>
				<Route element={<UserRoute />}>
					<Route path="/pets" element={<PetsPage />} />
					<Route path="/pets/:petId" element={<PetDetailsPage />} />
					<Route path="/appointments/new/:clinicId" element={<BookingPage />} />
					<Route path="/appointments/:appointmentId/confirmation" element={<BookingConfirmationPage />} />
					<Route path="/appointments" element={<AppointmentsPage />} />
				</Route>
			</Route>
		</Routes>
	);
}
