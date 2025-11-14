// Register events for each item
function historyListeners() {
	for (const element of document.querySelectorAll('#product-details img')) {
		element.addEventListener('click', () => {
			const root = document.querySelector(`.item [src="${element.src}"]`)
				.parentElement;
			const image = element.src;
			const href = getUrlFromPathClass(root.querySelector('img'));
			const price = Number.parseInt(root.querySelector('.chip').innerText);
			console.log(image, href, price);
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
	const res = await fetch('/history?' + new URLSearchParams({lang}));
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
