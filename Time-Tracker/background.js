// let currentTab = null;
// let startTime = null; // Track when the user starts on a tab
// let timePerSite = {}; // Store time spent on each site
// let timerInterval = null; // Timer interval for counting elapsed time
// let windowActive = true;
// let userIsIdle = true;

// chrome.windows.onFocusChanged.addListener((windowID) => {
// 	if (windowID === chrome.windows.WINDOW_ID_NONE) {
// 		windowActive = false;
// 		console.log('Timer is stopped, tab out of focus');
// 	} else {
// 		windowActive = true;
// 	}
// });

// chrome.tabs.onActivated.addListener((activeInfo) => {
// 	const tabID = activeInfo.tabId;

// 	if (currentTab && startTime) {
// 		const timeSpent = Date.now() - startTime;
// 		if (!timePerSite[currentTab]) {
// 			timePerSite[currentTab] = 0;
// 		}
// 		timePerSite[currentTab] += timeSpent;
// 		chrome.storage.local.set({ timePerSite: timePerSite });
// 	}

// 	// Get the URL of the newly activated tab
// 	chrome.tabs.get(tabID, (tab) => {
// 		const newTab = new URL(tab.url).hostname;
// 		currentTab = newTab;
// 		startTime = Date.now(); // Reset start time for the new tab
// 		// Start the timer for the new tab
// 	});
// });
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// 	if (message.action === 'resetMemory') {
// 		timePerSite = {}; // clear in-memory object
// 	}
// });

// let elapsedTime = 0; // Time in seconds
// let timer = null; // This will hold the timer reference

// // Function to update elapsed time every second and store it in local storage
// function updateTimer() {
// 	elapsedTime++; // Increment the time every second
// 	chrome.storage.local.set({ elapsedTime }); // Store the updated time in local storage
// }

// // Listen for when the extension starts up
// chrome.runtime.onStartup.addListener(() => {
// 	chrome.storage.local.get('elapsedTime', (result) => {
// 		if (result.elapsedTime) {
// 			elapsedTime = result.elapsedTime; // If there was a stored time, continue from there
// 		}
// 	});
// });

// // Start the timer
// chrome.runtime.onConnect.addListener((port) => {
// 	port.onMessage.addListener((msg) => {
// 		if (msg.action === 'startTimer') {
// 			if (!timer) {
// 				// Start updating the time every second
// 				timer = setInterval(updateTimer, 1000);
// 			}
// 		} else if (msg.action === 'stopTimer') {
// 			// Stop the timer
// 			clearInterval(timer);
// 			timer = null;
// 		}
// 	});
// });

// // Stop timer when the extension is uninstalled or stopped (cleanup)
// chrome.runtime.onSuspend.addListener(() => {
// 	clearInterval(timer);
// });

// background.js

let currentDomain = null;
let lastStart = Date.now();

//Calculate the time spent on the website and store it in local storage
function commitTime(domain) {
	if (!domain) return;
	const now = Date.now();
	const delta = now - lastStart;

	// 1) update chrome.storage.local as before
	chrome.storage.local.get({ [domain]: 0 }, (result) => {
		const newTotal = result[domain] + delta;
		chrome.storage.local.set({ [domain]: newTotal });
	});

	// 2) send to Netlify function
	fetch('http://localhost:8888/.netlify/functions/saveData', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ domain, time: delta }),
	})
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		})
		.then((json) => console.log('Extension: saved to server', json))
		.catch((err) => console.error('Extension: save error', err));

	// reset timer
	lastStart = now;
}

//when user switches tab, stop timing prev site and start timing new site, get domain and
// set current domain to new domain
chrome.tabs.onActivated.addListener(({ tabId }) => {
	commitTime(currentDomain);
	chrome.tabs.get(tabId, (tab) => {
		if (tab.url) {
			currentDomain = new URL(tab.url).hostname;
			lastStart = Date.now();
		}
	});
});
//when user changes URL, stop timing prev one adn start timing new one and
// change current domain to new domain
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.url) {
		commitTime(currentDomain);
		currentDomain = new URL(changeInfo.url).hostname;
		lastStart = Date.now();
	}
});
//if user state is not active, stop timing and current domain = null
//if not then resume tracking adn get the URL/lastwindow
chrome.idle.onStateChanged.addListener((state) => {
	if (state !== 'active') {
		commitTime(currentDomain);
		currentDomain = null;
	} else {
		chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
			if (tab && tab.url) {
				currentDomain = new URL(tab.url).hostname;
				lastStart = Date.now();
			}
		});
	}
});

//data req to get livetotal from popupJS
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.action === 'getLiveTotal' && msg.domain) {
		chrome.storage.local.get(msg.domain, (data) => {
			const stored = data[msg.domain] || 0;
			const delta = currentDomain === msg.domain ? Date.now() - lastStart : 0;
			sendResponse({ total: stored + delta });
		});
		return true; // keep channel open for async sendResponse
	}
});
//data req from external website (dashboard)
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
	if (msg.action === 'getStats') {
		chrome.storage.local.get(null, (allData) => {
			sendResponse(allData);
		});
		return true;
	}
});

chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
	if (tab && tab.url) {
		currentDomain = new URL(tab.url).hostname;
		lastStart = Date.now();
	}
});
