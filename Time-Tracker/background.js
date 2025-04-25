let currentTab = null;
let startTime = null; // Track when the user starts on a tab
let timePerSite = {}; // Store time spent on each site
let timerInterval = null; // Timer interval for counting elapsed time
let windowActive = true;
let userIsIdle = true;

chrome.windows.onFocusChanged.addListener((windowID) => {
	if (windowID === chrome.windows.WINDOW_ID_NONE) {
		windowActive = false;
		console.log('Timer is stopped, tab out of focus');
	} else {
		windowActive = true;
	}
});

// chrome.idle.setDetectionInterval(120); //idle detection after 2 mins of no activity
// chrome.idle.onStateChanged.addListener((state) => {
// 	if (state === 'idle' || state === 'locked') {
// 		userIsIdle = true;
// 	} else {
// 		userIsIdle = false;
// 	}
// });

// Start tracking time when the user is on a site
chrome.tabs.onActivated.addListener((activeInfo) => {
	const tabID = activeInfo.tabId;

	if (currentTab && startTime) {
		const timeSpent = Date.now() - startTime;
		if (!timePerSite[currentTab]) {
			timePerSite[currentTab] = 0;
		}
		timePerSite[currentTab] += timeSpent;
		chrome.storage.local.set({ timePerSite: timePerSite });
	}

	// Get the URL of the newly activated tab
	chrome.tabs.get(tabID, (tab) => {
		const newTab = new URL(tab.url).hostname;
		currentTab = newTab;
		startTime = Date.now(); // Reset start time for the new tab
		// Start the timer for the new tab
	});
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'resetMemory') {
		timePerSite = {}; // clear in-memory object
	}
});

let elapsedTime = 0; // Time in seconds
let timer = null; // This will hold the timer reference

// Function to update elapsed time every second and store it in local storage
function updateTimer() {
	elapsedTime++; // Increment the time every second
	chrome.storage.local.set({ elapsedTime }); // Store the updated time in local storage
}

// Listen for when the extension starts up
chrome.runtime.onStartup.addListener(() => {
	chrome.storage.local.get('elapsedTime', (result) => {
		if (result.elapsedTime) {
			elapsedTime = result.elapsedTime; // If there was a stored time, continue from there
		}
	});
});

// Start the timer
chrome.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener((msg) => {
		if (msg.action === 'startTimer') {
			if (!timer) {
				// Start updating the time every second
				timer = setInterval(updateTimer, 1000);
			}
		} else if (msg.action === 'stopTimer') {
			// Stop the timer
			clearInterval(timer);
			timer = null;
		}
	});
});

// Stop timer when the extension is uninstalled or stopped (cleanup)
chrome.runtime.onSuspend.addListener(() => {
	clearInterval(timer);
});
