// details.js – modern részletek modal kedvencek gombbal

function detailsListeners() {
  for (const img of document.querySelectorAll('.item img')) {
    img.addEventListener('click', () => openDetailsModal(img));
  }
}

async function openDetailsModal(imgEl) {
  const url = getUrlFromPathClass(imgEl);
  if (!url) return;

  // vendor név a kártya legend-jéből
  const itemEl = imgEl.closest('.item');
  const vendor =
    itemEl?.closest('.result')?.querySelector('legend')?.innerText?.trim() ||
    '';

  // ugyanahhoz a termékhez tartozó kedvenc-gomb (ha van)
  const favBtn = itemEl?.querySelector('button.favourite-add') || null;

  let data = {};
  try {
    const r = await fetch(
      '/details?' + new URLSearchParams({ url }).toString()
    );
    data = JSON.parse(await r.text());
  } catch (err) {
    console.error('Failed to load details:', err);
  }

  renderDetailsModal({
    imgSrc: imgEl.src,
    url,
    vendor,
    favBtn,
    data,
  });

  // history loggolás (megmarad a régi viselkedés)
  if (typeof historyListeners === 'function') {
    historyListeners();
  }
}

function getUrlFromPathClass(e) {
  for (const c of e.classList) {
    if (c.startsWith('path-')) {
      return c.split('path-')[1];
    }
  }
  return '';
}

function renderDetailsModal({ imgSrc, url, vendor, favBtn, data }) {
  const overlay = document.querySelector('#product-details');
  if (!overlay) return;

  // adatok normalizálása
  const name = data.name || 'Product';
  const rawPrice = data.discountPrice || data.originalPrice || '';
  const cleanPrice = rawPrice.replace(/\D/g, '');
  const priceText = cleanPrice ? `${cleanPrice} Ft` : rawPrice || '';

  const color = data.color;
  const size = data.size;
  const material = data.material;
  const shipping = data.shipping;
  const otherInfo = data.otherInformation || data.description || '';

  const vendorLabel = vendor || 'Website';

  overlay.innerHTML = `
    <div class="pd-backdrop"></div>
    <div class="pd-dialog">
      <header class="pd-header">
        <div>
          <h2 class="pd-title">Product Details</h2>
          <p class="pd-subtitle">View detailed information about this product</p>
        </div>
        <button class="pd-close" type="button" aria-label="Close">✕</button>
      </header>

      <section class="pd-body">
        <div class="pd-image-wrap">
          <a href="${url}" target="_blank" rel="noopener">
            <img src="${imgSrc}" alt="${name}">
          </a>
        </div>

        <div class="pd-info">
          <h3 class="pd-product-name">${name}</h3>

          <div class="pd-chips">
            ${
              priceText
                ? `<span class="pd-chip pd-chip-price">${priceText}</span>`
                : ''
            }
            ${
              vendor
                ? `<span class="pd-chip pd-chip-vendor">${vendorLabel}</span>`
                : ''
            }
          </div>

          <div class="pd-specs">
            ${
              color
                ? `<p><strong>Szín:</strong> ${color}</p>`
                : ''
            }
            ${
              size
                ? `<p><strong>Méret:</strong> ${size}</p>`
                : ''
            }
            ${
              material
                ? `<p><strong>Anyag:</strong> ${material}</p>`
                : ''
            }
            ${
              shipping
                ? `<p><strong>Szállítás:</strong> ${shipping}</p>`
                : ''
            }
          </div>

          ${
            otherInfo
              ? `<p class="pd-description">${otherInfo}</p>`
              : ''
          }
        </div>
      </section>

      <footer class="pd-footer">
        <a class="pd-btn pd-btn-primary" href="${url}" target="_blank" rel="noopener">
          <span class="pd-btn-icon">🔗</span>
          <span>Visit ${vendorLabel}</span>
        </a>

        <button class="pd-btn pd-btn-secondary pd-fav-btn" type="button">
          <span class="pd-btn-icon">♥</span>
          <span class="pd-fav-label">Add to favourites</span>
        </button>
      </footer>
    </div>
  `;

  // overlay megjelenítése
  overlay.classList.add('open');

  const dialog = overlay.querySelector('.pd-dialog');
  const backdrop = overlay.querySelector('.pd-backdrop');
  const closeBtn = overlay.querySelector('.pd-close');

  function closeModal() {
    overlay.classList.remove('open');
    overlay.innerHTML = '';
  }

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') closeModal();
    },
    { once: true }
  );

  // Kedvencek gomb – az eredeti szív-gombot használjuk a kártyán
  const favModalBtn = overlay.querySelector('.pd-fav-btn');
  const favModalLabel = overlay.querySelector('.pd-fav-label');

  if (!favBtn) {
    // ha nincs kedvenc-gomb (pl. nem bejelentkezett user), rejtsük el
    favModalBtn.style.display = 'none';
  } else {
    const syncFavLabel = () => {
      if (favBtn.classList.contains('favourited')) {
        favModalLabel.textContent = 'Remove from favourites';
      } else {
        favModalLabel.textContent = 'Add to favourites';
      }
    };

    syncFavLabel();

    favModalBtn.addEventListener('click', () => {
      favBtn.click(); // ugyanazt a logikát használja, mint a listában
      syncFavLabel();
    });
  }
}
