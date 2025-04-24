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

	if (currentTab && startTime && windowActive) {
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
