import React from 'react';
import {
	ResponsiveContainer,
	BarChart,
	XAxis,
	YAxis,
	Tooltip,
	Bar,
} from 'recharts';

export default function Chart({ data }) {
	return (
		<ResponsiveContainer width="100%" height={400}>
			<BarChart
				data={data}
				margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
			>
				<XAxis
					dataKey="name"
					tick={{ fontSize: 12 }}
					interval={0}
					angle={-45}
					textAnchor="end"
				/>
				<YAxis
					label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
				/>
				<Tooltip formatter={(val) => `${val} min`} />
				<Bar dataKey="minutes" fill="#8884d8" />
			</BarChart>
		</ResponsiveContainer>
	);
}
