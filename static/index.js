function startSearch() {
	const q = document.querySelector('#searchword').value.trim();
	if (!q) {
		return;
	} // Required is set, de biztos ami biztos

	// Waiting megjelenítése
	const wf = document.querySelector('#waitingfield');
	if (wf) {
		wf.hidden = false;
	}

	getResults();
}

// Autofókusz inputra
globalThis.addEventListener('DOMContentLoaded', () => {
	const input = document.querySelector('#searchword');
	if (input) {
		input.focus();
	}
});

function getResults() {
	document.querySelector('#results').innerHTML = '';
	fetch('/search?' + new URLSearchParams({
		searchword: document.querySelector('#searchword').value,
		order: document.querySelector('#order').value,
		minPrice: document.querySelector('#minPrice').value,
		maxPrice: document.querySelector('#maxPrice').value,
		size: document.querySelector('#size').value,
		count: document.querySelector('#count').value,
		hervis: document.querySelector('#hervis').checked,
		sinsay: document.querySelector('#sinsay').checked,
		sportisimo: document.querySelector('#sportisimo').checked,
		aboutYou: document.querySelector('#aboutYou').checked,
		decathlon: document.querySelector('#decathlon').checked,
		mangoOutlet: document.querySelector('#mangoOutlet').checked
	})).then(response => response.text())
		.then(text => {
			document.querySelector('#waitingfield').hidden = true;
			document.querySelector('#results').innerHTML = text;
		}).then(historyListeners).then(favouritesListeners);
}
