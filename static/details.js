function detailsListeners() {
	for (const e of document.querySelectorAll('div.item img')) {
		e.addEventListener('click', async () => {
			const url = getUrlFromPathClass(e);
			const r = await fetch('/details?' + new URLSearchParams({
				url,
			}));
			const d = JSON.parse(await r.text());
			const product = document.querySelector('#product-details');
			product.innerHTML = '';
			const img = document.createElement('img');
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.target = '_blank';
			img.src = e.src;
			anchor.append(img);
			product.append(anchor);
			populateDetailsWindow(d, product);
			// Add close button
			const btn = document.createElement('button');
			btn.id = 'product-close';
			btn.innerText = '🗙';
			btn.addEventListener('click', () => {
				product.style.display = 'none';
			});
			product.append(btn);
			product.style.display = 'block';
			historyListeners();
		});
	}
}

function getUrlFromPathClass(e) {
	for (const c of e.classList) {
		if (c.startsWith('path-')) {
			return c.split('path-')[1];
		}
	}
}

function populateDetailsWindow(d, product) {
	for (const k of Object.keys(d)) {
		if (d[k] == 'Failed to find any details for this part') {
			// Skip empty fields
			continue;
		}

		const e = document.createElement('div');
		e.id = k;
		switch (k) {
			case 'originalPrice': {
				e.innerText = `${d[k].replaceAll(/\D/g, '')} Ft`;
				break;
			}

			case 'discountPrice': {
				e.innerText = `${d[k].replaceAll(/\D/g, '')} Ft`;
				break;
			}

			default: {
				e.innerText = d[k];
				break;
			}
		}

		product.append(e);
	}
}
