let ul = document.createElement('ul');
let li = document.createElement('li');

chrome.storage.local.get(['timePerSite'], (result) => {
	const savedData = result.timePerSite || {};
	for (let data in savedData) {
		li.innerText = `${data}:{saveData[data]}`;
		li.appendChild('ul');
	}
	// Now you can use savedData
});
