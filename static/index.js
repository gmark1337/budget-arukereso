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
	})).then(response => response.text())
		.then(text => {
			document.querySelector('#waitingfield').hidden = true;
			document.querySelector('#results').innerHTML = text;
		}).then(historyListeners);
}

// Register events for each item
function historyListeners() {
	for (const element of document.querySelectorAll('.item img')) {
		element.addEventListener('click', e => {
			const root = e.target.parentElement.parentElement;
			const image = root.querySelector('img').src;
			const {href} = root.querySelector('a');
			const price = Number.parseInt(root.querySelector('.chip').innerText);
			fetch('/history', {
				method: 'POST',
				body: new URLSearchParams({
					image,
					href,
					price,
				}),
			}).then(updateHistory);
		});
	}
}

async function updateHistory() {
	const e = document.querySelector('#history');
	const res = await fetch('/history');
	e.innerHTML = await res.text();
	registerButtons();
}

function registerButtons() {
	for (const element of document.querySelectorAll('button.remove-history-item')) {
		element.addEventListener('click', e => {
			for (const c of e.target.classList) {
				if (c.startsWith('id-')) {
					const id = c.split('id-')[1];
					fetch(`/history/${id}`, {
						method: 'DELETE',
					}).then(updateHistory);
				}
			}
		});
	}
}

updateHistory();
