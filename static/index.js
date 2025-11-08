// index.js

// lang: a szerver már betöltötte (var lang = "..."), ha mégsem, fallback:
if (typeof lang === 'undefined' || !lang) {
  var lang = (document.querySelector('select.language-bar')?.value) || 'en';
}

// Nyelvváltás
document.querySelector('select.language-bar')?.addEventListener('change', (e) => {
  window.location.href = `?lang=${e.target.value}`;
});

// Indítás gombbal / Enterrel
function startSearch() {
  const input = document.querySelector('#searchword');
  if (!input) return;

  const q = input.value.trim();
  if (!q) return;

  const wf = document.querySelector('#waitingfield');
  if (wf) wf.hidden = false;

  getResults();
}

// Form submit (Enter) bekötés
document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('#searchword');
  if (input) input.focus();

  const form = document.querySelector('#searchbar');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      startSearch();
    });
  }
});

function getResults() {
  const results = document.querySelector('#results');
  if (!results) return;

  results.innerHTML = '';

  const params = new URLSearchParams({
    searchword: document.querySelector('#searchword')?.value || '',
    order: document.querySelector('#order')?.value || 'asc',
    minPrice: document.querySelector('#minPrice')?.value || '',
    maxPrice: document.querySelector('#maxPrice')?.value || '',
    size: document.querySelector('#size')?.value || '',
    count: document.querySelector('#count')?.value || '3',
    hervis: document.querySelector('#hervis')?.checked || false,
    sinsay: document.querySelector('#sinsay')?.checked || false,
    sportisimo: document.querySelector('#sportisimo')?.checked || false,
    aboutYou: document.querySelector('#aboutYou')?.checked || false,
    decathlon: document.querySelector('#decathlon')?.checked || false,
    mangoOutlet: document.querySelector('#mangoOutlet')?.checked || false,
    lang: lang,
  });

  fetch('/search?' + params.toString())
    .then(r => r.text())
    .then(html => {
      const wf = document.querySelector('#waitingfield');
      if (wf) wf.hidden = true;
      results.innerHTML = html;
    })
    .then(() => {
      historyListeners?.();
      favouritesListeners?.();
    })
    .then(favouritesListeners)
    .then(detailsListeners)
    .catch(err => {
      console.error('Search failed:', err);
      const wf = document.querySelector('#waitingfield');
      if (wf) wf.hidden = true;
    });
}
