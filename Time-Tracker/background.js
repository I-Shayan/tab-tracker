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

// 1) Globals to track which domain we’re timing and when we started
// background.js

// 1. Globals to track the current domain and when we started timing it
let currentDomain = null;
let lastStart = Date.now();

// 2. Helper: commit the elapsed time for a domain into storage
function commitTime(domain) {
	if (!domain) return;
	const now = Date.now();
	const delta = now - lastStart;
	chrome.storage.local.get({ [domain]: 0 }, (result) => {
		const newTotal = result[domain] + delta;
		chrome.storage.local.set({ [domain]: newTotal });
	});
}

// 3. When the user switches to a different tab
chrome.tabs.onActivated.addListener(({ tabId }) => {
	commitTime(currentDomain);
	chrome.tabs.get(tabId, (tab) => {
		if (tab.url) {
			currentDomain = new URL(tab.url).hostname;
			lastStart = Date.now();
		}
	});
});

// 4. When a tab’s URL changes (in‐tab navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.url) {
		commitTime(currentDomain);
		currentDomain = new URL(changeInfo.url).hostname;
		lastStart = Date.now();
	}
});

// 5. Pause when user goes idle; resume when they return
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

// 6. In‐extension messaging: popup asks for live total
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

// 7. External messaging: hosted dashboard asks for full stats
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
	if (msg.action === 'getStats') {
		chrome.storage.local.get(null, sendResponse);
		return true;
	}
});

// 8. Bootstrap on load: start timing the currently active tab
chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
	if (tab && tab.url) {
		currentDomain = new URL(tab.url).hostname;
		lastStart = Date.now();
	}
});
