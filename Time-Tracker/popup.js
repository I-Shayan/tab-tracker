let ul = document.createElement('ul');
ul.classList.add('times');
const div = document.getElementById('time_list');

chrome.storage.local.get(['timePerSite'], (result) => {
	const savedData = result.timePerSite || {};
	for (let data in savedData) {
		const li = document.createElement('li');

		const span = document.createElement('span');
		span.classList.add('text');

		// const img = document.createElement('img');
		// img.classList.add('url-icons');

		// img.src = getFaviconUrl(data);
		// img.width = 16;
		const timeConverted = convertTime(savedData[data]);
		const urlClean = cleanLink(data);
		span.textContent = `${urlClean} : ${timeConverted}`;
		// li.appendChild(img);
		li.appendChild(span);
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

function getFaviconUrl(url) {
	try {
		if (!url.startsWith('http')) {
			url = 'https://' + url;
		}
		const domain = new URL(url).hostname;
		return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
	} catch (e) {
		console.warn('Invalid URL:', url);
		return 'default-icon.png';
	}
}

function cleanLink(url) {
	// Remove 'www.' from the beginning if it exists
	url = url.replace(/^www\./, '');

	// Remove '.com' and '.org' from the end if they exist
	url = url.replace(/\.(com|org)$/, '');

	return url;
}
