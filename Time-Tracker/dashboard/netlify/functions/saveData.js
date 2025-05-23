export async function handler(event) {
	let store = [];
	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 204,
			headers: { 'Access-Control-Allow-Origin': '*' },
		};
	}
	if (event.httpMethod !== 'POST') {
		//if req is NOT post reply with error
		return {
			statusCode: 405,
			headers: { 'Access-Control-Allow-Origin': '*' },
			body: `Method ${event.httpMethod} Not Allowed`,
		};
	}
	const { domain, time } = JSON.parse(event.body); //get the domain and time from the data
	store.push({ domain, time, timeStamp: Date.now() }); //store it in the array store for test
	return {
		statusCode: 200,
		headers: { 'Access-Control-Allow-Origin': '*' },
		body: JSON.stringify({ success: true }),
	};
}
