import puppeteer from 'puppeteer';

import { fetchHervisImages } from './models/Hervis.js';
import { fetchSportissimoImages } from './models/Sportissimo.js';
import { fetchSinsayImagesAsync } from './models/Sinsay.js';

export const filters = {
    minPrice: "4000",
    maxPrice: "5000",
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


	const page = await browser.newPage();


	//const hervisImages = await fetchHervisImages(searchword, page, 3);
	//allImages.push(hervisImages);
	//const sportissimoImages = await fetchSportissimoImages(searchword, page, 3);
	//allImages.push(sportissimoImages);
	const sinsayImages = await fetchSinsayImagesAsync(searchword, page, 3);
	//allImages.push(sinsayImages);

	
	await browser.close();
	
	return sinsayImages;
}

console.log(await Search("Kék felső"));







