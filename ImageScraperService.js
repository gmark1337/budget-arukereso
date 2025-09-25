import puppeteer from 'puppeteer';

import { fetchHervisImages } from './models/Hervis.js';
import { fetchSportissimoImages } from './models/Sportissimo.js';

export const filters = {
    minPrice: "3000",
    maxPrice: "16000",
	size:"M"
};

const allImages = [];


export async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getImagesAsync(page, divSelector, linkSelector, priceSelector, priceFilter, productImageSelector) {
	const items = await page.evaluate((tag1, tag2, tag3, pricefilterString, imageSelector) => {
		const priceFilter = new RegExp(pricefilterString, 'i');
		const item = document.querySelector(tag1).querySelector(tag2).querySelectorAll('a');
		const prices = document.querySelector(tag1).querySelectorAll(tag3);
		return [...item].map((img, index) => {
			const imgs = img.querySelector(imageSelector).querySelector('img');
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
	}, divSelector, linkSelector, priceSelector, priceFilter.source, productImageSelector);

	return items;
}


export async function Search(searchword) {
	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: false,
	});

    //console.log(await encodeSearchItemWithFilteringAsync(testSearchword, hervisWebsite.baseUrl, filters));

	const page = await browser.newPage();


	const hervisImages = await fetchHervisImages(searchword, page, 3);
	allImages.push(hervisImages);
	const sportissimoImages = await fetchSportissimoImages(searchword, page, 3);
	allImages.push(sportissimoImages);

	await browser.close();

	return allImages;
}

console.log(await Search("Kék felső"));

//https://www.hervis.hu/shop/search/kék%20felső?query=kék%20felső::sizesInStockplain:M:price:%5B3999.00%20-%2015870.00%5D
//https://www.hervis.hu/shop/search/Kék%20felső::sizesInStockplain:M:?query=Kék%20felső::price:%5B3000.00%20-%2016000.00%5D
