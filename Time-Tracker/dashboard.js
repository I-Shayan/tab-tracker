document.addEventListener('DOMContentLoaded', () => {
	const ctx = document.getElementById('myChart');

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
			datasets: [
				{
					label: '# of Votes',
					data: [12, 19, 3, 5, 2, 3],
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});
});

document.querySelector('.getData').addEventListener('click', function () {
	let label = [];
	let time = [];

	chrome.storage.local.get(['timePerSite'], (result) => {
		const timePerSite = result.timePerSite || {};

		for (let site in timePerSite) {
			label.push(site);
			time.push(timePerSite[site]);
			console.log(`${label} : ${time}`);
		}
	});
});
