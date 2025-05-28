import React from 'react';

export default function GetDataButton() {
	const getData = () => {
		chrome.runtime.sendMessage(
			'plocjnchfpailbckijilllfeflfdadoj',
			{ action: 'getStats' },
			(resp) => console.log('Stats:', resp)
		);
	};
	return (
		<div>
			<button onClick={getData}>Get Data</button>
		</div>
	);
}
