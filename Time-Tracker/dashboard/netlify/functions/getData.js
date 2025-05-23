import { handler as saveData } from './saveData.js';

export async function handler(event) {
	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 204,
			headers: { 'Access-Control-Allow-Origin': '*' },
		};
	}
	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			headers: { 'Access-Control-Allow-Origin': '*' },
			body: `Method ${event.httpMethod} Not Allowed`,
		};
	}
	const store = saveData.store;
	return {
		statusCode: 200,
		headers: { 'Access-Control-Allow-Origin': '*' },
		body: JSON.stringify(store),
	};
}
