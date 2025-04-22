let ul = document.createElement('ul');
ul.classList.add('times');
const div = document.getElementById('time_list');

chrome.storage.local.get(['timePerSite'], (result) => {
	const savedData = result.timePerSite || {};
	for (let data in savedData) {
		let li = document.createElement('li');
		const timeConverted = convertTime(savedData[data]);
		li.innerText = `${data} : ${timeConverted}`;
		ul.appendChild(li);
	}
	div.appendChild(ul);
	// Now you can use savedData
});

function convertTime(milliseconds) {
	let minutes = Math.floor(milliseconds / 60000); // Get whole minutes
	let seconds = Math.floor((milliseconds % 60000) / 1000); // Get remaining seconds
	return `${minutes} minutes and ${seconds} seconds`; // Output: "2 minutes and 30 seconds"
}
