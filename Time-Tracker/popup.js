chrome.storage.local.get(['timePerSite'], (result) => {
	const savedData = result.timePerSite || {};
	createItems(savedData);
});

const resetBTN = document
	.querySelector('.reset-btn')
	.addEventListener('click', function () {
		chrome.storage.local.clear(() => {
			alert('Your data has been reset');
			document.getElementById('time_list').innerHTML = '';
			chrome.runtime.sendMessage({ action: 'resetMemory' });
		});
	});

// Also reset in-memory object in background script
function createItems() {
	const div = document.getElementById('time_list');
	div.innerHTML = ''; // Clear previous content

	const ul = document.createElement('ul');
	ul.classList.add('times');

	const li = document.createElement('li');
	const span = document.createElement('span');
	liveTimer(span);
	span.classList.add('text');

	li.appendChild(span);
	ul.appendChild(li);
	div.appendChild(ul);
}

function convertTime(milliseconds) {
	let minutes = Math.floor(milliseconds / 60000); // Get whole minutes
	let seconds = Math.floor((milliseconds % 60000) / 1000); // Get remaining seconds
	return `${minutes} minutes and ${seconds} seconds`;
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

function liveTimer(span) {
	let currentTab = '';
	let timeElapsed = 0;
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]) {
			const newTab = new URL(tabs[0].url).hostname;
			// If the tab changed, reset timeElapsed to what's in storage
			if (newTab !== currentTab) {
				currentTab = newTab;
				chrome.storage.local.get('timePerSite', (data) => {
					const timePerSite = data.timePerSite || {};
					timeElapsed = timePerSite[currentTab] || 0;
					span.textContent = `${currentTab} : ${convertTime(timeElapsed)}`;
				});
			} else {
				span.textContent = `${cleanLink(currentTab)} : ${convertTime(
					timeElapsed
				)}`;
			}
		}
	});
	//make a live timer that shows the time spent on the current website
	//add a onfocus and a currentwindo
}
