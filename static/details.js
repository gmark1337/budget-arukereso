
// Fordítószótár a modalhoz (hu / en) 
const DETAILS_I18N = {
  en: {
    header: 'Product Details',
    subtitle: 'View detailed information about this product',
    discounted: 'Discounted price',
    original: 'Original price',
    price: 'Price',
    color: 'Color',
    shipping: 'Shipping',
    material: 'Material',
    visit: 'Visit',
    addFav: 'Add to favourites',
    removeFav: 'Remove from favourites',
  },
  hu: {
    header: 'Termék részletei',
    subtitle: 'Részletes információk erről a termékről',
    discounted: 'Akciós ár',
    original: 'Eredeti ár',
    price: 'Ár',
    color: 'Szín',
    shipping: 'Szállítás',
    material: 'Anyag',
    visit: 'Megnyitás',
    addFav: 'Kedvencekhez adás',
    removeFav: 'Kedvencekből eltávolítás',
  },
};
function formatPrice(value) {
  if (!value) return '';

  const text = String(value);


  const match = text.match(/(\d[\d\s.]*)/);
  if (!match) return text;   // ha nem talál semmit, hagyjuk eredetiben

  // minden nem számjegy törlése ebből a részletből
  const numeric = match[1].replace(/[^\d]/g, '');
  if (!numeric) return text;

  return `${numeric} Ft`;
}


function getDetailsTexts() {
  // lang globálisan jön index.ejs-ből – ha valamiért nincs, fallback: en
  const current = (typeof lang !== 'undefined' && DETAILS_I18N[lang])
    ? DETAILS_I18N[lang]
    : DETAILS_I18N.en;
  return current;
}

function normalizePriceText(str) {
  if (!str) return '';
  const digits = String(str).match(/\d+/g);
  if (!digits) return '';
  return digits.join('') + ' Ft';
}

function detailsListeners() {
  for (const img of document.querySelectorAll('div.item img')) {
    img.addEventListener('click', async () => {
      const url = getUrlFromPathClass(img);
      if (!url) return;

      const r = await fetch('/details?' + new URLSearchParams({ url }));
      const d = JSON.parse((await r.text()) || '{}');

      const product = document.querySelector('#product-details');
      if (!product) return;

      const L = getDetailsTexts();

      // Kártya, vendor, cím, kártya-ár
      const card = img.closest('.item');
      const vendor =
        card?.closest('fieldset')?.querySelector('legend')?.innerText || '';

      const title =
        card?.querySelector('.title')?.innerText ||
        d.name ||
        'Product';

      const cardPriceText =
        card?.querySelector('.price .chip')?.innerText ||
        d.discountPrice ||
        d.originalPrice ||
        '';

      //  ÁRAK NORMALIZÁLÁSA 
      const origPrice = normalizePriceText(d.originalPrice);
      const discPrice = normalizePriceText(d.discountPrice);
      const fallbackPrice = normalizePriceText(cardPriceText);

      const specLines = [];

      // Ár-sorok a leírásrész elejére
      if (discPrice && origPrice && discPrice !== origPrice) {
        specLines.push(
          `<p class="pd-line"><strong>${L.discounted}:</strong> ${discPrice}</p>`
        );
        specLines.push(
          `<p class="pd-line"><strong>${L.original}:</strong> ${origPrice}</p>`
        );
      } else if (origPrice || discPrice || fallbackPrice) {
        const onePrice = discPrice || origPrice || fallbackPrice;
        specLines.push(
          `<p class="pd-line"><strong>${L.price}:</strong> ${onePrice}</p>`
        );
      }

      // Egyéb specifikációk
      if (d.color) {
        specLines.push(
          `<p class="pd-line"><strong>${L.color}:</strong> ${d.color}</p>`
        );
      }
      if (d.shipping) {
        specLines.push(
          `<p class="pd-line"><strong>${L.shipping}:</strong> ${d.shipping}</p>`
        );
      }
      if (d.material) {
        specLines.push(
          `<p class="pd-line"><strong>${L.material}:</strong> ${d.material}</p>`
        );
      }

      const description = d.otherInformation || '';

      //  MODAL HTML 
      product.innerHTML = `
        <div class="pd-backdrop"></div>
        <div class="pd-dialog">
          <div class="pd-header">
            <div>
              <h2 class="pd-title">${L.header}</h2>
              <p class="pd-subtitle">
                ${L.subtitle}
              </p>
            </div>
            <button class="pd-close" type="button" aria-label="Close">×</button>
          </div>

          <div class="pd-body">
            <div class="pd-image-wrap">
                <img src="${img.src}" alt="">
            </div>

            <div class="pd-info">
              <h3 class="pd-product-name">${title}</h3>

              <div class="pd-chips">
                ${vendor ? `<span class="pd-chip pd-chip-vendor">${vendor}</span>` : ''}
              </div>

              <div class="pd-specs">
                ${specLines.join('')}
              </div>

              ${description ? `<p class="pd-description">${description}</p>` : ''}
            </div>
          </div>

          <div class="pd-footer">
            <a class="pd-btn pd-btn-primary" href="${url}" target="_blank" rel="noopener">
              <span class="pd-btn-icon">↗</span>
              <span>${L.visit} ${vendor || 'website'}</span>
            </a>
          </div>
        </div>
      `;

      product.classList.add('open');

      //  Bezárás (X, háttér, Esc) 
      const close = () => {
        product.classList.remove('open');
        product.innerHTML = '';
      };

      product.querySelector('.pd-backdrop')?.addEventListener('click', close);
      product.querySelector('.pd-close')?.addEventListener('click', close);

      const escHandler = (e) => {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      //  Kedvencek gomb a modalban (szinkron a kártya szívével) 
      const cardFavBtn = card?.querySelector('button.favourite-add');
      const modalFavBtn = product.querySelector('.pd-fav-toggle');

      if (cardFavBtn && modalFavBtn) {
        const syncFavLabel = () => {
          const iconSpan = modalFavBtn.querySelector('.pd-btn-icon');
          const textSpan = modalFavBtn.querySelector('span:last-child');
          const isFav = cardFavBtn.classList.contains('favourited');

          if (isFav) {
            iconSpan.textContent = '❤';
            textSpan.textContent = DETAILS_I18N[lang]?.removeFav || DETAILS_I18N.en.removeFav;
          } else {
            iconSpan.textContent = '♡';
            textSpan.textContent = DETAILS_I18N[lang]?.addFav || DETAILS_I18N.en.addFav;
          }
        };

        syncFavLabel();

        modalFavBtn.addEventListener('click', () => {
          cardFavBtn.click();
          syncFavLabel();
        });
      }

      // history frissítés 
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
  return '';
}
