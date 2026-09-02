import { Route, Routes } from 'react-router-dom';

import AuthPage from '../features/Auth/pages/AuthPage';
import Home from '../features/Home/pages/Home';

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<AuthPage />} />
			<Route path="/signup" element={<AuthPage />} />
		</Routes>
	);
}
