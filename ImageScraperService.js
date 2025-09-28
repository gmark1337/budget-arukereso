import puppeteer from 'puppeteer';

import { fetchHervisImagesAsync } from './models/Hervis.js';
import { fetchSportissimoImagesAsync } from './models/Sportissimo.js';
import { fetchSinsayImagesAsync } from './models/Sinsay.js';

export const filters = {
    minPrice: "4000",
    maxPrice: "5000",
	size:"M",
	numberOfPagesToFetch:{
		hervis: 1,
		sinsay: 2,
		sportissimo: 3
	},
	blackListedWebsite:[
		"sinsay"
	]
};



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

	const allImages = [];
	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: false,
	});


	const page = await browser.newPage();

	if(!filters.blackListedWebsite.includes("hervis")){
		const hervisImages = await fetchHervisImagesAsync(searchword, page, filters.numberOfPagesToFetch.hervis);
		allImages.push(hervisImages);
	}
	if(!filters.blackListedWebsite.includes("sportissimo")){
		const sportissimoImages = await fetchSportissimoImagesAsync(searchword, page, filters.numberOfPagesToFetch.sportissimo);
		allImages.push(sportissimoImages);
	}
	if(!filters.blackListedWebsite.includes("sinsay")){
		const sinsayImages = await fetchSinsayImagesAsync(searchword, page, filters.numberOfPagesToFetch.sinsay);
		allImages.push(sinsayImages);
	}

	await browser.close();
	
	return allImages;
}

//console.log(await Search("Kék felső"));









