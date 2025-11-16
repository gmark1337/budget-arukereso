// reviews.js

document.querySelector('.reviews-bar')?.addEventListener('click', () => {
  updateReviews();
});

async function updateReviews() {
  try {
    const container = document.querySelector('#reviews');
    if (!container) return;

    const res = await fetch('/reviews?' + new URLSearchParams({ lang }), {
      credentials: 'same-origin'
    });
    const html = await res.text();

    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();

    const inner = tmp.querySelector('#reviews');
    container.innerHTML = inner ? inner.innerHTML : html;

    container.style.display = 'block';
    container.classList.add('open');

    registerCancelButton();
    registerSendButton();
  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}

function registerCancelButton() {
  const btn = document.querySelector('#review-cancel');
  if (!btn) return;

  const clone = btn.cloneNode(true);
  btn.replaceWith(clone);

  clone.addEventListener('click', () => {
    const r = document.querySelector('#reviews');
    if (r) {
      r.style.display = 'none';
      r.classList.remove('open');
      r.innerHTML = ''; // overlay teljesen üres -> semmit nem blokkol
    }
  });
}

function registerSendButton() {
  const btn = document.querySelector('#review-send');
  if (!btn) return;

  const clone = btn.cloneNode(true);
  btn.replaceWith(clone);

  clone.addEventListener('click', async () => {
    const vendor  = document.querySelector('#review-vendor')?.value || '';
    const content = document.querySelector('#review-text')?.value?.trim() || '';
    const quality = document.querySelector('#review-quality')?.value || '3';

    if (!content) return;

    try {
      await fetch('/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams({ vendor, content, quality, lang })
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
    if (r && r.style.display !== 'none') {
      r.style.display = 'none';
      r.classList.remove('open');
      r.innerHTML = '';
    }
  }
});
