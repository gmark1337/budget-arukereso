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
		}).then(historyListeners).then(favouritesListeners);
}

function favouritesListeners() {
	for (const b of document.querySelectorAll('button.favourite-add')) {
		b.addEventListener('click', () => {
			if (b.classList.contains('favourited')) {
				removeFromFavourites(b);
			} else {
				addTofavourites(b);
			}
		});
	}
}

async function addTofavourites(b) {
	b.classList.add('favourited');
	const root = b.parentElement.parentElement;
	const vendor = root.parentElement.parentElement
		.querySelector('legend').innerText;
	const {href} = root.querySelector('a');
	const image = root.querySelector('img').src;
	const price = Number.parseInt(root.querySelector('span.chip').innerText);
	await fetch('/favourites', {
		method: 'POST',
		body: new URLSearchParams({
			vendor,
			href,
			image,
			price,
		}),
	});
	const idClass = await getNewItemId(image);
	b.classList.add(`id-${idClass}`);
}

async function getNewItemId(image) {
	const res = await fetch('/favourites?' + new URLSearchParams({id: image}));
	const text = await res.text();
	return JSON.parse(text).id || '';
}

async function removeFromFavourites(b) {
	b.classList.remove('favourited');
	for (const c of b.classList) {
		if (c.startsWith('id-')) {
			const id = c.split('id-')[1];
			await fetch(`/favourites/${id}`, {
				method: 'DELETE',
			});
		}
	}
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

updateHistory();

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

// Needed when not logged in user is viewing the page
if (document.querySelector('.favourites-bar')) {
	document.querySelector('.favourites-bar').addEventListener('mouseenter', async () => {
		const favourites = document.querySelector('#favourites');
		await updateFavourites(favourites);
		registerFavouriteRemoveButtons();
		favourites.style.display = 'block';
	});

	document.querySelector('.favourites-bar').addEventListener('mouseleave', async () => {
		const favourites = document.querySelector('#favourites');
		favourites.style.display = 'none';
	});
}

async function updateFavourites(favourites) {
	const res = await fetch('http://localhost:8080/favourites');
	favourites.innerHTML = await res.text();
}

function registerFavouriteRemoveButtons() {
	for (const b of document.querySelectorAll('.remove-favourites')) {
		b.addEventListener('click', async () => {
			let id = '';
			for (const c of b.classList) {
				if (c.startsWith('id-')) {
					id = c;
					break;
				}
			}

			await removeFromFavourites(b);
			updateHistory(document.querySelector('#favourites'));
			registerFavouriteRemoveButtons();
			document.querySelector(`.${id}`).classList.remove('favourited');
		});
	}
}
