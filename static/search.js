function startSearch() {
  const q = document.getElementById("searchword").value.trim();
  if (!q) return false; 

  // Alap validációk
  const minPriceEl = document.getElementById("minPrice");
  const maxPriceEl = document.getElementById("maxPrice");
  const sizeEl     = document.getElementById("size");
  const countEl    = document.getElementById("count");

  const minPrice = minPriceEl.value ? Number(minPriceEl.value) : null;
  const maxPrice = maxPriceEl.value ? Number(maxPriceEl.value) : null;

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    alert("Minimum price cannot be greater than maximum price.");
    minPriceEl.focus();
    return false; 
  }

  // Méret validáció 
  const sizeRaw = (sizeEl.value || "").trim().toUpperCase();
  if (sizeRaw) {
    const allowed = new Set(["S", "M", "L", "XL"]);
    // több méretet is megadhatsz vesszővel: "S,M"
    const sizes = sizeRaw.split(/\s*,\s*/).filter(Boolean);
    const invalid = sizes.filter(s => !allowed.has(s));
    if (invalid.length) {
      alert(`Invalid size: ${invalid.join(", ")}. Allowed: S, M, L, XL.`);
      sizeEl.focus();
      return false;
    }
    // Normalize back 
    sizeEl.value = sizes.join(",");
  }

  const count = Number(countEl.value);
  if (!Number.isFinite(count) || count < 1) {
    alert("Number of items per site must be 1 or greater.");
    countEl.focus();
    return false;
  }

  // legalább egy website
  const anySite =
    document.getElementById("hervis").checked ||
    document.getElementById("sinsay").checked ||
    document.getElementById("sportissimo").checked;

  if (!anySite) {
    alert("Please select at least one website.");
    return false;
  }

  // UI állapot
  document.getElementById("searchfield").style.display = "none";
  document.getElementById("waitingfield").hidden = false;

  
  return true;
}
