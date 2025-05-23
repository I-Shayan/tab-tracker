import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* When the user visits "/", render Dashboard */}
				<Route path="/" element={<Dashboard />} />
			</Routes>
		</BrowserRouter>
	);
}
