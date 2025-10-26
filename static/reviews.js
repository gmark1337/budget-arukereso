document.querySelector('.reviews-bar').addEventListener('click', () => {
	updateReviews();
});

async function updateReviews() {
	const r = document.querySelector('#reviews');
	const res = await fetch('/reviews');
	r.innerHTML = await res.text();
	r.style.display = 'block';
	registerCancelButton();
	registerSendButton();
}

function registerCancelButton() {
	document.querySelector('#review-cancel').addEventListener('click', () => {
		document.querySelector('#reviews').style.display = 'none';
	});
}

function registerSendButton() {
	document.querySelector('#review-send').addEventListener('click', async () => {
		const vendor = document.querySelector('#review-vendor').value;
		const content = document.querySelector('#review-text').value;
		const quality = document.querySelector('#review-quality').value;
		if (!content) {
			return;
		}
		await fetch('/reviews', {
			method: 'POST',
			body: new URLSearchParams({
				vendor,
				content,
				quality,
			}),
		});
        updateReviews();
	});
}
