// Register events for each item
function historyListeners() {
	for (const element of document.querySelectorAll('#product-details a.pd-btn.pd-btn-primary')) {
		element.addEventListener('click', () => {
            const src = document.querySelector('.pd-image-wrap img').src;
			const root = document.querySelector(`.item [src="${src}"]`).parentElement;
            const href = getUrlFromPathClass(root.querySelector('img'));
			const price = Number.parseInt(root.querySelector('.chip').innerText);
			fetch('/history', {
				method: 'POST',
				body: new URLSearchParams({
                    image: src,
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
