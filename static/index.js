// Biztonságos 'lang' forrás
var lang = window.lang || document.querySelector('select.language-bar')?.value || 'en';

function startSearch() {
  const q = document.querySelector('#searchword')?.value.trim();
  if (!q) return;

  const wf = document.querySelector('#waitingfield');
  if (wf) wf.hidden = false;

  getResults();
}

// ---- Debounce helper ----
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), delay);
  };
}
const debouncedGetResults = debounce(getResults, 300);

// Autofókusz + form submit
globalThis.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('#searchword');
  if (input) input.focus();

  const form = document.querySelector('#searchbar');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      startSearch();
    });
  }

  // ---- Szűrők auto-frissítése ----
  const filterRoot = document.querySelector('#filters');
  if (filterRoot) {
    // változásra azonnali frissítés
    filterRoot.querySelectorAll('select, input[type="checkbox"], input[type="number"]').forEach(el => {
      el.addEventListener('change', debouncedGetResults);
    });
    // szöveges mezők (méret) gépelés közbeni debounce
    filterRoot.querySelectorAll('input[type="text"]').forEach(el => {
      el.addEventListener('input', debouncedGetResults);
    });
  }
});

function getResults() {
  const params = new URLSearchParams({
    searchword: document.querySelector('#searchword')?.value || '',
    order: document.querySelector('#order')?.value || 'asc',
    minPrice: document.querySelector('#minPrice')?.value || '',
    maxPrice: document.querySelector('#maxPrice')?.value || '',
    size: document.querySelector('#size')?.value || '',
    count: document.querySelector('#count')?.value || '3',
    hervis: document.querySelector('#hervis')?.checked ? 'true' : 'false',
    sinsay: document.querySelector('#sinsay')?.checked ? 'true' : 'false',
    sportisimo: document.querySelector('#sportisimo')?.checked ? 'true' : 'false',
    aboutYou: document.querySelector('#aboutYou')?.checked ? 'true' : 'false',
    decathlon: document.querySelector('#decathlon')?.checked ? 'true' : 'false',
    mangoOutlet: document.querySelector('#mangoOutlet')?.checked ? 'true' : 'false',
    lang: lang,
  });

  const resultsEl = document.querySelector('#results');
  if (resultsEl) resultsEl.innerHTML = '';

  fetch('/search?' + params.toString())
    .then(r => r.text())
    .then(html => {
      const wf = document.querySelector('#waitingfield');
      if (wf) wf.hidden = true;
      if (resultsEl) resultsEl.innerHTML = html;
    })
    .then(favouritesListeners)
    .then(detailsListeners)
    .catch(err => {
      console.error('Search failed:', err);
      const wf = document.querySelector('#waitingfield');
      if (wf) wf.hidden = true;
    });
}

// Nyelvváltó — null-safe
const langSel = document.querySelector('select.language-bar');
if (langSel) {
  langSel.addEventListener('change', (e) => {
    window.location.href = `?lang=${e.target.value}`;
  });
}
