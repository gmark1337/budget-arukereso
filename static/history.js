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
	const res = await fetch('/history?' + new URLSearchParams({lang: lang}));
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
