// chrome.storage.local.get(['timePerSite'], (result) => {
// 	const savedData = result.timePerSite || {};
// 	createItems(savedData);
// });

// const resetBTN = document
// 	.querySelector('.reset-btn')
// 	.addEventListener('click', function () {
// 		chrome.storage.local.clear(() => {
// 			alert('Your data has been reset');
// 			document.getElementById('time_list').innerHTML = '';
// 			chrome.runtime.sendMessage({ action: 'resetMemory' });
// 		});
// 	});

// document.getElementById('openDashboard').addEventListener('click', () => {
// 	const dashboardURL = chrome.runtime.getURL('dashboard.html');
// 	chrome.tabs.create({ url: dashboardURL });
// });

// // Also reset in-memory object in background script
// function createItems() {
// 	const div = document.getElementById('time_list');
// 	div.innerHTML = ''; // Clear previous content

// 	const ul = document.createElement('ul');
// 	ul.classList.add('times');

// 	const li = document.createElement('li');
// 	const span = document.createElement('span');
// 	liveTimer(span);
// 	span.classList.add('text');

// 	li.appendChild(span);
// 	ul.appendChild(li);
// 	div.appendChild(ul);
// }

// function convertTime(milliseconds) {
// 	let minutes = Math.floor(milliseconds / 60000); // Get whole minutes
// 	let seconds = Math.floor((milliseconds % 60000) / 1000); // Get remaining seconds
// 	return `${minutes} minutes and ${seconds} seconds`;
// }

// function cleanLink(url) {
// 	// Remove 'www.' from the beginning if it exists
// 	url = url.replace(/^www\./, '');

// 	// Remove '.com' and '.org' from the end if they exist
// 	url = url.replace(/\.(com|org)$/, '');
// 	return url;
// }

// function liveTimer(span) {
// 	let currentTab = '';
// 	let timeElapsed = 0;
// 	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// 		if (tabs[0]) {
// 			const newTab = new URL(tabs[0].url).hostname;
// 			// If the tab changed, reset timeElapsed to what's in storage
// 			if (newTab !== currentTab) {
// 				currentTab = newTab;
// 				chrome.storage.local.get('timePerSite', (data) => {
// 					const timePerSite = data.timePerSite || {};
// 					timeElapsed = timePerSite[currentTab] || 0;
// 					span.textContent = `${currentTab} : ${convertTime(timeElapsed)}`;
// 				});
// 			} else {
// 				span.textContent = `${cleanLink(currentTab)} : ${convertTime(
// 					timeElapsed
// 				)}`;
// 			}
// 		}
// 	});
// }

// let timerRunning = false;
// let updateTimerInterval = null; // Interval reference for checking time

// // Function to update the timer display
// function updateTimerDisplay(elapsedTime) {
// 	// Convert seconds to HH:MM:SS format
// 	const hours = Math.floor(elapsedTime / 3600)
// 		.toString()
// 		.padStart(2, '0');
// 	const minutes = Math.floor((elapsedTime % 3600) / 60)
// 		.toString()
// 		.padStart(2, '0');
// 	const seconds = (elapsedTime % 60).toString().padStart(2, '0');
// 	document.getElementById(
// 		'timerDisplay'
// 	).textContent = `${hours}:${minutes}:${seconds}`;
// }

// // Start button event listener
// document.getElementById('startBtn').addEventListener('click', () => {
// 	if (!timerRunning) {
// 		// Send a message to start the timer in the background script
// 		const port = chrome.runtime.connect();
// 		port.postMessage({ action: 'startTimer' });
// 		timerRunning = true;

// 		// Periodically check for updated time from storage
// 		updateTimerInterval = setInterval(() => {
// 			chrome.storage.local.get('elapsedTime', (result) => {
// 				if (result.elapsedTime !== undefined) {
// 					updateTimerDisplay(result.elapsedTime);
// 				}
// 			});
// 		}, 1000);
// 	}
// });

// // Display the current time when the popup opens (if time exists in storage)
// chrome.storage.local.get('elapsedTime', (result) => {
// 	if (result.elapsedTime) {
// 		updateTimerDisplay(result.elapsedTime);
// 	}
// });

// //check if popup js is fetching from local stoargae constantly, and background is uploading to
// //local stoarge constantly

// // Stop button event listener
// document.getElementById('stopBtn').addEventListener('click', () => {
// 	if (timerRunning) {
// 		// Stop the timer in the background
// 		const port = chrome.runtime.connect();
// 		port.postMessage({ action: 'stopTimer' });
// 		timerRunning = false;

// 		// Clear the timer update interval
// 		clearInterval(updateTimerInterval);
// 	}
// });
// popup.js

// Format ms → "HH:MM:SS"
function fmt(ms) {
	const totalSec = Math.floor(ms / 1000);
	const s = totalSec % 60;
	const m = Math.floor(totalSec / 60) % 60;
	const h = Math.floor(totalSec / 3600);
	return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
}

document.addEventListener('DOMContentLoaded', () => {
	const siteEl = document.getElementById('site-name');
	const timerEl = document.getElementById('timer');
	const btn = document.getElementById('openDashboard');

	// 1) Determine the current hostname
	chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
		const hostname = new URL(tab.url || '').hostname;
		siteEl.textContent = hostname;

		// 2) Poll the background for the live total every 500ms
		setInterval(() => {
			chrome.runtime.sendMessage(
				{ action: 'getLiveTotal', domain: hostname },
				(res) => {
					if (chrome.runtime.lastError) return;
					if (res && typeof res.total === 'number') {
						timerEl.textContent = fmt(res.total);
					}
				}
			);
		}, 500);
	});

	document.getElementById('openDashboard').addEventListener('click', () => {
		chrome.tabs.create({
			url: chrome.runtime.getURL('dashboard/index.html'),
		});
	});

	document.querySelector('.reset-btn').addEventListener('click', function () {
		chrome.storage.local.clear(() => {
			alert('Your data has been reset');
		});
	});
});
