// reviews.js — slideres (range) score-ral

document.querySelector('.reviews-bar')?.addEventListener('click', () => {
  updateReviews();
});

async function updateReviews() {
  try {
    const container = document.querySelector('#reviews');
    const res = await fetch('/reviews', { credentials: 'same-origin' });
    container.innerHTML = await res.text();
    container.style.display = 'block';
    registerToolbar();
  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}

function registerToolbar() {
  registerCancelButton();
  registerSendButton();
}

function registerCancelButton() {
  const btn = document.querySelector('#review-cancel');
  if (!btn) return;

  btn.replaceWith(btn.cloneNode(true));
  document.querySelector('#review-cancel')
    .addEventListener('click', () => {
      const r = document.querySelector('#reviews');
      if (r) r.style.display = 'none';
    });
}

function registerSendButton() {
  const btn = document.querySelector('#review-send');
  if (!btn) return;

  btn.replaceWith(btn.cloneNode(true));
  document.querySelector('#review-send')
    .addEventListener('click', async () => {
      const vendor  = document.querySelector('#review-vendor')?.value || '';
      const content = document.querySelector('#review-text')?.value?.trim() || '';
      const quality = document.querySelector('#review-quality')?.value || '3';
      if (!content) return;

      try {
        await fetch('/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams({ vendor, content, quality })
        });
        updateReviews();
      } catch (err) {
        console.error('Failed to submit review:', err);
      }
    });
}

// ESC bezár
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const r = document.querySelector('#reviews');
    if (r && r.style.display !== 'none') r.style.display = 'none';
  }
});
