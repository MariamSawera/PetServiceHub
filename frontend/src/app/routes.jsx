import { Route, Routes } from 'react-router-dom';

import AuthPage from '../features/Auth/pages/AuthPage';
import Home from '../features/Home/pages/Home';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import ProfilePage from '../features/Profile/pages/ProfilePage';
import PetDetailsPage from '../features/Pets/pages/PetDetailsPage';
import PetsPage from '../features/Pets/pages/PetsPage';

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<AuthPage />} />
			<Route path="/signup" element={<AuthPage />} />
			<Route element={<ProtectedRoute />}>
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/pets" element={<PetsPage />} />
				<Route path="/pets/:petId" element={<PetDetailsPage />} />
			</Route>
		</Routes>
	);
}
