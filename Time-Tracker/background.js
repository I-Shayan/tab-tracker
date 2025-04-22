let startTime = null; // Track when the user starts on a tab
let currentTab = null; // Track the domain of the current tab
let timePerSite = {}; // Store time spent on each site

chrome.tabs.onActivated.addListener((activeInfo) => {
	// When a tab is activated, record the current time
	const tabID = activeInfo.tabId;

	// If there's already a tab and time has been tracked, calculate the time spent
	if (currentTab && startTime) {
		const timeSpent = Date.now() - startTime;

		// If the site already exists in the timePerSite object, add the time spent
		if (!timePerSite[currentTab]) {
			timePerSite[currentTab] = 0; // Initialize if not yet in the object
		}

		timePerSite[currentTab] += timeSpent; // Add the time spent on this site

		chrome.storage.local.set({ timePerSite: timePerSite });
		console.log(timePerSite); // Debugging: show the time per site
	}

	// Now set the start time for the newly activated tab
	startTime = Date.now();

	// Get the URL of the newly activated tab
	chrome.tabs.get(tabID, (tab) => {
		// Get the domain (hostname) from the tab's URL
		currentTab = new URL(tab.url).hostname; // For example, 'youtube.com'
		console.log('Switching to: ', currentTab); // Debugging: show the new site
	});
});

//extra

function convertTime(milliseconds) {
	let minutes = Math.floor(milliseconds / 60000); // Get whole minutes
	let seconds = Math.floor((milliseconds % 60000) / 1000); // Get remaining seconds
	return `${minutes} minutes and ${seconds} seconds`; // Output: "2 minutes and 30 seconds"
}
