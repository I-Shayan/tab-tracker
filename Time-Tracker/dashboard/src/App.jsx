import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import './App.css';

// Your extension’s ID
const EXT_ID = 'plocjnchfpailbckijilllfeflfdadoj';

export default function App() {
	// Holds [{ name: domain, minutes: x.x }, …]
	const [data, setData] = useState([]);

	useEffect(() => {
		// Only attempt messaging if the Chrome extension API is present
		if (
			typeof chrome !== 'undefined' &&
			chrome.runtime &&
			chrome.runtime.sendMessage
		) {
			chrome.runtime.sendMessage(EXT_ID, { action: 'getStats' }, (res) => {
				// Bail out on runtime error or empty response
				if (chrome.runtime.lastError || !res) return;

				// Convert { domain: ms, … } → [{ name, minutes }, …]
				const arr = Object.entries(res).map(([domain, ms]) => ({
					name: domain,
					minutes: +(ms / 60000).toFixed(1),
				}));
				setData(arr);
			});
		} else {
			// Optional: provide mock data or leave data empty
			console.warn(
				'Chrome runtime API not available — running outside extension'
			);
		}
	}, []);

	return (
		<div className="App">
			<h1>Time Spent by Site</h1>
			{data.length > 0 ? <Chart data={data} /> : <p>Loading data…</p>}
		</div>
	);
}
