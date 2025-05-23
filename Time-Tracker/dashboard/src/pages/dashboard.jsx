import React, { useEffect } from 'react';

export default function Dashboard() {
	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_BASE_URL}/getData`)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((data) => {
				console.log('Dashboard received:', data);
			})
			.catch((err) => console.error('Dashboard fetch error:', err));
	}, []);

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Open your DevTools console to see the data.</p>
		</div>
	);
}
