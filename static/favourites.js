
function favouritesListeners() {
	for (const b of document.querySelectorAll('button.favourite-add')) {
		b.addEventListener('click', () => {
			if (b.classList.contains('favourited')) {
				removeFromFavourites(b);
			} else {
				addTofavourites(b);
			}
		});
	}
}

async function addTofavourites(b) {
	b.classList.add('favourited');
	const root = b.parentElement.parentElement;
	const vendor = root.parentElement.parentElement
		.querySelector('legend').innerText;
	const {href} = root.querySelector('a');
	const image = root.querySelector('img').src;
	const price = Number.parseInt(root.querySelector('span.chip').innerText);
	await fetch('/favourites', {
		method: 'POST',
		body: new URLSearchParams({
			vendor,
			href,
			image,
			price,
		}),
	});
	const idClass = await getNewItemId(image);
	b.classList.add(`id-${idClass}`);
}

async function getNewItemId(image) {
	const res = await fetch('/favourites?' + new URLSearchParams({id: image}));
	const text = await res.text();
	return JSON.parse(text).id || '';
}

async function removeFromFavourites(b) {
	b.classList.remove('favourited');
	for (const c of b.classList) {
		if (c.startsWith('id-')) {
			const id = c.split('id-')[1];
			await fetch(`/favourites/${id}`, {
				method: 'DELETE',
			});
		}
	}
}

/*// Needed when not logged in user is viewing the page
if (document.querySelector('.favourites-bar')) {
	document.querySelector('.favourites-bar').addEventListener('mouseenter', async () => {
		const favourites = document.querySelector('#favourites');
		await updateFavourites(favourites);
		registerFavouriteRemoveButtons();
		favourites.style.display = 'block';
	});

	document.querySelector('.favourites-bar').addEventListener('mouseleave', async () => {
		const favourites = document.querySelector('#favourites');
		favourites.style.display = 'none';
	});
} */

async function updateFavourites(favourites) {
	const res = await fetch('http://localhost:8080/favourites');
	favourites.innerHTML = await res.text();
}

function registerFavouriteRemoveButtons() {
	for (const b of document.querySelectorAll('.remove-favourites')) {
		b.addEventListener('click', async () => {
			let id = '';
			for (const c of b.classList) {
				if (c.startsWith('id-')) {
					id = c;
					break;
				}
			}

			await removeFromFavourites(b);
			updateHistory(document.querySelector('#favourites'));
			registerFavouriteRemoveButtons();
			document.querySelector(`.${id}`).classList.remove('favourited');
		});
	}
}
// --- Click toggle + outside/Escape close ---
const favBar = document.querySelector('.favourites-bar');
const favPanel = document.querySelector('#favourites');

function openFav() {
  favPanel.style.display = 'block';
  favBar?.classList.add('active');
}
function closeFav() {
  favPanel.style.display = 'none';
  favBar?.classList.remove('active');
}
async function toggleFav() {
  const visible = favPanel.style.display === 'block';
  if (visible) {
    closeFav();
  } else {
    await updateFavourites(favPanel);
    registerFavouriteRemoveButtons();
    openFav();
  }
}

if (favBar && favPanel) {
  // gomb kattintás
  favBar.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFav();
  });

  // bárhová kattintásra zár
  document.addEventListener('click', (e) => {
    if (!favPanel.contains(e.target) && !favBar.contains(e.target)) {
      closeFav();
    }
  });

  // Esc-re zár
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFav();
  });
}

