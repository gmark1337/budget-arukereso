function startSearch() {
  const q = document.getElementById("searchword").value.trim();
  if (!q) return false; // required is set, de biztos ami biztos

  // disable submit gomb (UX)
  const btn = document.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '…';
  }

  // kereső elrejtése, waiting megjelenítése
  const sf = document.getElementById("searchfield");
  const wf = document.getElementById("waitingfield");
  if (sf) sf.style.display = "none";
  if (wf) wf.hidden = false;

  return true; // böngésző mehet tovább /results-ra
}

// Autofókusz inputra
window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchword');
  if (input) input.focus();
});
