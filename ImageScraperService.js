import puppeteer from 'puppeteer';
import {config} from './configuration/config.js';

const hervisWebsite = config.websites.hervis;

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function getImagesAsync(page, divSelector, linkSelector, priceSelector, priceFilter) {
	const items = await page.evaluate((tag1, tag2, tag3, pricefilterString, priceFilterFlag) => {
		const priceFilter = new RegExp(pricefilterString, 'i');
		const item = document.querySelector(tag1).querySelector(tag2).querySelectorAll('a');
		const prices = document.querySelector(tag1).querySelectorAll(tag3);
		return [...item].map((img, index) => {
			const imgs = img.querySelector('img');
			const priceElement = prices[index];
			const text = priceElement.textContent;
			const match = text.match(priceFilter);

			let price = null;
			if (match) {
				price = match[0].replaceAll(/\s/g, '');
			}

			return {
				href: img.href || null,
				src: imgs ? imgs.src : null,
				price,
			};
		});
	}, divSelector, linkSelector, priceSelector, priceFilter.source);

	return items;
}

async function encodeSearchItemAsync(searchedItem, url) {
	return `${url}${encodeURIComponent(searchedItem)}`;
}

async function fetchHervisImages(searchword, page, numberOfItemsToFetch) {
	const foundPage = await encodeSearchItemAsync(searchword, hervisWebsite.baseUrl);
	await page.goto(foundPage);

	await sleep(1500);

	const cookiedeny = await page.evaluateHandle((tag1, tag2) => {
		const host = document.querySelector(tag1);
		const shadow = host.shadowRoot;
		return shadow.querySelector(tag2);
	}, hervisWebsite.denyCookieSelector, hervisWebsite.shadowCookieDenyButton);

	await cookiedeny.click();
	await sleep(1500);
	const regex = /\s+(\d{1,3}(?:\s\d{3})*)/;
	const items = await getImagesAsync(page, hervisWebsite.wholePageSelector, hervisWebsite.urlTagSelector, hervisWebsite.priceTagSelector, regex);

	const selected = items.slice(0, numberOfItemsToFetch);
	const finalImages = {
		websiteName: 'Hervis',
		FoundImages: selected,
	};
	return finalImages;
}

export async function Search(searchword) {
	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: false,
	});

	const page = await browser.newPage();

	const hervisImages = await fetchHervisImages(searchword, page, 3);

	await browser.close();

	return hervisImages;
}
